import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'backend', 'database.json');

// Accurate color-specific high-quality fashion imagery
const colorMapping = [
  // Frocks / Dresses
  { pattern: /purple/i, url: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop' },
  { pattern: /red/i, url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop' },
  { pattern: /black/i, url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop' },
  { pattern: /wine/i, url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop' },
  { pattern: /lime green/i, url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop' },
  { pattern: /forest green/i, url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop' },
  { pattern: /green/i, url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop' },
  { pattern: /steel blue/i, url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop' },
  { pattern: /blue/i, url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop' },
  { pattern: /navy/i, url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680fe0a?w=800&auto=format&fit=crop' },

  // Palazzo Sets
  { pattern: /dark pink/i, url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop' },
  { pattern: /lotus/i, url: 'https://images.unsplash.com/photo-1561932850-f13404855e53?w=800&auto=format&fit=crop' },

  // Night Gowns
  { pattern: /yellow/i, url: 'https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?w=800&auto=format&fit=crop' },
  { pattern: /deep pink/i, url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&auto=format&fit=crop' },
  { pattern: /pink/i, url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop' },
  { pattern: /olive/i, url: 'https://images.unsplash.com/photo-1608063615781-e5ef77d3cf11?w=800&auto=format&fit=crop' },
  { pattern: /lavender/i, url: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800&auto=format&fit=crop' },
  { pattern: /peach/i, url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&auto=format&fit=crop' },
  { pattern: /grey/i, url: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&auto=format&fit=crop' },
  { pattern: /brown/i, url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop' }
];

function main() {
  if (!fs.existsSync(dbFile)) {
    console.error(`❌ Database file not found at: ${dbFile}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  let matchedCount = 0;

  dbData.products = dbData.products.map(p => {
    // Only update non-local placeholder images
    if (p.image && p.image.startsWith('http')) {
      const name = p.name.toLowerCase();
      // Find the first matching color pattern
      const match = colorMapping.find(m => m.pattern.test(name));
      if (match) {
        p.image = match.url;
        matchedCount++;
      }
    }
    return p;
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`✅ Successfully color-matched and updated ${matchedCount} product images in the database!`);
}

main();
