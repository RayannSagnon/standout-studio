// Captures the client sites shown on Work and in the case studies.
//
//   node scripts/capture-work.mjs            all projects
//   node scripts/capture-work.mjs <slug>     one project
//
// For each project it writes, in public/work/<slug>/:
//   desktop.webp  first screen, 1440 x 900 at 2x (Work, case study hero, next project)
//   page.webp     the whole page, 1440 wide at 1x (scrollable browser window in the case study)
//   mobile.webp   the whole page, 390 wide at 2x (scrollable phone in the case study)
//
// Set PW_CHROMIUM to a Chromium binary if Playwright's own browser is not installed.

import { chromium } from "playwright";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outRoot = path.join(__dirname, "..", "public", "work");

const TARGETS = [
  { slug: "caramello-cafe", url: "https://www.caramellocafe.ca/" },
  { slug: "relentless-ritchie", url: "https://cozy-hotteok-6aa630.netlify.app/" },
  { slug: "rayann-sagnon", url: "https://rayannsagnon.com" },
  { slug: "steven-atchall", url: "https://stevenatchall.com" },
];

// In CSS pixels. Long pages are cut there: past it a preview stops being useful.
const MAX_PAGE_HEIGHT = 8000;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Scroll the whole page slowly so lazy images load and scroll reveals play.
async function warmUp(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    const max = () => document.documentElement.scrollHeight;
    for (let y = 0; y < max(); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
  });
  await wait(1200);
}

// Freeze motion so the full-page capture does not catch half-played animations.
const STILL = `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}`;

async function open(browser, url, viewport, scale) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale, reducedMotion: "no-preference" });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => page.goto(url, { waitUntil: "load", timeout: 60000 }));
  await wait(2500);
  return page;
}

// Whole page, cut at MAX_PAGE_HEIGHT (Chrome cannot capture past ~16k device pixels).
async function fullShot(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const { width } = page.viewportSize();
  return page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(h, MAX_PAGE_HEIGHT) } });
}

// Some pages end in a long empty band (spacers, unplayed pinned sections): cut it.
async function trimBottom(buffer) {
  const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rowIsFlat = (y) => {
    const o = y * width * channels;
    for (let x = 0; x < width * channels; x += channels * 4)
      for (let c = 0; c < 3; c++) if (Math.abs(data[o + x + c] - data[o + c]) > 10) return false;
    return true;
  };
  let bottom = height;
  while (bottom > 1 && rowIsFlat(bottom - 1)) bottom--;
  const keep = Math.min(height, bottom + Math.round(width * 0.04));
  return keep < height ? sharp(buffer).extract({ left: 0, top: 0, width, height: keep }).toBuffer() : buffer;
}

async function toWebp(buffer, file, { width, quality = 82, trim = false } = {}) {
  let img = sharp(trim ? await trimBottom(buffer) : buffer);
  const meta = await img.metadata();
  if (width && meta.width !== width) img = img.resize({ width });
  await img.webp({ quality, effort: 6 }).toFile(file);
  const out = await sharp(file).metadata();
  console.log(`  ${path.relative(outRoot, file)}  ${out.width}x${out.height}  ${Math.round(fs.statSync(file).size / 1024)} KB`);
}

async function capture(browser, { slug, url }) {
  const dir = path.join(outRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  console.log(`${slug} <- ${url}`);

  // Desktop: first screen at 2x
  const desk = await open(browser, url, { width: 1440, height: 900 }, 2);
  await warmUp(desk);
  await wait(3500); // let intro effects (text scrambles, counters) settle after scrolling back up
  await toWebp(await desk.screenshot(), path.join(dir, "desktop.webp"), { quality: 84 });
  await desk.close();

  // Desktop: the whole page at 1x (2x is past Chrome's capture limit on long pages)
  const full = await open(browser, url, { width: 1440, height: 900 }, 1);
  await warmUp(full);
  await full.addStyleTag({ content: STILL });
  await wait(400);
  await toWebp(await fullShot(full), path.join(dir, "page.webp"), { trim: true });
  await full.close();

  // Mobile: the whole page
  const mob = await open(browser, url, { width: 390, height: 844 }, 2);
  await warmUp(mob);
  await mob.addStyleTag({ content: STILL });
  await wait(400);
  await toWebp(await fullShot(mob), path.join(dir, "mobile.webp"), { trim: true });
  await mob.close();
}

const only = process.argv[2];
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
for (const t of TARGETS.filter((t) => !only || t.slug === only)) {
  try {
    await capture(browser, t);
  } catch (err) {
    console.error(`  failed: ${err.message}`);
  }
}
await browser.close();
