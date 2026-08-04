import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "mockups", "screens");

async function shot(page, htmlName, pngName) {
  const fileUrl = pathToFileURL(path.join(root, htmlName)).href;
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(root, pngName),
    type: "png",
    clip: { x: 0, y: 0, width: 390, height: 844 },
  });
}

fs.mkdirSync(root, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 3 });
await shot(page, "alex-morgan-screen.html", "alex-morgan-screen.png");
await shot(page, "riverdale-screen.html", "riverdale-screen.png");
await browser.close();
console.log("Wrote:");
console.log(" -", path.join(root, "alex-morgan-screen.png"));
console.log(" -", path.join(root, "riverdale-screen.png"));
