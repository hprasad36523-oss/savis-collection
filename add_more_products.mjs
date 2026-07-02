import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'backend', 'database.json');

const newProducts = [
  // Short Tops
  {
    id: `prod-short-top-${Date.now()}-1`,
    createdAt: new Date().toISOString(),
    name: "Cotton Floral Embroidered Short Top - Lemon Yellow",
    price: 499,
    oldPrice: 799,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop",
    category: "Short Top",
    description: "Pure cotton short top with intricate floral embroidery around the neck. Perfect summer daywear.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Yellow"],
    stock: 15,
    featured: true
  },
  {
    id: `prod-short-top-${Date.now()}-2`,
    createdAt: new Date(Date.now() + 1000).toISOString(),
    name: "Summer Linen Short Kurti Top - Peach Blush",
    price: 549,
    oldPrice: 849,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop",
    category: "Short Top",
    description: "Chic linen-cotton blend short top featuring high collar and side buttons. Lightweight and highly breathable.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Peach"],
    stock: 12,
    featured: true
  },
  {
    id: `prod-short-top-${Date.now()}-3`,
    createdAt: new Date(Date.now() + 2000).toISOString(),
    name: "Classic White Cotton Short Top",
    price: 450,
    oldPrice: 699,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop",
    category: "Short Top",
    description: "Minimalist pure cotton short top with bell sleeves and lace detailing. Simple, clean, and elegant.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    stock: 18,
    featured: false
  },
  {
    id: `prod-short-top-${Date.now()}-4`,
    createdAt: new Date(Date.now() + 3000).toISOString(),
    name: "Indo-Western Printed Short Top - Indigo Blue",
    price: 499,
    oldPrice: 749,
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop",
    category: "Short Top",
    description: "Traditional dabu block printed short top with modern styling. Great pair for denims or palazzos.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Indigo"],
    stock: 14,
    featured: true
  },

  // Feeding Dresses
  {
    id: `prod-feeding-${Date.now()}-1`,
    createdAt: new Date(Date.now() + 4000).toISOString(),
    name: "Maternity & Feeding A-Line Dress - Rose Pink",
    price: 799,
    oldPrice: 1099,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop",
    category: "Feeding",
    description: "Elegant maternity midi dress with hidden dual-side zippers for easy feeding access. Pure cotton.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Pink"],
    stock: 10,
    featured: true
  },
  {
    id: `prod-feeding-${Date.now()}-2`,
    createdAt: new Date(Date.now() + 5000).toISOString(),
    name: "Cotton Tiered Maternity Midi Dress - Mint Green",
    price: 849,
    oldPrice: 1199,
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop",
    category: "Feeding",
    description: "Flowy tired dress featuring soft elasticated waist and concealed zippers. Designed for nursing mothers.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Green"],
    stock: 9,
    featured: true
  },
  {
    id: `prod-feeding-${Date.now()}-3`,
    createdAt: new Date(Date.now() + 6000).toISOString(),
    name: "Floral Block Print Nursing Dress - Crimson & Gold",
    price: 899,
    oldPrice: 1299,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop",
    category: "Feeding",
    description: "Premium cotton hand-block printed nursing dress with adjustable tie-back belt and convenient feeding openings.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Red"],
    stock: 11,
    featured: false
  }
];

function main() {
  if (!fs.existsSync(dbFile)) {
    console.error(`❌ Database file not found at: ${dbFile}`);
    process.exit(1);
  }

  const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  // 1. Clear test data (orders, users, inquiries)
  const initialOrdersCount = dbData.orders ? dbData.orders.length : 0;
  const initialUsersCount = dbData.users ? dbData.users.length : 0;
  const initialInquiriesCount = dbData.inquiries ? dbData.inquiries.length : 0;

  dbData.orders = [];
  dbData.users = [];
  dbData.inquiries = [];

  console.log(`🧹 Cleaned database: cleared ${initialOrdersCount} test orders, ${initialUsersCount} test users, and ${initialInquiriesCount} test inquiries.`);

  // 2. Add the new products for Short Top and Feeding categories
  newProducts.forEach(product => {
    dbData.products.unshift(product);
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`✅ Successfully added ${newProducts.length} new premium products to Short Top and Feeding categories!`);
}

main();
