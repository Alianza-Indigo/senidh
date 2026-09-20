import { readFile } from "fs/promises";
import { join } from "path";
import QRCode from "qrcode";
import sharp from "sharp";

const QR_SIZE = 1200;
const LOGO_SIZE = 384;
const PLATE_SIZE = 444;
let logoSource: Promise<Buffer> | undefined;

function loadLogo() {
  logoSource ??= readFile(join(process.cwd(), "public", "assets", "logo-senidh.webp"));
  return logoSource;
}

export async function brandedQrDataUrl(value: string) {
  const [qrBuffer, logoBuffer] = await Promise.all([
    QRCode.toBuffer(value, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: QR_SIZE,
      color: { dark: "#071b35", light: "#ffffff" }
    }),
    loadLogo()
  ]);

  const mask = Buffer.from(`<svg width="${LOGO_SIZE}" height="${LOGO_SIZE}"><circle cx="${LOGO_SIZE / 2}" cy="${LOGO_SIZE / 2}" r="${LOGO_SIZE / 2}" fill="#fff"/></svg>`);
  const plate = Buffer.from(`<svg width="${PLATE_SIZE}" height="${PLATE_SIZE}"><circle cx="${PLATE_SIZE / 2}" cy="${PLATE_SIZE / 2}" r="${PLATE_SIZE / 2 - 7}" fill="#fff" stroke="#c7a254" stroke-width="10"/></svg>`);
  const logo = await sharp(logoBuffer)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const brandedQr = await sharp(qrBuffer)
    .composite([
      { input: plate, gravity: "centre" },
      { input: logo, gravity: "centre" }
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return `data:image/png;base64,${brandedQr.toString("base64")}`;
}
