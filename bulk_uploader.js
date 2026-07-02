import fs from 'fs';
import path from 'path';

// Modern Node.js built-in fetch is available (Node 18+)
// To run this script:
// 1. Create a "products_to_upload.json" file in this directory.
// 2. Put your product data in it (see products_to_upload.example.json).
// 3. Run: node bulk_uploader.js

const API_URL = 'http://localhost:5000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'srm@admin';

async function bulkUpload() {
  const jsonPath = path.join(process.cwd(), 'products_to_upload.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: products_to_upload.json not found in ${process.cwd()}`);
    console.log('\nPlease create "products_to_upload.json" first. Example format:');
    console.log(JSON.stringify([
      {
        name: "Premium Cotton Hoodie",
        price: 899,
        category: "Hoodies",
        description: "Soft premium cotton comfort fit hoodie.",
        imagePath: "./my_hoodie.png", // Path to local image file to upload
        sizes: ["M", "L", "XL"],
        colors: ["Black", "Grey"],
        featured: true
      }
    ], null, 2));
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`🤖 Bulk Product Uploader Bot starting...`);
  console.log(`📋 Found ${products.length} products to process.\n`);

  // 1. Login to get Admin Auth Token
  console.log(`🔑 Authenticating with admin credentials...`);
  let token = '';
  try {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD })
    });
    if (!res.ok) {
      throw new Error(`Authentication failed: Status ${res.status}`);
    }
    const data = await res.json();
    token = data.token;
    console.log(`✅ Authorized successfully!\n`);
  } catch (err) {
    console.error(`❌ Authentication failed. Make sure the server is running on ${API_URL}`);
    console.error(err.message);
    process.exit(1);
  }

  // 2. Upload each product
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    console.log(`📦 [${i + 1}/${products.length}] Processing product: "${p.name}"`);
    
    let imageUrl = p.image || '';

    // If a local imagePath is provided, read and upload it
    if (p.imagePath) {
      const imgLocalPath = path.resolve(p.imagePath);
      if (fs.existsSync(imgLocalPath)) {
        console.log(`   📤 Uploading image file: ${p.imagePath}...`);
        try {
          const fileBuffer = fs.readFileSync(imgLocalPath);
          const extension = path.extname(imgLocalPath).replace('.', '');
          const base64Data = `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${fileBuffer.toString('base64')}`;
          
          const uploadRes = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ imageBase64: base64Data })
          });

          if (!uploadRes.ok) {
            throw new Error(`Image upload API returned status ${uploadRes.status}`);
          }
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.imagePath;
          console.log(`   ✅ Image uploaded: ${imageUrl}`);
        } catch (imgErr) {
          console.warn(`   ⚠️ Image upload failed: ${imgErr.message}. Falling back to default placeholder.`);
          imageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop';
        }
      } else {
        console.warn(`   ⚠️ Local image file not found at: ${imgLocalPath}. Using default image.`);
        imageUrl = p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop';
      }
    }

    // Prepare product payload
    const payload = {
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description || '',
      image: imageUrl,
      sizes: p.sizes || ["S", "M", "L", "XL"],
      colors: p.colors || ["Default"],
      featured: !!p.featured,
      colorImages: p.colorImages || {},
      additionalImages: p.additionalImages || []
    };

    // Save product to database
    try {
      const prodRes = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!prodRes.ok) {
        throw new Error(`Create product API returned status ${prodRes.status}`);
      }
      const createdProduct = await prodRes.json();
      console.log(`   ✨ Product successfully registered! ID: ${createdProduct.id}\n`);
    } catch (prodErr) {
      console.error(`   ❌ Failed to register product: ${prodErr.message}\n`);
    }
  }

  console.log(`🏁 Bulk upload finished.`);
}

bulkUpload();
