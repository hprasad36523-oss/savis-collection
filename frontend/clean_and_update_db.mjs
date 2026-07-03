import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const dbFile = path.join(rootDir, 'backend', 'database.json');
const uploadsDir = path.join(rootDir, 'backend', 'public', 'uploads');

const femaleDir = path.join(rootDir, 'images', 'female');
const kidsDir = path.join(rootDir, 'images', 'kids');
const jewelsDir = path.join(rootDir, 'images', 'Jewels');

// Lists of premium fashion name parts to generate realistic names
const femaleNames = {
  adjectives: ["Elegance Floral", "Designer Georgette", "Classic Cotton Anarkali", "Premium Rayon Nyra Cut", "Festive Silk", "Casual Daily Wear", "Stylish Rayon", "Handblock Printed", "Chikankari Handwork", "Banarasi Style Georgette", "Jaipuri Printed Cotton", "Lace Detailed Rayon"],
  nouns: ["Kurti", "Palazzo Set", "Co-ord Set", "Anarkali Gown", "Straight Fit Kurta", "Tunic", "Designer Suit"]
};

const kidsNames = {
  adjectives: ["Cotton Printed", "Soft Summer", "Embroidered", "Floral Ruffle", "Casual Play", "Premium Party", "Denim Style", "Classic Striped", "Polka Dot", "Soft Knit", "Festive Wear", "Breathable Cotton"],
  nouns: ["Frock", "Dress", "Co-ord Set", "Jumpsuit", "T-Shirt & Shorts Set", "Romper", "Kurta Set"]
};

const jewelNames = {
  adjectives: ["Antique Gold Finish", "Traditional Kundan", "Elegant Pearl Drop", "American Diamond", "Royal Temple Work", "Bridal Choker", "Delicate Micro Gold", "Classic Matte Finish", "Kemp Stone Studded", "Designer CZ Stone", "Floral Meenakari"],
  nouns: ["Bangles Set", "Choker Set", "Necklace", "Earrings", "Jhumkas", "Bracelet", "Pendant Set", "Ring Set"]
};

function generateName(lists, index) {
  const adj = lists.adjectives[index % lists.adjectives.length];
  const noun = lists.nouns[Math.floor(index / lists.adjectives.length) % lists.nouns.length];
  return `${adj} ${noun}`;
}

async function run() {
  console.log("🚀 Starting database cleanup and stable image sync...");

  if (!fs.existsSync(dbFile)) {
    console.error(`❌ database.json not found at: ${dbFile}`);
    process.exit(1);
  }

  // 1. Read existing database
  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  console.log(`Original database has ${dbData.products.length} products.`);

  // We will preserve the preset products (e.g. products whose IDs don't start with prod-female, prod-kids, prod-jewel)
  const presetProducts = dbData.products.filter(p => 
    !p.id.startsWith('prod-female') && 
    !p.id.startsWith('prod-kids') && 
    !p.id.startsWith('prod-jewel')
  );
  console.log(`Preserving ${presetProducts.length} preset products (e.g. Sarees, special items).`);

  const newProducts = [];

  // Helper function to sync a folder's images
  function syncCategory(srcDir, prefix, categoryName, nameLists, priceRange, sizeList) {
    if (!fs.existsSync(srcDir)) {
      console.log(`⚠️ Folder ${srcDir} does not exist. Skipping.`);
      return;
    }

    const files = fs.readdirSync(srcDir)
      .filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`📸 Found ${files.length} images in ${prefix} folder. Syncing...`);

    files.forEach((file, index) => {
      const ext = path.extname(file).toLowerCase();
      const stableName = `${prefix}_${index + 1}${ext}`;
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(uploadsDir, stableName);

      // Copy image with stable, overwritable name
      fs.copyFileSync(srcPath, destPath);

      // Generate properties
      const name = generateName(nameLists, index);
      
      // Stable price based on index
      const basePrice = priceRange.min + ((index * 50) % (priceRange.max - priceRange.min));
      const price = Math.round(basePrice / 10) * 10 - 1; // e.g. 599, 799
      const oldPrice = Math.round((price * 1.4) / 10) * 10 - 1;

      const product = {
        id: `prod-${prefix}-${index + 1}`,
        createdAt: new Date(Date.now() - (files.length - index) * 60000).toISOString(),
        name: name,
        price: price,
        oldPrice: oldPrice,
        image: `/uploads/${stableName}`,
        category: categoryName,
        description: `Premium quality ${categoryName.toLowerCase()} item. Handcrafted with care, perfect fit and elegant design. Made in India.`,
        sizes: sizeList,
        colors: ["Default"],
        stock: 15 + (index % 10),
        featured: index % 10 === 0
      };

      newProducts.push(product);
    });

    console.log(`✅ Synced ${files.length} products for category ${categoryName}.`);
  }

  // 2. Sync all three categories
  syncCategory(femaleDir, 'female', 'Kurtis', femaleNames, { min: 499, max: 1599 }, ["S", "M", "L", "XL", "XXL"]);
  syncCategory(kidsDir, 'kids', 'Kids Collections', kidsNames, { min: 299, max: 799 }, ["2-4 Y", "4-6 Y", "6-8 Y"]);
  syncCategory(jewelsDir, 'jewel', 'Jewels', jewelNames, { min: 199, max: 1299 }, ["Free Size"]);

  // 3. Merge preset products and newly synced products
  dbData.products = [...newProducts, ...presetProducts];

  // 4. Save to database.json
  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');

  console.log(`🎉 Sync Completed! Total products in database: ${dbData.products.length}`);
}

run();
