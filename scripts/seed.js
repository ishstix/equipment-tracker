const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local
function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.substring(0, idx).trim();
    let value = line.substring(idx + 1).trim();
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  });
  return env;
}

const env = parseEnv(path.resolve(__dirname, '../.env.local'));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const equipment = [
  // ── CAMERA BODIES ──────────────────────────────────────────────────────────
  { name: 'Canon EOS C70', description: 'Cinema camera body', category: 'Camera Bodies', total_quantity: 2, available_quantity: 2, condition: 'good' },

  // ── LENSES — INDIVIDUAL ────────────────────────────────────────────────────
  { name: 'Sigma Art 24mm f/1.4 EF', description: 'Sigma Art prime lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sigma Art 35mm f/1.4 EF', description: 'Sigma Art prime lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sigma Art 50mm f/1.4 EF', description: 'Sigma Art prime lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sigma Art 85mm f/1.4 EF', description: 'Sigma Art prime lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sigma Art 135mm f/1.8 EF', description: 'Sigma Art prime lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon EF 16-35mm f/2.8L', description: 'Canon L-series wide zoom', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon EF 24-70mm f/2.8L', description: 'Canon L-series standard zoom', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon EF 70-200mm f/2.8L', description: 'Canon L-series telephoto zoom', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon EF 100mm Macro f/2.8L', description: 'Canon L-series macro lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'DZO Vespid 21mm T2.1', description: 'DZO cine prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'DZO Vespid 50mm T2.1', description: 'DZO cine prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'DZO Vespid 125mm T2.1', description: 'DZO cine prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Ironglass MIR-1V 37mm', description: 'Re-housed Soviet cine lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Ironglass Helios 44-2 58mm', description: 'Re-housed Soviet cine lens', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon FL 28mm f/3.5', description: 'Vintage Canon FL prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon FL 35mm f/3.5', description: 'Vintage Canon FL prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon FL 55mm f/1.2', description: 'Vintage Canon FL prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon FL 85mm f/1.8', description: 'Vintage Canon FL prime', category: 'Lenses', total_quantity: 1, available_quantity: 1, condition: 'good' },

  // ── LENS KITS ──────────────────────────────────────────────────────────────
  { name: 'EF Kit', description: 'Sigma Art: 24mm f/1.4, 35mm f/1.4, 50mm f/1.4, 85mm f/1.4, 135mm f/1.8 · Canon L: 16-35mm f/2.8, 24-70mm f/2.8, 70-200mm f/2.8, 100mm Macro f/2.8', category: 'Lens Kits', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'DZO Vespid Cine Kit', description: 'Includes: 21mm T2.1, 50mm T2.1, 125mm T2.1', category: 'Lens Kits', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'IronGlass Cine Kit', description: 'Includes: MIR-1V 37mm, Helios 44-2 58mm (re-housed Soviet cine lenses)', category: 'Lens Kits', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Canon FL Vintage Kit', description: 'Includes: 28mm f/3.5, 35mm f/3.5, 55mm f/1.2, 85mm f/1.8', category: 'Lens Kits', total_quantity: 1, available_quantity: 1, condition: 'good' },

  // ── CAMERA SUPPORT ─────────────────────────────────────────────────────────
  { name: 'Sachtler Video 18 MKII Tripod System', description: 'Professional fluid head tripod system', category: 'Camera Support', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Sachtler Video 18 S2 Tripod System', description: 'Professional fluid head tripod system', category: 'Camera Support', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Dana Dolly Rail Set', description: 'Includes 6ft, 8ft, and 10ft rails', category: 'Camera Support', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'DJI RS4 Pro Gimbal', description: 'With Tilta Advanced Ring', category: 'Camera Support', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'EasyRig Mini Max', description: 'Camera support vest system', category: 'Camera Support', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Ready Rig', description: 'Camera support rig', category: 'Camera Support', total_quantity: 1, available_quantity: 1, condition: 'good' },

  // ── CAMERA ACCESSORIES ─────────────────────────────────────────────────────
  { name: 'EF-EOS R Adapter 0.71x', description: 'Speed booster EF to RF mount adapter', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'EF-EOS R Standard Adapter', description: 'Standard EF to RF mount adapter', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Vocas PL Adapter', description: 'PL to RF mount adapter', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Bright Tangerine Misfit Kick Mattebox', description: 'With Rota Pola', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Tilta Mirage Mattebox', description: 'With Rota Pola', category: 'Camera Accessories', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Black Pro-Mist 5.65" 1/8 Filter', description: 'Diffusion filter', category: 'Camera Accessories', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: 'Black Pro-Mist 5.65" 1/4 Filter', description: 'Diffusion filter', category: 'Camera Accessories', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: 'Black Pro-Mist 4" 1/8 Filter', description: 'Diffusion filter', category: 'Camera Accessories', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: 'Black Pro-Mist 4" 1/4 Filter', description: 'Diffusion filter', category: 'Camera Accessories', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: '4" Circular Polarizer', description: 'Circular polarizer filter', category: 'Camera Accessories', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: 'Teradek Bolt 6 LT 750 Transmission Kit', description: '3G-SDI/HDMI wireless video transmitter/receiver', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Accsoon CineView SE', description: 'Wireless video system', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Tilta Nucleus-M', description: 'Wireless lens control system', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'DJI Focus Pro LiDAR Kit', description: 'With grip, hand unit, and 3 motors', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'SmallHD 2403 24" Production Monitor', description: '24-inch on-set production monitor', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'SmallHD Ultra 5 Monitor', description: '5-inch on-camera monitor', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Atomos Shogun Flame', description: '7" 4K HDMI/12-SDI recorder', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Atomos Ninja V', description: '5" 4K HDMI recorder with AtomX SDI module', category: 'Camera Accessories', total_quantity: 1, available_quantity: 1, condition: 'good' },

  // ── AUDIO ──────────────────────────────────────────────────────────────────
  { name: 'Sennheiser MKH 50 P48', description: 'Super-cardioid condenser microphone', category: 'Audio', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sennheiser MKH 416', description: 'Shotgun condenser microphone', category: 'Audio', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sennheiser MKE 600', description: 'Shotgun microphone', category: 'Audio', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Boom Pole', description: 'Microphone boom pole', category: 'Audio', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Deity Theos Wireless System', description: '2-channel wireless microphone system', category: 'Audio', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Sanken COS-11D Lavalier', description: 'Omni lavalier microphone', category: 'Audio', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Sennheiser EW 112P G4 Wireless Lav System', description: 'Wireless lavalier microphone system', category: 'Audio', total_quantity: 3, available_quantity: 3, condition: 'good' },
  { name: 'Zoom F8n Field Recorder', description: '8-input / 10-track field recorder', category: 'Audio', total_quantity: 1, available_quantity: 1, condition: 'good' },

  // ── LIGHTS ─────────────────────────────────────────────────────────────────
  { name: 'Aputure LS 600d', description: 'Daylight LED monolight', category: 'Lights', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Aputure LS 300d II', description: 'Daylight LED monolight', category: 'Lights', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Aputure LS 300x', description: 'Bi-color LED monolight', category: 'Lights', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Aputure LS 60d', description: 'Daylight LED focusing flood light', category: 'Lights', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Aputure LS 60x', description: 'Bi-color LED focusing flood light', category: 'Lights', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Aputure MT Pro', description: 'RGB tube light', category: 'Lights', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Amaran 300c', description: 'RGB LED monolight', category: 'Lights', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: "Amaran F22c 2x2' Flexible Mat", description: 'RGB flexible light mat, V-Mount', category: 'Lights', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Aputure Accent B7C 8-Light Kit', description: 'RGBWW bulb kit with case', category: 'Lights', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Aputure MC 4-Light Charging Kit', description: 'Pocket RGB LED kit', category: 'Lights', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: 'Litepanels Gemini 1x1 Panel', description: 'Soft RGB LED panel', category: 'Lights', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Litepanels Astra 4X Panel', description: 'Bi-color LED panel', category: 'Lights', total_quantity: 2, available_quantity: 2, condition: 'good' },

  // ── GRIP ───────────────────────────────────────────────────────────────────
  { name: 'Combo Stand', description: 'Heavy duty combo stand', category: 'Grip', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'C-Stand', description: 'Century stand', category: 'Grip', total_quantity: 9, available_quantity: 9, condition: 'good' },
  { name: 'Apple Box Family', description: 'Full, half, quarter, and pancake', category: 'Grip', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Avenger Junior Roller Low Boy', description: 'With combo head', category: 'Grip', total_quantity: 3, available_quantity: 3, condition: 'good' },
  { name: 'Light Stand', description: 'Standard light stand', category: 'Grip', total_quantity: 8, available_quantity: 8, condition: 'good' },
  { name: '6x6 Frame Set', description: 'Includes: solid, UltraBounce, 1/4 grid, silk', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: '8x8 Frame Set', description: 'Includes: solid, full diffusion', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: '24x36 Flag Kit', description: 'Includes flags and rods', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: '18x24 Flag Kit', description: 'Includes flags and rods', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: '4x4 Floppy', description: 'Black floppy flag', category: 'Grip', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: '4x4 UltraBounce Floppy', description: 'UltraBounce floppy flag', category: 'Grip', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: "Speed Rail Pair 10'", description: '10-foot speed rail pair', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: "Speed Rail Pair 8'", description: '8-foot speed rail pair', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: "Speed Rail Pair 4'", description: '4-foot speed rail pair', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
  { name: '20" Grip Arm', description: 'Grip arm with baby pin', category: 'Grip', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Cardellini Clamp', description: 'Side-action clamp', category: 'Grip', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: 'Mafer Clamp', description: 'Mafer clamp with baby pin', category: 'Grip', total_quantity: 3, available_quantity: 3, condition: 'good' },
  { name: 'Drop Ceiling Scissor Clamp Mount', description: 'For drop ceiling grid mounting', category: 'Grip', total_quantity: 2, available_quantity: 2, condition: 'good' },
  { name: 'Drop Ceiling Scissor Clamp Cable Support', description: 'Cable support for drop ceiling', category: 'Grip', total_quantity: 4, available_quantity: 4, condition: 'good' },
  { name: 'Matthews Quacker Clamp', description: 'Versatile grip clamp', category: 'Grip', total_quantity: 1, available_quantity: 1, condition: 'good' },
];

async function seed() {
  console.log('🗑  Clearing existing equipment...');
  const { error: deleteError } = await supabase
    .from('equipment')
    .delete()
    .gte('total_quantity', 0);

  if (deleteError) {
    console.error('Error clearing equipment:', deleteError.message);
    process.exit(1);
  }

  console.log(`🌱 Inserting ${equipment.length} items...\n`);
  let success = 0;
  let failed = 0;

  for (const item of equipment) {
    const { error } = await supabase.from('equipment').insert(item);
    if (error) {
      console.error(`  ✗ ${item.name}: ${error.message}`);
      failed++;
    } else {
      console.log(`  ✓ ${item.name}`);
      success++;
    }
  }

  console.log(`\n✅ Done! ${success} items added${failed > 0 ? `, ${failed} failed` : ''}.`);
}

seed().catch(console.error);
