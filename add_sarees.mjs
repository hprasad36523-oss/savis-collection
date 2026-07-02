import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'backend', 'database.json');

const newSarees = [
  {
    name: "Banarasi Silk Saree - Royal Blue & Gold",
    price: 2899,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
    description: "Exquisite Banarasi silk saree woven with gold zari thread patterns. A timeless classic for festive and wedding wear."
  },
  {
    name: "Kanjeevaram Brocade Saree - Crimson Red",
    price: 3499,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop",
    description: "Pure Kanjeevaram silk saree with rich traditional brocade work and elegant borders. Reflects absolute premium heritage craftsmanship."
  },
  {
    name: "Chanderi Cotton Silk Saree - Emerald Green",
    price: 1899,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop",
    description: "Lightweight and comfortable Chanderi cotton-silk blend saree with subtle gold checks. Handloomed in Madhya Pradesh."
  },
  {
    name: "Pastel Organza Floral Saree - Rose Pink",
    price: 1599,
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800&auto=format&fit=crop",
    description: "Ultra-modern sheer organza saree with delicate floral print details and scalloped borders. Perfect for day wear and parties."
  },
  {
    name: "Jaipuri Bandhani Tie-Dye Saree - Mustard & Red",
    price: 1299,
    image: "https://images.unsplash.com/photo-1562572159-4ebcd318f4dd?w=800&auto=format&fit=crop",
    description: "Traditional Jaipuri Bandhej tie-and-dye saree with gold Gota Patti border embellishments. Extremely lightweight and vibrant."
  },
  {
    name: "Bengal Tant Cotton Saree - Ivory & Red",
    price: 1199,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop",
    description: "Pure Bengal tant cotton handloom saree featuring iconic red borders and breathable fabric. Designed for absolute comfort."
  }
];

function main() {
  if (!fs.existsSync(dbFile)) {
    console.error(`❌ Database file not found at: ${dbFile}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  const timestamp = Date.now();
  let addedCount = 0;

  newSarees.forEach((s, index) => {
    const newProduct = {
      id: `prod-saree-${timestamp}-${index + 1}`,
      createdAt: new Date(timestamp + index * 1000).toISOString(),
      name: s.name,
      price: s.price,
      oldPrice: s.price + 500,
      image: s.image,
      category: "Sarees",
      description: s.description,
      sizes: ["Free Size"],
      colors: ["Default"],
      stock: Math.floor(Math.random() * 10) + 5, // 5 to 15 stock
      featured: true
    };

    // Insert at the beginning of the products list
    dbData.products.unshift(newProduct);
    addedCount++;
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`✅ Successfully added ${addedCount} premium Indian Sarees to the database!`);
}

main();
