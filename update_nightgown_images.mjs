import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'backend', 'database.json');

const nightgownImages = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1608063615781-e5ef77d3cf11?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop'
];

function main() {
  if (!fs.existsSync(dbFile)) {
    console.error(`❌ Database file not found at: ${dbFile}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  let replacedCount = 0;
  let idx = 0;

  dbData.products = dbData.products.map(p => {
    if (p.image && p.image.includes('photo-1489987707025-afc232f7ea0f')) {
      const cat = p.category.toLowerCase().replace(/[\s-]/g, '');
      if (cat === 'nightgowns' || cat === 'nightgown' || cat === 'nightwear') {
        p.image = nightgownImages[idx % nightgownImages.length];
        idx++;
        replacedCount++;
      }
    }
    return p;
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`✅ Successfully replaced ${replacedCount} generic placeholders in Night Gowns with sleepwear images!`);
}

main();
