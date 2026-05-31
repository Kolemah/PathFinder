import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "public/logo-pathpayx-clean.png";

async function makeIcon(size) {
  const cropped = await sharp(source)
    .extract({ left: 0, top: 0, width: 400, height: 420 })
    .png()
    .toBuffer();

  const mark = await sharp(cropped)
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .resize({
      width: Math.round(size * 0.86),
      height: Math.round(size * 0.86),
      fit: "inside",
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

const png32 = await makeIcon(32);
const png180 = await makeIcon(180);
const png512 = await makeIcon(512);

function makeIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, png]);
}

await writeFile("app/favicon.ico", makeIco(png32));
await writeFile("app/icon.png", png512);
await writeFile("app/apple-icon.png", png180);
await writeFile("public/pathpayx-icon.png", png512);
await writeFile("public/apple-icon.png", png180);
