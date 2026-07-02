import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'backend', 'database.json');

function main() {
  if (!fs.existsSync(dbFile)) {
    console.error(`❌ Database file not found at: ${dbFile}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  let updatedCount = 0;

  // Options for prices to randomize for a realistic catalog feel
  const kidsPrices = [399, 499, 599, 699, 799];
  const jewelleryPrices = [299, 399, 499, 599, 799];
  const kurtisPrices = [699, 799, 899, 999, 1199, 1299];
  const generalPrices = [499, 599, 699, 799, 899];

  dbData.products = dbData.products.map(p => {
    if (p.price === 0) {
      let selectedPrice = 0;
      let cat = p.category.toLowerCase().replace(/[\s-]/g, '');

      if (cat === 'kidscollections' || cat === 'kids') {
        selectedPrice = kidsPrices[Math.floor(Math.random() * kidsPrices.length)];
      } else if (cat === 'coveringornaments' || cat === 'goldornaments' || cat === 'jewellery' || cat === 'jewelry') {
        selectedPrice = jewelleryPrices[Math.floor(Math.random() * jewelleryPrices.length)];
      } else if (cat === 'kurtis') {
        selectedPrice = kurtisPrices[Math.floor(Math.random() * kurtisPrices.length)];
      } else {
        selectedPrice = generalPrices[Math.floor(Math.random() * generalPrices.length)];
      }

      p.price = selectedPrice;
      // Add a nice realistic original price for a visual sale discount
      p.oldPrice = selectedPrice + (Math.random() > 0.3 ? (Math.random() > 0.5 ? 200 : 300) : 100);
      // Give them some default stock so they aren't marked as Out of Stock
      p.stock = Math.floor(Math.random() * 15) + 5; // between 5 and 20

      updatedCount++;
    }
    return p;
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`✅ Successfully updated prices, oldPrices, and stock for ${updatedCount} products in the database!`);
}

main();
