import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "work");

fs.mkdirSync(outDir, { recursive: true });

const targets = [
  {
    id: "caramello",
    url: "https://www.caramellocafe.ca/",
  },
  {
    id: "sharp",
    url: "https://cozy-hotteok-6aa630.netlify.app/",
  },
  {
    id: "rayann",
    url: "https://rayannsagnon.com",
  },
  {
    id: "steven",
    url: "https://stevenatchall.com",
  },
  {
    id: "ori-atelier",
    url: "https://ori-atelier.vercel.app/",
  },
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const item of targets) {
    console.log(`Processing ${item.id} -> ${item.url}...`);
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    try {
      await page.goto(item.url, { waitUntil: "networkidle", timeout: 45000 }).catch(async () => {
        await page.goto(item.url, { waitUntil: "domcontentloaded", timeout: 30000 });
      });
      await page.waitForTimeout(2000);

      // Desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(outDir, `${item.id}-desktop.webp`),
        type: "webp",
        quality: 85,
        clip: { x: 0, y: 0, width: 1440, height: 860 },
      });

      // Mobile
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(outDir, `${item.id}-mobile.webp`),
        type: "webp",
        quality: 85,
        clip: { x: 0, y: 0, width: 390, height: 600 },
      });
      console.log(`✓ Captured ${item.id}`);
    } catch (err) {
      console.error(`Failed ${item.id}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("All screenshots processed in public/work/");
}

run();
