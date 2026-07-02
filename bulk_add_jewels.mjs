import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jewelsDir = path.join(__dirname, 'images', 'Jewels');
const uploadsDir = path.join(__dirname, 'backend', 'public', 'uploads');
const dbFile = path.join(__dirname, 'backend', 'database.json');

async function main() {
  if (!fs.existsSync(jewelsDir)) {
    console.error(`❌ Jewels directory not found at: ${jewelsDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const files = fs.readdirSync(jewelsDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });

  console.log(`🔍 Found ${files.length} jewel images to process.`);

  if (files.length === 0) {
    console.log('No image files found.');
    return;
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  const timestamp = Date.now();

  let addedCount = 0;

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase();
    const cleanFileName = `jewel_${index + 1}_${timestamp}${ext}`;
    const srcPath = path.join(jewelsDir, file);
    const destPath = path.join(uploadsDir, cleanFileName);

    // Copy file to uploads folder
    fs.copyFileSync(srcPath, destPath);

    // Create product object
    const newProduct = {
      id: `prod-jewel-${timestamp}-${index + 1}`,
      createdAt: new Date(timestamp + index * 1000).toISOString(),
      name: `Jewellery Item #${index + 1}`,
      price: 0,
      image: `/uploads/${cleanFileName}`,
      category: "Covering Ornaments",
      description: "Traditional fashion jewellery. Amount and quantity to be updated.",
      sizes: ["Free Size"],
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

  console.log(`✅ Successfully copied and registered ${addedCount} jewellery products in the database!`);
}

main();
