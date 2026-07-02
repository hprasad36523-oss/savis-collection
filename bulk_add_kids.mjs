import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kidsDir = path.join(__dirname, 'images', 'kids');
const uploadsDir = path.join(__dirname, 'backend', 'public', 'uploads');
const dbFile = path.join(__dirname, 'backend', 'database.json');

async function main() {
  if (!fs.existsSync(kidsDir)) {
    console.error(`❌ Kids directory not found at: ${kidsDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const files = fs.readdirSync(kidsDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });

  console.log(`🔍 Found ${files.length} kids images to process.`);

  if (files.length === 0) {
    console.log('No image files found.');
    return;
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  const timestamp = Date.now();

  let addedCount = 0;

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase();
    const cleanFileName = `kids_${index + 1}_${timestamp}${ext}`;
    const srcPath = path.join(kidsDir, file);
    const destPath = path.join(uploadsDir, cleanFileName);

    // Copy file to uploads folder
    fs.copyFileSync(srcPath, destPath);

    // Create product object
    const newProduct = {
      id: `prod-kids-${timestamp}-${index + 1}`,
      createdAt: new Date(timestamp + index * 1000).toISOString(),
      name: `Kids Item #${index + 1}`,
      price: 0,
      image: `/uploads/${cleanFileName}`,
      category: "Kids Collections",
      description: "Premium quality kids wear collection. Amount and quantity to be updated.",
      sizes: ["2-4 Y", "4-6 Y", "6-8 Y"],
      colors: ["Default"],
      stock: 0,
      featured: false
    };

    // Add to top of products list
    dbData.products.unshift(newProduct);
    addedCount++;
  });

  // Write back to database.json
  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');

  console.log(`✅ Successfully copied and registered ${addedCount} kids products in the database!`);
}

main();
