// Builds public/media/posts/kiddycody/hero-logo-terrain.png
//
// Composite thumbnail for the KiddyCody post. Shows both the final logo and
// the voxel-engine terrain in one frame:
//   - 1600x840 canvas (matches the publishing plan's hero-banner spec).
//   - Voxel terrain fills the full canvas (resized with "cover" semantics).
//   - Cream paper panel in the lower-left with the logo centered on it,
//     sized so the logo reads cleanly at card thumbnail sizes.

const sharp = require('../node_modules/.pnpm/sharp@0.34.5/node_modules/sharp');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'media', 'posts', 'kiddycody');
const TERRAIN = path.join(BASE, 'voxel-engine-cli.png');
const LOGO = path.join(BASE, 'kiddycody-final-logo.png');
const OUT = path.join(BASE, 'hero-logo-terrain.png');

// 1600x800 -> exact 2:1 to match the PostCard's aspect-[2/1] crop and avoid
// losing the logo panel edge on listing pages.
const W = 1600;
const H = 800;

// Logo panel: paper-cream rectangle in the bottom-left, with the logo on top.
const PANEL_W = 520;
const PANEL_H = 400;
const PANEL_X = 60;
const PANEL_Y = H - PANEL_H - 60; // 60px margin from bottom
const PANEL_PAD = 28;

// Logo sized to fit inside the panel with padding, keeping aspect (600x487).
const LOGO_TARGET_W = PANEL_W - PANEL_PAD * 2;
const LOGO_TARGET_H = Math.round(LOGO_TARGET_W * (487 / 600));

async function main() {
  // 1) Background: terrain resized to cover the full 1600x840 canvas.
  const terrain = await sharp(TERRAIN)
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .png()
    .toBuffer();

  // 2) Cream panel with a hairline border (as an SVG layer so we get the
  //    broadsheet feel: thin ink line + subtle offset shadow).
  const panelSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${PANEL_W + 6}" height="${PANEL_H + 6}">
      <!-- offset drop shadow block, in the same house style as .chaos-card -->
      <rect x="3" y="3" width="${PANEL_W}" height="${PANEL_H}" fill="rgba(26,18,8,0.35)" />
      <rect x="0" y="0" width="${PANEL_W}" height="${PANEL_H}" fill="#f4ecdc" stroke="#1a1208" stroke-width="1.5" />
    </svg>
  `);

  // 3) Logo resized to fit inside the panel padding.
  const logo = await sharp(LOGO)
    .resize(LOGO_TARGET_W, LOGO_TARGET_H, { fit: 'inside' })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const logoX = PANEL_X + Math.round((PANEL_W - logoMeta.width) / 2);
  const logoY = PANEL_Y + Math.round((PANEL_H - logoMeta.height) / 2);

  await sharp(terrain)
    .composite([
      { input: panelSvg, top: PANEL_Y - 3, left: PANEL_X - 3 },
      { input: logo, top: logoY, left: logoX },
    ])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log('wrote', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
