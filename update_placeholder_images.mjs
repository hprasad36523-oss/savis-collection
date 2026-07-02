import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'backend', 'database.json');

const frockImages = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop'
];

const palazzoImages = [
  'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561932850-f13404855e53?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop'
];

const feedingImages = [
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop'
];

const cottonImages = [
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop'
];

function main() {
  if (!fs.existsSync(dbFile)) {
    console.error(`❌ Database file not found at: ${dbFile}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  
  let frockIdx = 0;
  let palazzoIdx = 0;
  let feedingIdx = 0;
  let cottonIdx = 0;
  let replacedCount = 0;

  dbData.products = dbData.products.map(p => {
    if (p.image && p.image.includes('photo-1489987707025-afc232f7ea0f')) {
      const cat = p.category.toLowerCase().replace(/[\s-]/g, '');
      if (cat === 'frock' || cat === 'frocks') {
        p.image = frockImages[frockIdx % frockImages.length];
        frockIdx++;
        replacedCount++;
      } else if (cat === 'palazzoset' || cat === 'palazzo') {
        p.image = palazzoImages[palazzoIdx % palazzoImages.length];
        palazzoIdx++;
        replacedCount++;
      } else if (cat === 'feeding' || cat === 'feedingdresses') {
        p.image = feedingImages[feedingIdx % feedingImages.length];
        feedingIdx++;
        replacedCount++;
      } else if (cat === 'cotton' || cat === 'cottoncollection') {
        p.image = cottonImages[cottonIdx % cottonImages.length];
        cottonIdx++;
        replacedCount++;
      }
    }
    return p;
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`✅ Successfully replaced ${replacedCount} generic placeholders with relevant category images!`);
}

main();
