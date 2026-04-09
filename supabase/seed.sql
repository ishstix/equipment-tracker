-- IndyBrain Equipment Inventory Seed
-- Run this in Supabase SQL Editor AFTER running schema.sql and add_image_url.sql

INSERT INTO equipment (name, description, category, total_quantity, available_quantity, condition) VALUES

-- ─── CAMERA BODIES ────────────────────────────────────────────────────────────
('Canon EOS C70', 'Cinema camera body', 'Camera Bodies', 2, 2, 'good'),

-- ─── LENS ADAPTERS ────────────────────────────────────────────────────────────
('EF-EOS R Adapter 0.71x', 'Speed booster adapter', 'Camera Accessories', 1, 1, 'good'),
('EF-EOS R Standard Adapter', 'Standard EF to RF mount adapter', 'Camera Accessories', 1, 1, 'good'),
('Vocas PL Adapter', 'PL to RF mount adapter', 'Camera Accessories', 1, 1, 'good'),

-- ─── LENSES — INDIVIDUAL ──────────────────────────────────────────────────────
('Sigma Art 24mm f/1.4 EF', 'Sigma Art prime lens', 'Lenses', 1, 1, 'good'),
('Sigma Art 35mm f/1.4 EF', 'Sigma Art prime lens', 'Lenses', 1, 1, 'good'),
('Sigma Art 50mm f/1.4 EF', 'Sigma Art prime lens', 'Lenses', 1, 1, 'good'),
('Sigma Art 85mm f/1.4 EF', 'Sigma Art prime lens', 'Lenses', 1, 1, 'good'),
('Sigma Art 135mm f/1.8 EF', 'Sigma Art prime lens', 'Lenses', 1, 1, 'good'),
('Canon EF 16-35mm f/2.8L', 'Canon L-series wide zoom', 'Lenses', 1, 1, 'good'),
('Canon EF 24-70mm f/2.8L', 'Canon L-series standard zoom', 'Lenses', 1, 1, 'good'),
('Canon EF 70-200mm f/2.8L', 'Canon L-series telephoto zoom', 'Lenses', 1, 1, 'good'),
('Canon EF 100mm Macro f/2.8L', 'Canon L-series macro lens', 'Lenses', 1, 1, 'good'),
('DZO Vespid 21mm T2.1', 'DZO cine prime', 'Lenses', 1, 1, 'good'),
('DZO Vespid 50mm T2.1', 'DZO cine prime', 'Lenses', 1, 1, 'good'),
('DZO Vespid 125mm T2.1', 'DZO cine prime', 'Lenses', 1, 1, 'good'),
('Ironglass MIR-1V 37mm', 'Re-housed Soviet cine lens', 'Lenses', 1, 1, 'good'),
('Ironglass Helios 44-2 58mm', 'Re-housed Soviet cine lens', 'Lenses', 1, 1, 'good'),
('Canon FL 28mm f/3.5', 'Vintage Canon FL prime', 'Lenses', 1, 1, 'good'),
('Canon FL 35mm f/3.5', 'Vintage Canon FL prime', 'Lenses', 1, 1, 'good'),
('Canon FL 55mm f/1.2', 'Vintage Canon FL prime', 'Lenses', 1, 1, 'good'),
('Canon FL 85mm f/1.8', 'Vintage Canon FL prime', 'Lenses', 1, 1, 'good'),

-- ─── LENSES — KITS ────────────────────────────────────────────────────────────
('Sigma Art EF Kit', 'Includes: 24mm f/1.4, 35mm f/1.4, 50mm f/1.4, 85mm f/1.4, 135mm f/1.8', 'Lens Kits', 1, 1, 'good'),
('Canon EF Kit', 'Includes: 16-35mm f/2.8L, 24-70mm f/2.8L, 70-200mm f/2.8L, 100mm Macro f/2.8L', 'Lens Kits', 1, 1, 'good'),
('DZO Vespid Cine Kit', 'Includes: 21mm T2.1, 50mm T2.1, 125mm T2.1', 'Lens Kits', 1, 1, 'good'),
('IronGlass Cine Kit', 'Includes: MIR-1V 37mm, Helios 44-2 58mm (re-housed Soviet cine lenses)', 'Lens Kits', 1, 1, 'good'),
('Canon FL Vintage Kit', 'Includes: 28mm f/3.5, 35mm f/3.5, 55mm f/1.2, 85mm f/1.8', 'Lens Kits', 1, 1, 'good'),

-- ─── CAMERA SUPPORT ───────────────────────────────────────────────────────────
('Sachtler Video 18 MKII Tripod System', 'Professional fluid head tripod system', 'Camera Support', 2, 2, 'good'),
('Sachtler Video 18 S2 Tripod System', 'Professional fluid head tripod system', 'Camera Support', 1, 1, 'good'),
('Dana Dolly Rail Set', 'Includes 6ft, 8ft, and 10ft rails', 'Camera Support', 1, 1, 'good'),
('DJI RS4 Pro Gimbal', 'With Tilta Advanced Ring', 'Camera Support', 1, 1, 'good'),
('EasyRig Mini Max', 'Camera support vest system', 'Camera Support', 1, 1, 'good'),
('Ready Rig', 'Camera support rig', 'Camera Support', 1, 1, 'good'),

-- ─── CAMERA ACCESSORIES ───────────────────────────────────────────────────────
('Bright Tangerine Misfit Kick Mattebox', 'With Rota Pola', 'Camera Accessories', 1, 1, 'good'),
('Tilta Mirage Mattebox', 'With Rota Pola', 'Camera Accessories', 2, 2, 'good'),
('Black Pro-Mist 5.65" 1/8 Filter', 'Diffusion filter', 'Camera Accessories', 4, 4, 'good'),
('Black Pro-Mist 5.65" 1/4 Filter', 'Diffusion filter', 'Camera Accessories', 4, 4, 'good'),
('Black Pro-Mist 4" 1/8 Filter', 'Diffusion filter', 'Camera Accessories', 4, 4, 'good'),
('Black Pro-Mist 4" 1/4 Filter', 'Diffusion filter', 'Camera Accessories', 4, 4, 'good'),
('4" Circular Polarizer', 'Circular polarizer filter', 'Camera Accessories', 4, 4, 'good'),
('Teradek Bolt 6 LT 750 Transmission Kit', '3G-SDI/HDMI wireless video transmitter/receiver', 'Camera Accessories', 1, 1, 'good'),
('Accsoon CineView SE', 'Wireless video system', 'Camera Accessories', 1, 1, 'good'),
('Tilta Nucleus-M', 'Wireless lens control system', 'Camera Accessories', 1, 1, 'good'),
('DJI Focus Pro LiDAR Kit', 'With grip, hand unit, and 3 motors', 'Camera Accessories', 1, 1, 'good'),
('SmallHD 2403 24" Production Monitor', '24-inch production monitor', 'Camera Accessories', 1, 1, 'good'),
('SmallHD Ultra 5 Monitor', '5-inch on-camera monitor', 'Camera Accessories', 1, 1, 'good'),
('Atomos Shogun Flame', '7" 4K HDMI/12-SDI recorder', 'Camera Accessories', 1, 1, 'good'),
('Atomos Ninja V', '5" 4K HDMI recorder with AtomX SDI module', 'Camera Accessories', 1, 1, 'good'),

-- ─── AUDIO ────────────────────────────────────────────────────────────────────
('Sennheiser MKH 50 P48', 'Super-cardioid condenser microphone', 'Audio', 1, 1, 'good'),
('Sennheiser MKH 416', 'Shotgun condenser microphone', 'Audio', 1, 1, 'good'),
('Sennheiser MKE 600', 'Shotgun microphone', 'Audio', 1, 1, 'good'),
('Boom Pole', 'Microphone boom pole', 'Audio', 1, 1, 'good'),
('Deity Theos Wireless System', '2-channel wireless microphone system', 'Audio', 1, 1, 'good'),
('Sanken COS-11D Lavalier', 'Omni lavalier microphone', 'Audio', 2, 2, 'good'),
('Sennheiser EW 112P G4 Wireless Lav System', 'Wireless lavalier system', 'Audio', 3, 3, 'good'),
('Zoom F8n Field Recorder', '8-input / 10-track field recorder', 'Audio', 1, 1, 'good'),

-- ─── LIGHTS ───────────────────────────────────────────────────────────────────
('Aputure LS 600d', 'Daylight LED monolight', 'Lights', 1, 1, 'good'),
('Aputure LS 300d II', 'Daylight LED monolight', 'Lights', 1, 1, 'good'),
('Aputure LS 300x', 'Bi-color LED monolight', 'Lights', 1, 1, 'good'),
('Aputure LS 60d', 'Daylight LED focusing flood light', 'Lights', 2, 2, 'good'),
('Aputure LS 60x', 'Bi-color LED focusing flood light', 'Lights', 2, 2, 'good'),
('Aputure MT Pro', 'RGB tube light', 'Lights', 2, 2, 'good'),
('Amaran 300c', 'RGB LED monolight', 'Lights', 2, 2, 'good'),
('Amaran F22c 2x2'' Flexible Mat', 'RGB flexible light mat, V-Mount', 'Lights', 1, 1, 'good'),
('Aputure Accent B7C 8-Light Kit', 'RGBWW bulb kit with case', 'Lights', 1, 1, 'good'),
('Aputure MC 4-Light Charging Kit', 'Pocket RGB LED kit', 'Lights', 1, 1, 'good'),
('Litepanels Gemini 1x1 Panel', 'Soft RGB LED panel', 'Lights', 2, 2, 'good'),
('Litepanels Astra 4X Panel', 'Bi-color LED panel', 'Lights', 2, 2, 'good'),

-- ─── GRIP ─────────────────────────────────────────────────────────────────────
('Combo Stand', 'Heavy duty combo stand', 'Grip', 2, 2, 'good'),
('C-Stand', 'Century stand', 'Grip', 9, 9, 'good'),
('Apple Box Family', 'Full, half, quarter, and pancake', 'Grip', 2, 2, 'good'),
('Avenger Junior Roller Low Boy', 'With combo head', 'Grip', 3, 3, 'good'),
('Light Stand', 'Standard light stand', 'Grip', 8, 8, 'good'),
('6x6 Frame Set', 'Includes: solid, UltraBounce, 1/4 grid, silk', 'Grip', 1, 1, 'good'),
('8x8 Frame Set', 'Includes: solid, full diffusion', 'Grip', 1, 1, 'good'),
('24x36 Flag Kit', 'Includes flags and rods', 'Grip', 1, 1, 'good'),
('18x24 Flag Kit', 'Includes flags and rods', 'Grip', 1, 1, 'good'),
('4x4 Floppy', 'Black floppy flag', 'Grip', 2, 2, 'good'),
('4x4 UltraBounce Floppy', 'UltraBounce floppy flag', 'Grip', 2, 2, 'good'),
('Speed Rail Pair 10''', '10-foot speed rail pair', 'Grip', 1, 1, 'good'),
('Speed Rail Pair 8''', '8-foot speed rail pair', 'Grip', 1, 1, 'good'),
('Speed Rail Pair 4''', '4-foot speed rail pair', 'Grip', 1, 1, 'good'),
('20" Grip Arm', 'Grip arm with baby pin', 'Grip', 2, 2, 'good'),
('Cardellini Clamp', 'Side-action clamp', 'Grip', 4, 4, 'good'),
('Mafer Clamp', 'Mafer clamp with baby pin', 'Grip', 3, 3, 'good'),
('Drop Ceiling Scissor Clamp Mount', 'For drop ceiling grid mounting', 'Grip', 2, 2, 'good'),
('Drop Ceiling Scissor Clamp Cable Support', 'Cable support for drop ceiling', 'Grip', 4, 4, 'good'),
('Matthews Quacker Clamp', 'Versatile grip clamp', 'Grip', 1, 1, 'good');
