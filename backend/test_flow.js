async function runTests() {
  console.log("=== STARTING API FLOW CHECK ===");
  
  // 1. Check Products
  console.log("\n1. Fetching products...");
  const pRes = await fetch('http://[::1]:5000/api/products');
  console.log("Status:", pRes.status);
  const products = await pRes.json();
  console.log("Total products in db:", products.length);
  if (products.length > 0) {
    console.log("Sample Product:", products[0].name, "-", products[0].price);
  }
  
  // 2. Create User / Login
  console.log("\n2. Creating a test customer registration...");
  const uRes = await fetch('http://[::1]:5000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test flow checker',
      email: 'flow_check@test.com',
      phone: '919788633200',
      address: '123 Test Street, Bangalore'
    })
  });
  console.log("Status:", uRes.status);
  const user = await uRes.json();
  console.log("Registered User:", user);
  
  // 3. Create Order
  console.log("\n3. Placing a test order...");
  const oRes = await fetch('http://[::1]:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      items: [
        {
          id: products[0] ? products[0].id : 'test-prod-1',
          name: products[0] ? products[0].name : 'Test Apparel',
          price: products[0] ? products[0].price : 999,
          quantity: 1,
          size: 'M',
          color: 'Black'
        }
      ],
      totalAmount: products[0] ? products[0].price : 999
    })
  });
  console.log("Status:", oRes.status);
  const order = await oRes.json();
  console.log("Created Order ID:", order.id, "Status:", order.status);
  
  // 4. Track Order
  console.log("\n4. Tracking the order...");
  const tRes = await fetch(`http://[::1]:5000/api/orders/track/${order.id}`);
  console.log("Status:", tRes.status);
  const tracked = await tRes.json();
  console.log("Tracked Order Details:", tracked.id, "-", tracked.status);
  
  // 5. Cancel Order
  console.log("\n5. Cancelling the order...");
  const cRes = await fetch(`http://[::1]:5000/api/orders/${order.id}/cancel`, {
    method: 'POST'
  });
  console.log("Status:", cRes.status);
  const cancelled = await cRes.json();
  console.log("Cancelled Order Details Status:", cancelled.status);
  
  console.log("\n=== API FLOW CHECK COMPLETED SUCCESSFULLY ===");
}

runTests().catch(err => {
  console.error("Error during flow check:", err);
});
