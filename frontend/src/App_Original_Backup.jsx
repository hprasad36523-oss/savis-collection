import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Fallback products data matching the SAVI'S collection storefront HTML structure
const fallbackProducts = [];

const COLLECTIONS = [
  {name:'🔥 BIG COMBO SALE',cta:'View All',img:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80',href:'#new-arrivals'},
  {name:'Palazzo Set',cta:'View All',img:'https://images.unsplash.com/photo-1594938298603-c8148c4b4d73?w=300&q=80',href:'#sarees'},
  {name:'Georgette Frock',cta:'View All',img:'https://images.unsplash.com/photo-1566479179817-51cf0e98c0b7?w=300&q=80',href:'#cotton'},
  {name:'Stylish Co-Ords',cta:'View All',img:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',href:'#coords'},
  {name:'Elegant Sarees',cta:'View All',img:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80',href:'#sarees'},
  {name:'Night Gowns',cta:'View All',img:'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=300&q=80',href:'#nightgown'},
  {name:'Trendy Kurtis',cta:'View All',img:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80',href:'#kurtis'},
  {name:'Feeding Dresses',cta:'View All',img:'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80',href:'#feeding'},
  {name:'Cotton Collection',cta:'View All',img:'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&q=80',href:'#cotton'},
  {name:'Kids Collections',cta:'View All',img:'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=300&q=80',href:'#kids'},
  {name:'Home Essentials',cta:'View All',img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',href:'#collections'},
];

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'admin'
  const [adminSubTab, setAdminSubTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'products' | 'customers' | 'inquiries'
  const [products, setProducts] = useState(fallbackProducts);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [inquiries, setInquiries] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });

  // Admin Security & Session States
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || '');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // User Session & Registration State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '', confirmEmail: '', phone: '', address: '' });
  const [loginTab, setLoginTab] = useState('login'); // 'login' | 'register'
  const [emailOrPhoneInput, setEmailOrPhoneInput] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Outreach & Marketing Campaigns State
  const [customers, setCustomers] = useState([]);
  const [outreachForm, setOutreachForm] = useState({ type: 'whatsapp', message: 'Hi [Name]! Check out our new premium combo offers at SAVI\'S! ✨' });
  const [campaignProgress, setCampaignProgress] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState('');

  // Image Upload indicator
  const [imageUploading, setImageUploading] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('selected-theme') || 'light');
  
  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  // Sort and Filter state
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'low-high' | 'high-low' | 'alphabetical' | 'newest'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Toast notifications state
  const [toastMessage, setToastMessage] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Hero Slider Index
  const [heroIndex, setHeroIndex] = useState(0);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Amazon/Flipkart checkout & profile states
  const [isCheckoutWizardOpen, setIsCheckoutWizardOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Shipping, 2 = Payment, 3 = Review, 4 = Success
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'UPI' | 'CARD'
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [upiVerified, setUpiVerified] = useState(false);
  const [checkoutOrderId, setCheckoutOrderId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  // Track Order states
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackOrderIdInput, setTrackOrderIdInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Selected details sizes and colors
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Get product image matching selected color by checking explicit mappings or searching siblings in the same category
  const getProductImageForColor = (product, color) => {
    if (!product || !color) return product?.image || '';
    
    // Check if there is an explicit color-image mapping in the product
    if (product.colorImages && product.colorImages[color]) {
      return product.colorImages[color];
    }
    
    // Find sibling product in the same category that matches this color
    const baseName = product.name.replace(new RegExp(`\\b(${product.colors?.join('|')}|Yellow|Red|Brown|Green|Dark Navy Blue|Pink|Blue|Purple|Grey|Black|Orange|White|Peach|Lavender)\\b`, 'gi'), '').trim();
    const cleanBase = baseName.replace(/\s+/g, ' ').toLowerCase();
    
    const sibling = products.find(p => {
      if (p.category !== product.category) return false;
      const pNameLower = p.name.toLowerCase();
      
      // Sibling should contain the target color in its name
      if (!pNameLower.includes(color.toLowerCase())) return false;
      
      // Sibling base name should be similar to our base name
      const pBaseName = p.name.replace(new RegExp(`\\b(${p.colors?.join('|')}|Yellow|Red|Brown|Green|Dark Navy Blue|Pink|Blue|Purple|Grey|Black|Orange|White|Peach|Lavender)\\b`, 'gi'), '').trim();
      const pCleanBase = pBaseName.replace(/\s+/g, ' ').toLowerCase();
      
      return pCleanBase === cleanBase || pCleanBase.includes(cleanBase) || cleanBase.includes(pCleanBase);
    });
    
    if (sibling) {
      return sibling.image;
    }
    
    // Fallback: If no sibling, see if there is any product in the list that contains the color and has a name containing a portion of this product's name
    const words = product.name.split(' ').filter(w => w.length > 3 && !['with', 'sleeves', 'set', 'cotton'].includes(w.toLowerCase()));
    if (words.length > 0) {
      const backupSibling = products.find(p => {
        const pNameLower = p.name.toLowerCase();
        return pNameLower.includes(color.toLowerCase()) && words.some(w => pNameLower.includes(w.toLowerCase()));
      });
      if (backupSibling) return backupSibling.image;
    }
    
    return product.image;
  };



  // Admin Product Adding Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    oldPrice: '',
    image: '',
    category: 'Co-ords',
    description: '',
    sizes: 'S, M, L, XL',
    colors: 'Default',
    stock: 20,
    featured: false,
    colorImages: {}
  });

  // Order List filter status
  const [orderFilter, setOrderFilter] = useState('All');

  // Billing states
  const [billingCustomer, setBillingCustomer] = useState('new');
  const [billingNewCustName, setBillingNewCustName] = useState('');
  const [billingNewCustPhone, setBillingNewCustPhone] = useState('');
  const [billingNewCustEmail, setBillingNewCustEmail] = useState('');
  const [billingNewCustAddress, setBillingNewCustAddress] = useState('');
  
  const [billingSelectedProdId, setBillingSelectedProdId] = useState('');
  const [billingSelectedSize, setBillingSelectedSize] = useState('');
  const [billingSelectedColor, setBillingSelectedColor] = useState('');
  const [billingSelectedQty, setBillingSelectedQty] = useState(1);
  const [billingDiscount, setBillingDiscount] = useState(0);
  const [billingTaxRate, setBillingTaxRate] = useState(18); // Default 18% GST
  const [billingInvoiceItems, setBillingInvoiceItems] = useState([]);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Sync selected billing product swatches
  useEffect(() => {
    if (billingSelectedProdId) {
      const prod = products.find(p => p.id === billingSelectedProdId);
      if (prod) {
        setBillingSelectedSize(prod.sizes?.[0] || 'M');
        setBillingSelectedColor(prod.colors?.[0] || 'Default');
        setBillingSelectedQty(1);
      }
    } else {
      setBillingSelectedSize('');
      setBillingSelectedColor('');
      setBillingSelectedQty(1);
    }
  }, [billingSelectedProdId, products]);


  // Trigger Toast Alert
  const triggerToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setToastShow(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastShow(false);
    }, 2600);
  };

  // Sync Wishlist to local storage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toggle Wishlist handler
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        triggerToast("Removed from Wishlist ♡");
        return prev.filter(id => id !== productId);
      } else {
        triggerToast("Added to Wishlist ❤️");
        return [...prev, productId];
      }
    });
  };

  // Set html page title & theme
  useEffect(() => {
    document.title = activeTab === 'shop' 
      ? "SAVI'S collection — Premium Fabrics, Made in India" 
      : "Admin Dashboard — SAVI'S collection";
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('selected-theme', theme);
  }, [theme, activeTab]);

  // Sync Products & Stats
  const fetchStoreData = async () => {
    try {
      const pRes = await fetch(`${API_BASE_URL}/api/products`);
      if (pRes.ok) {
        const pData = await pRes.json();
        const updated = pData.map(p => ({
          ...p,
          image: p.image.startsWith('/uploads') ? `${API_BASE_URL}${p.image}` : p.image
        }));
        setProducts(updated.length > 0 ? updated : fallbackProducts);
      }
    } catch (err) {
      console.warn("Could not fetch live products. Using pre-loaded products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken('');
    setActiveTab('shop');
    triggerToast("Session expired or logged out.");
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        setAdminToken(data.token);
        setAdminUsername('');
        setAdminPassword('');
        triggerToast("Admin authorized successfully!");
      } else {
        const data = await res.json();
        setAdminLoginError(data.error || "Invalid username or password");
      }
    } catch (err) {
      // Offline fallback
      if (adminUsername === 'admin' && adminPassword === 'admin123') {
        const mockToken = "savi-admin-secure-token-2026";
        localStorage.setItem('adminToken', mockToken);
        setAdminToken(mockToken);
        setAdminUsername('');
        setAdminPassword('');
        triggerToast("Offline Mode: Admin authorized successfully!");
      } else {
        setAdminLoginError("Unable to connect to backend server.");
      }
    }
  };

  const fetchAdminData = async () => {
    if (activeTab !== 'admin') return;
    if (!adminToken) return;
    try {
      // Orders
      const oRes = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (oRes.status === 401) {
        handleAdminLogout();
        return;
      }
      if (oRes.ok) {
        const oData = await oRes.json();
        setOrders(oData);
      }
      
      // Stats
      const sRes = await fetch(`${API_BASE_URL}/api/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (sRes.status === 401) {
        handleAdminLogout();
        return;
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData);
      }

      // Customers
      const cRes = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (cRes.status === 401) {
        handleAdminLogout();
        return;
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCustomers(cData);
      }

      // Inquiries
      const iRes = await fetch(`${API_BASE_URL}/api/inquiries`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (iRes.status === 401) {
        handleAdminLogout();
        return;
      }
      if (iRes.ok) {
        const iData = await iRes.json();
        setInquiries(iData);
      }
    } catch (err) {
      console.warn("Could not sync live admin analytics.");
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/inquiries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        triggerToast("Message deleted successfully.");
        fetchAdminData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete message.");
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      setInquiries(prev => prev.filter(i => i.id !== id));
      triggerToast("Offline Mode: Message deleted locally.");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      triggerToast("Please fill in all required fields.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        triggerToast("Thank you! Your message has been sent successfully. We will get back to you soon.");
        setContactForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      } else {
        const err = await res.json();
        triggerToast(err.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.warn("Offline Contact Form Simulation");
      triggerToast("Thank you! Your message was submitted successfully.");
      setContactForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    }
  };

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    try {
      const emailQuery = currentUser.email || '';
      const phoneQuery = currentUser.phone || '';
      const res = await fetch(`${API_BASE_URL}/api/users/orders?email=${encodeURIComponent(emailQuery)}&phone=${encodeURIComponent(phoneQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.warn("Offline Mode: Simulating user order fetch.");
      const simulated = orders.filter(o => 
        o.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
        o.phone === currentUser.phone
      );
      setUserOrders(simulated.length > 0 ? simulated : []);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast("Order Cancelled Successfully");
        fetchUserOrders();
        fetchAdminData();
      } else {
        alert("Failed to cancel order.");
      }
    } catch (err) {
      setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      triggerToast("Offline Mode: Order Cancelled.");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [currentUser]);

  // Restores user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('savi_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Pre-fill checkout form details
        setCustomerName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
      } catch (e) {
        console.error("Error loading saved user session:", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
    const storeInterval = setInterval(fetchStoreData, 10000);
    return () => clearInterval(storeInterval);
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, adminSubTab]);

  // Default Size/Color Swatch Selection
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes?.[0] || 'M');
      setSelectedColor(selectedProduct.colors?.[0] || 'Default');
    }
  }, [selectedProduct]);

  // Hero Auto Slider Loop
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);



  // Cart operations
  const addToCart = (product, size, color) => {
    // Intercept if customer is not logged in
    if (!currentUser) {
      setPendingAction({ type: 'add_to_cart', payload: { product, size, color } });
      setIsLoginModalOpen(true);
      triggerToast("Please login or register to add items to your cart!");
      return;
    }

    const cartItemId = `${product.id}-${size}-${color}`;
    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cartItemId,
        id: product.id,
        name: product.name,
        price: product.price,
        image: getProductImageForColor(product, color),
        size,
        color,
        quantity: 1
      }]);
    }
    setIsCartOpen(true);
    setSelectedProduct(null);
    triggerToast(`Added ${product.name} to cart`);
  };

  const updateCartQty = (cartItemId, change) => {
    const updated = cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setCheckoutStep(1);
    setCardDetails({ number: '', expiry: '', cvv: '' });
    setUpiVerified(false);
    setIsCheckoutWizardOpen(true);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    const subtotal = getCartTotal();
    const deliveryCost = subtotal >= 599 ? 0 : 50;
    const finalTotal = subtotal + deliveryCost;

    const orderData = {
      customerName,
      email,
      phone,
      address,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image,
        quantity: item.quantity
      })),
      totalAmount: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        const order = await res.json();
        setCheckoutOrderId(order.id);
        setCheckoutStep(4);
        setCart([]);
        triggerToast("Order placed successfully!");
        fetchUserOrders();
        fetchAdminData();
      } else {
        alert("Failed to submit order. Please check connection.");
      }
    } catch (err) {
      console.warn("Checkout connection offline. Simulating order placement.");
      const mockId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setCheckoutOrderId(mockId);
      const newMockOrder = {
        id: mockId,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed',
        ...orderData
      };
      setOrders(prev => [newMockOrder, ...prev]);
      setUserOrders(prev => [newMockOrder, ...prev]);
      setCheckoutStep(4);
      setCart([]);
      triggerToast("Offline Mode: Order simulated!");
    }
  };

  // Add product from Admin panel
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    const formattedProduct = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
      sizes: newProduct.sizes.split(',').map(s => s.trim()),
      colors: newProduct.colors.split(',').map(c => c.trim()),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formattedProduct)
      });
      
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        triggerToast(`Added product "${formattedProduct.name}"`);
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          price: '',
          oldPrice: '',
          image: '',
          category: 'Co-ords',
          description: '',
          sizes: 'S, M, L, XL',
          colors: 'Default',
          stock: 20,
          featured: false,
          colorImages: {}
        });
        fetchStoreData();
        fetchAdminData();
      } else {
        alert("Failed to add product. Ensure fields are correct.");
      }
    } catch (err) {
      // Offline simulation
      const mockProduct = {
        ...formattedProduct,
        id: 'mock-' + Date.now()
      };
      setProducts([mockProduct, ...products]);
      triggerToast("Offline Mode: Simulated adding product.");
      setIsAddModalOpen(false);
    }
  };

  // Delete product from Admin panel
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        triggerToast("Product deleted successfully.");
        fetchStoreData();
        fetchAdminData();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      setProducts(products.filter(p => p.id !== id));
      triggerToast("Offline Mode: Deleted product.");
    }
  };

  // Billing & Restocking Operations
  const handleAddBillingItem = () => {
    if (!billingSelectedProdId) {
      triggerToast("Please select a product first.");
      return;
    }
    const prod = products.find(p => p.id === billingSelectedProdId);
    if (!prod) return;

    const availableStock = prod.stock !== undefined ? prod.stock : 20;
    if (billingSelectedQty > availableStock) {
      triggerToast(`Only ${availableStock} units of this product are in stock!`);
      return;
    }

    const itemKey = `${billingSelectedProdId}-${billingSelectedSize}-${billingSelectedColor}`;
    const existingIdx = billingInvoiceItems.findIndex(i => i.itemKey === itemKey);

    if (existingIdx > -1) {
      const updated = [...billingInvoiceItems];
      const newQty = updated[existingIdx].quantity + parseInt(billingSelectedQty);
      if (newQty > availableStock) {
        triggerToast(`Cannot exceed available stock of ${availableStock} units.`);
        return;
      }
      updated[existingIdx].quantity = newQty;
      setBillingInvoiceItems(updated);
    } else {
      setBillingInvoiceItems([...billingInvoiceItems, {
        itemKey,
        id: prod.id,
        name: prod.name,
        price: prod.price,
        size: billingSelectedSize || 'M',
        color: billingSelectedColor || 'Default',
        quantity: parseInt(billingSelectedQty)
      }]);
    }
    triggerToast(`Added ${prod.name} to invoice items.`);
  };

  const handleRemoveBillingItem = (itemKey) => {
    setBillingInvoiceItems(billingInvoiceItems.filter(item => item.itemKey !== itemKey));
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (billingInvoiceItems.length === 0) {
      alert("Please add at least one item to generate a bill.");
      return;
    }

    let customerDetails = {};
    if (billingCustomer === 'new') {
      if (!billingNewCustName || !billingNewCustPhone || !billingNewCustEmail) {
        alert("Please enter customer name, phone, and email.");
        return;
      }
      customerDetails = {
        customerName: billingNewCustName,
        phone: billingNewCustPhone,
        email: billingNewCustEmail,
        address: billingNewCustAddress || 'Boutique POS'
      };
    } else {
      const cust = customers.find(c => c.id === billingCustomer);
      if (!cust) return;
      customerDetails = {
        customerName: cust.name,
        phone: cust.phone,
        email: cust.email,
        address: cust.address || 'Boutique POS'
      };
    }

    const subtotal = billingInvoiceItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmt = parseFloat(billingDiscount) || 0;
    const taxAmt = Math.round((subtotal - discountAmt) * (parseFloat(billingTaxRate) / 100));
    const finalAmount = Math.max(0, subtotal - discountAmt + taxAmt);

    const orderData = {
      ...customerDetails,
      items: billingInvoiceItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      })),
      totalAmount: finalAmount,
      paymentMethod: 'UPI',
      paymentStatus: 'Completed',
      status: 'Delivered', // POS orders are completed instantly
      invoiceSource: 'Admin POS System',
      taxRate: billingTaxRate,
      taxAmount: taxAmt,
      discountAmount: discountAmt,
      subtotalAmount: subtotal
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const order = await res.json();
        setGeneratedInvoice(order);
        setBillingInvoiceItems([]);
        setBillingNewCustName('');
        setBillingNewCustPhone('');
        setBillingNewCustEmail('');
        setBillingNewCustAddress('');
        setBillingDiscount(0);
        triggerToast("Invoice generated and stock updated successfully!");
        fetchStoreData();
        fetchAdminData();
      } else {
        alert("Failed to create invoice.");
      }
    } catch (err) {
      console.warn("Offline invoice generation.");
      const mockId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const simulatedOrder = {
        id: mockId,
        createdAt: new Date().toISOString(),
        ...orderData
      };
      setOrders(prev => [simulatedOrder, ...prev]);
      setGeneratedInvoice(simulatedOrder);
      setBillingInvoiceItems([]);
      setBillingNewCustName('');
      setBillingNewCustPhone('');
      setBillingNewCustEmail('');
      setBillingNewCustAddress('');
      setBillingDiscount(0);
      triggerToast("Offline Mode: Invoice generated locally!");
    }
  };

  const handleRestockProduct = async (id, newStock) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ stock: parseInt(newStock) })
      });
      if (res.ok) {
        triggerToast("Stock updated successfully!");
        fetchStoreData();
      } else {
        alert("Failed to update stock.");
      }
    } catch (err) {
      setProducts(products.map(p => p.id === id ? { ...p, stock: parseInt(newStock) } : p));
      triggerToast("Offline Mode: Stock updated locally.");
    }
  };

  // Update order status from Admin panel
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        triggerToast(`Order status updated to: ${newStatus}`);
        fetchAdminData();
      }
    } catch (err) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      triggerToast("Offline Mode: Updated order status.");
    }
  };

  // Update order payment status from Admin panel
  const handleUpdateOrderPayment = async (orderId, newPayment) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ paymentStatus: newPayment })
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        triggerToast(`Payment updated to: ${newPayment}`);
        fetchAdminData();
      }
    } catch (err) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPayment } : o));
      triggerToast("Offline Mode: Updated order payment.");
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order log permanently?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        triggerToast("Order deleted successfully.");
        fetchAdminData();
      }
    } catch (err) {
      setOrders(orders.filter(o => o.id !== orderId));
      triggerToast("Offline Mode: Deleted order.");
    }
  };

  // outreach marketing campaign
  const handleBulkOutreach = async (e) => {
    e.preventDefault();
    if (!outreachForm.message.trim()) return;
    setCampaignProgress(true);
    setCampaignStatus('Launching Broadcast Campaign...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/outreach`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          type: outreachForm.type,
          message: outreachForm.message
        })
      });
      if (res.status === 401) {
        handleAdminLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCampaignStatus(`Successfully launched simulated ${outreachForm.type.toUpperCase()} broadcast to ${data.count} customers! Check backend console for delivery trace logs.`);
        triggerToast(`Campaign Broadcast completed!`);
      } else {
        const err = await res.json();
        setCampaignStatus(`Outreach failed: ${err.error || 'Server error'}`);
      }
    } catch (e) {
      setCampaignStatus(`Offline Mode: Broadcast campaign simulated successfully for ${customers.length} registered customers!`);
      triggerToast(`Campaign simulated!`);
    } finally {
      setCampaignProgress(false);
    }
  };

  // trigger individual outreach messaging
  const handleIndividualOutreach = (userId, type, userEmail, userPhone, userName) => {
    let message = outreachForm.message.replace(/\[Name\]/gi, userName || 'Customer');
    if (type === 'whatsapp') {
      const cleanPhone = userPhone.replace(/\D/g, '');
      const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(waLink, '_blank');
      triggerToast(`WhatsApp message generated!`);
    } else {
      const mailLink = `mailto:${userEmail}?subject=${encodeURIComponent("Exclusive Offer — SAVI'S collection")}&body=${encodeURIComponent(message)}`;
      window.open(mailLink, '_blank');
      triggerToast(`Simulating Email link generation!`);
    }
  };

  // handle image upload from file selector
  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5MB.");
      return;
    }
    setImageUploading(true);
    triggerToast("Uploading product image...");
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result;
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ imageBase64: base64Data })
        });
        if (res.status === 401) {
          handleAdminLogout();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const imageUrl = data.imagePath.startsWith('http') ? data.imagePath : `${API_BASE_URL}${data.imagePath}`;
          setNewProduct(prev => ({ ...prev, image: imageUrl }));
          triggerToast("Image file uploaded successfully!");
        } else {
          const err = await res.json();
          alert(`Image upload failed: ${err.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed. Using a local file path mock URL.");
        setNewProduct(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop' }));
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // handle image upload for a specific color swatch
  const handleColorImageUpload = async (color, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5MB.");
      return;
    }
    triggerToast(`Uploading image for ${color}...`);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result;
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ imageBase64: base64Data })
        });
        if (res.status === 401) {
          handleAdminLogout();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const imageUrl = data.imagePath.startsWith('http') ? data.imagePath : `${API_BASE_URL}${data.imagePath}`;
          setNewProduct(prev => ({
            ...prev,
            colorImages: {
              ...prev.colorImages,
              [color]: imageUrl
            }
          }));
          triggerToast(`Uploaded image for ${color}!`);
        } else {
          const err = await res.json();
          alert(`Image upload failed: ${err.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // User auth login submit
  const handleUserLoginOnly = async (e) => {
    e.preventDefault();
    if (!emailOrPhoneInput.trim()) {
      alert("Please enter your email or phone number!");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: emailOrPhoneInput })
      });
      if (res.ok) {
        const uData = await res.json();
        setCurrentUser(uData);
        localStorage.setItem('savi_user', JSON.stringify(uData));
        setCustomerName(uData.name || '');
        setEmail(uData.email || '');
        setPhone(uData.phone || '');
        setAddress(uData.address || '');
        setIsLoginModalOpen(false);
        setEmailOrPhoneInput('');
        triggerToast(`Welcome back, ${uData.name || uData.email}!`);
        if (pendingAction) {
          if (pendingAction.type === 'add_to_cart') {
            addToCart(pendingAction.payload.product, pendingAction.payload.size, pendingAction.payload.color);
          } else if (pendingAction.type === 'open_cart') {
            setIsCartOpen(true);
          }
          setPendingAction(null);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Login failed.");
      }
    } catch (err) {
      console.warn("Offline Login Simulation");
      const query = emailOrPhoneInput.trim().toLowerCase();
      const existing = customers.find(u => 
        (u.email && u.email.toLowerCase() === query) ||
        (u.phone && u.phone.includes(query))
      );
      if (existing) {
        setCurrentUser(existing);
        localStorage.setItem('savi_user', JSON.stringify(existing));
        setCustomerName(existing.name || '');
        setEmail(existing.email || '');
        setPhone(existing.phone || '');
        setAddress(existing.address || '');
        setIsLoginModalOpen(false);
        setEmailOrPhoneInput('');
        triggerToast(`Offline Mode: Logged in as ${existing.name}`);
        if (pendingAction) {
          if (pendingAction.type === 'add_to_cart') {
            addToCart(pendingAction.payload.product, pendingAction.payload.size, pendingAction.payload.color);
          } else if (pendingAction.type === 'open_cart') {
            setIsCartOpen(true);
          }
          setPendingAction(null);
        }
      } else {
        alert("Account not found. Please click the 'Register' tab to create a new account!");
      }
    }
  };

  // User registration submit logic
  const handleUserRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.phone || !loginForm.name) {
      alert("Name, email, and phone number are required for registration!");
      return;
    }
    if (loginForm.email.trim().toLowerCase() !== loginForm.confirmEmail.trim().toLowerCase()) {
      alert("Email verification mismatch! Please ensure both email fields match.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (res.ok) {
        const uData = await res.json();
        setCurrentUser(uData);
        localStorage.setItem('savi_user', JSON.stringify(uData));
        setCustomerName(uData.name || '');
        setEmail(uData.email || '');
        setPhone(uData.phone || '');
        setAddress(uData.address || '');
        setIsLoginModalOpen(false);
        triggerToast(`Registered successfully as ${uData.name}`);
        if (pendingAction) {
          if (pendingAction.type === 'add_to_cart') {
            addToCart(pendingAction.payload.product, pendingAction.payload.size, pendingAction.payload.color);
          } else if (pendingAction.type === 'open_cart') {
            setIsCartOpen(true);
          }
          setPendingAction(null);
        }
      } else {
        alert("Registration failed.");
      }
    } catch (err) {
      const mockUser = {
        id: 'USR-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        ...loginForm
      };
      setCurrentUser(mockUser);
      localStorage.setItem('savi_user', JSON.stringify(mockUser));
      setCustomerName(mockUser.name || '');
      setEmail(mockUser.email || '');
      setPhone(mockUser.phone || '');
      setAddress(mockUser.address || '');
      setIsLoginModalOpen(false);
      triggerToast(`Offline Mode: Registered successfully!`);
      if (pendingAction) {
        if (pendingAction.type === 'add_to_cart') {
          addToCart(pendingAction.payload.product, pendingAction.payload.size, pendingAction.payload.color);
        } else if (pendingAction.type === 'open_cart') {
          setIsCartOpen(true);
        }
        setPendingAction(null);
      }
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('savi_user');
    setCustomerName('');
    setEmail('');
    setPhone('');
    setAddress('');
    triggerToast("Logged out successfully");
  };

  const handleConfirmOnWhatsApp = () => {
    const placedOrder = userOrders.find(o => o.id === checkoutOrderId) || orders.find(o => o.id === checkoutOrderId);
    const placedTotal = placedOrder ? placedOrder.totalAmount : 0;
    const msg = `Hi SAVI'S collection! I just placed order ${checkoutOrderId} for ₹${placedTotal.toLocaleString('en-IN')} on your website. Please confirm my order!`;
    const cleanPhone = "919876543210";
    const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
  };

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    if (!trackOrderIdInput.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/track/${trackOrderIdInput.trim()}`);
      if (res.ok) {
        const order = await res.json();
        setTrackedOrder(order);
      } else {
        setTrackError("Order not found. Please double-check the Order ID (e.g. ORD-123456).");
      }
    } catch (err) {
      console.warn("Offline Track Order Simulation");
      const localMatch = orders.find(o => o.id === trackOrderIdInput.trim());
      if (localMatch) {
        setTrackedOrder(localMatch);
      } else {
        setTrackError("Offline Mode: Order not found in local cache.");
      }
    }
  };

  // Filter helper functions for storefront
  const getNewArrivals = () => products.slice(0, 10);
  const getByCategory = (categoryName) => products.filter(p => {
    const pCat = p.category.toLowerCase().replace(/[\s-]/g, '');
    const target = categoryName.toLowerCase().replace(/[\s-]/g, '');
    
    if (target === 'cotton') {
      return pCat === 'cotton' || pCat === 'frocks';
    }
    if (target === 'nightgown') {
      return pCat === 'nightgown' || pCat === 'nightwear';
    }
    return pCat === target;
  });

  // Hover image helper
  const getHoverImage = (product, idx, list) => {
    if (product.imageHover) return product.imageHover;
    if (list && list.length > 1) {
      return list[(idx + 1) % list.length].image;
    }
    return product.image;
  };

  // Smooth scroll
  const scrollTo = (id) => {
    if (activeTab !== 'shop') {
      setActiveTab('shop');
      setTimeout(() => {
        const element = document.querySelector(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Search logic
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
  };

  const getFilteredSearchProducts = () => {
    if (!searchQuery.trim()) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const searchResults = getFilteredSearchProducts();

  const handleSearchResultClick = (product) => {
    setSelectedProduct(product);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Get dynamic filtered and sorted catalog products
  const getFilteredAndSortedProducts = () => {
    let list = [...products];

    // 1. Filter by category
    if (selectedCategoryFilter !== 'All') {
      list = list.filter(p => {
        const pCat = p.category.toLowerCase().replace(/[\s-]/g, '');
        const target = selectedCategoryFilter.toLowerCase().replace(/[\s-]/g, '');
        if (target === 'cotton') {
          return pCat === 'cotton' || pCat === 'frocks';
        }
        if (target === 'nightgown') {
          return pCat === 'nightgown' || pCat === 'nightwear';
        }
        return pCat === target;
      });
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 3. Sort
    if (sortBy === 'low-high') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-low') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  };

  return (
    <div className="app-container">
      {/* Top Notification Bar */}
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 2rem', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          🚚 Free Shipping on orders above ₹599 &nbsp;|&nbsp; ✨ New arrivals every week &nbsp;|&nbsp; 📞 <a href="tel:+919876543210" style={{ textDecoration: 'underline' }}>+91 98765 43210</a>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href="#admin" style={{ fontWeight: '600', color: '#fff', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); setActiveTab(activeTab === 'admin' ? 'shop' : 'admin'); }}>⚙️ Admin Portal</a>
        </div>
      </div>

      {/* Header */}
      <header className="glass">
        <div className="header-inner">
          <a href="#" className="logo" onClick={() => setActiveTab('shop')}>
            SAVI'S <span>collection</span>
          </a>
          
          <div className="search-bar-wrap" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search for products, categories..." 
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              <button>🔍</button>
            </div>
            {isSearchFocused && searchResults.length > 0 && (
              <div className="search-results-dropdown glass">
                {searchResults.map(p => (
                  <div 
                    key={p.id} 
                    className="search-result-item" 
                    onClick={() => handleSearchResultClick(p)}
                  >
                    <img src={p.image} alt={p.name} />
                    <div>
                      <div className="search-result-name">{p.name}</div>
                      <div className="search-result-cat">{p.category} · ₹{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
 
          <div className="header-actions">
            <div className="theme-selector-wrap" style={{ display: 'flex', alignItems: 'center' }}>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '10px'
                }}
              >
                <option value="light">☀️ Light Luxe</option>
                <option value="dark">🌙 Midnight Glass</option>
                <option value="emerald">🌲 Emerald Royale</option>
                <option value="velvet">🍷 Velvet Gold</option>
                <option value="indigo">🌌 Indigo Glow</option>
              </select>
            </div>

            {currentUser ? (
              <button className="hdr-btn" onClick={() => { setIsProfileOpen(true); fetchUserOrders(); }}>
                <span className="icon">👤</span>
                <span>{currentUser.name || 'Account'}</span>
              </button>
            ) : (
              <button className="hdr-btn" onClick={() => { setPendingAction(null); setIsLoginModalOpen(true); }}>
                <span className="icon">👤</span>
                <span>Account</span>
              </button>
            )}
            
            <button className="hdr-btn" onClick={() => setIsWishlistOpen(true)} style={{ position: 'relative' }}>
              <span className="icon">❤️</span>
              <span>Wishlist</span>
              {wishlist.length > 0 && <span className="cart-badge" style={{ background: 'var(--primary)', top: '-5px', right: '-5px' }}>{wishlist.length}</span>}
            </button>
            
            <button 
              className="hdr-btn" 
              onClick={() => {
                if (!currentUser) {
                  setPendingAction({ type: 'open_cart' });
                  setIsLoginModalOpen(true);
                  triggerToast("Please login or register to view your cart!");
                } else {
                  setIsCartOpen(true);
                }
              }}
            >
              <span className="icon">🛒</span>
              <span>Cart</span>
              <span className="cart-badge">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navbar Tabs */}
      {activeTab === 'shop' && (
        <nav className="glass">
          <div className="nav-inner">
            <a href="#all" className={`nav-link ${selectedCategoryFilter === 'All' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('All'); }}>All Items</a>
            <a href="#kids" className={`nav-link ${selectedCategoryFilter === 'Kids' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Kids'); }}>Kids Collections</a>
            <a href="#collections" className={`nav-link ${selectedCategoryFilter === 'Home Essentials' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Home Essentials'); }}>Home Essentials</a>
            <a href="#coords" className={`nav-link ${selectedCategoryFilter === 'Co-ords' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Co-ords'); }}>Co Ords</a>
            <a href="#cotton" className={`nav-link ${selectedCategoryFilter === 'Cotton' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Cotton'); }}>Cotton Collection</a>
            <a href="#feeding" className={`nav-link ${selectedCategoryFilter === 'Feeding' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Feeding'); }}>Feeding Dress</a>
            <a href="#kurtis" className={`nav-link ${selectedCategoryFilter === 'Kurtis' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Kurtis'); }}>Kurtis</a>
            <a href="#nightgown" className={`nav-link ${selectedCategoryFilter === 'Nightgown' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Nightgown'); }}>Night Gown</a>
            <a href="#shorttops" className={`nav-link ${selectedCategoryFilter === 'Short Tops' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setSelectedCategoryFilter('Short Tops'); }}>Short Tops</a>
            <a href="#sarees" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('#sarees'); }}>Sarees</a>
            <a href="#track" className="nav-link" onClick={(e) => { e.preventDefault(); setTrackOrderIdInput(''); setTrackedOrder(null); setTrackError(''); setIsTrackModalOpen(true); }}>Track Order 🔍</a>
            <a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); scrollTo('#contact-section'); }}>Contact Us</a>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main style={{ padding: activeTab === 'shop' ? '0' : '2.5rem 0' }}>
        
        {/* TAB 1: SHOP STOREFRONT */}
        {activeTab === 'shop' && (
          <div className="storefront-page">
            
            {(selectedCategoryFilter !== 'All' || searchQuery.trim() !== '') ? (
              /* Dynamic Catalog Browser Grid */
              <section className="section" id="catalog-browser" style={{ padding: '3rem 1.5rem', background: 'var(--bg-dark)' }}>
                <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem', 
                    flexWrap: 'wrap', 
                    gap: '15px', 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '1.5rem' 
                  }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '600', fontFamily: "'Playfair Display', serif", textTransform: 'capitalize' }}>
                        {selectedCategoryFilter !== 'All' ? `${selectedCategoryFilter} Collection` : `Search Results for "${searchQuery}"`}
                      </h2>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Showing {getFilteredAndSortedProducts().length} items
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Sort By:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            fontSize: '12px',
                            fontWeight: '600',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="default">Featured</option>
                          <option value="low-high">Price: Low to High</option>
                          <option value="high-low">Price: High to Low</option>
                          <option value="alphabetical">Alphabetical (A-Z)</option>
                          <option value="newest">Newest Arrivals</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedCategoryFilter('All');
                          setSearchQuery('');
                          setSortBy('default');
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: 'none',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '.5px'
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>

                  {getFilteredAndSortedProducts().length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 10px', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', fontFamily: "'Playfair Display', serif" }}>No Apparel Found</h4>
                      <p style={{ fontSize: '13px', marginTop: '6px' }}>We couldn't find any items matching your criteria. Try adjusting your filter tags or search text.</p>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedCategoryFilter('All');
                          setSearchQuery('');
                          setSortBy('default');
                        }}
                        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '12px' }}
                      >
                        Back to Shop
                      </button>
                    </div>
                  ) : (
                    <div className="products-grid-catalog" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '30px 20px',
                      padding: '10px 0'
                    }}>
                      {getFilteredAndSortedProducts().map((p, idx, arr) => (
                        <ProductCard 
                          key={p.id} 
                          product={p} 
                          hoverImage={getHoverImage(p, idx, arr)} 
                          onOpen={() => setSelectedProduct(p)} 
                          onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                          onWishlist={() => toggleWishlist(p.id)}
                          isWishlisted={wishlist.includes(p.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* Traditional Homepage Layout */}
                {/* HERO SLIDER */}
                <div className="hero">
                  <button className="hero-arrow prev" onClick={() => setHeroIndex(prev => (prev - 1 + 3) % 3)}>‹</button>
                  <button className="hero-arrow next" onClick={() => setHeroIndex(prev => (prev + 1) % 3)}>›</button>
                  <div 
                    className="hero-slides" 
                    style={{ transform: `translateX(-${heroIndex * 100}%)`, display: 'flex', transition: 'transform .5s ease' }}
                  >
                    {/* Slide 1 */}
                    <div className="hero-slide">
                      <div className="hero-content">
                        <div className="hero-tag">🔥 Big Combo Sale is Live</div>
                        <h1 className="hero-title">Premium Fabrics<br/><em>Made in India,</em><br/>Made for You</h1>
                        <p className="hero-sub">Your favourite styles are now in combo offers at unbelievable prices. More styles · More savings · More reasons to shop.</p>
                        <a href="#new-arrivals" className="hero-cta" onClick={(e) => { e.preventDefault(); scrollTo('#new-arrivals'); }}>View All Collections →</a>
                      </div>
                      <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=80" alt="Sale" className="hero-img" />
                    </div>
                    {/* Slide 2 */}
                    <div className="hero-slide">
                      <div className="hero-content">
                        <div className="hero-tag">New Arrival</div>
                        <h1 className="hero-title">Elegant Cotton<br/><em>Co-ords</em><br/>You'll Love</h1>
                        <p className="hero-sub">Effortlessly chic cotton co-ord sets in fresh shades. Comfort meets style for every occasion.</p>
                        <a href="#coords" className="hero-cta" onClick={(e) => { e.preventDefault(); scrollTo('#coords'); }}>Shop Co-ords →</a>
                      </div>
                      <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80" alt="Co-ords" className="hero-img" />
                    </div>
                    {/* Slide 3 */}
                    <div className="hero-slide">
                      <div className="hero-content">
                        <div className="hero-tag">Trending</div>
                        <h1 className="hero-title">Breathable<br/><em>Night Gowns</em><br/>for Restful Nights</h1>
                        <p className="hero-sub">Soft fabrics, easy fits, and soothing styles designed for total comfort and relaxed evenings.</p>
                        <a href="#nightgown" className="hero-cta" onClick={(e) => { e.preventDefault(); scrollTo('#nightgown'); }}>Shop Night Gowns →</a>
                      </div>
                      <img src="https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=700&q=80" alt="Night Gown" className="hero-img" />
                    </div>
                  </div>
                  <div className="hero-dots">
                    {[0, 1, 2].map(i => (
                      <button 
                        key={i}
                        className={`hero-dot ${heroIndex === i ? 'active' : ''}`}
                        onClick={() => setHeroIndex(i)}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* MARQUEE */}
                <div className="marquee-wrap">
                  <div className="marquee">
                    <span>Free Shipping Above ₹599</span><span className="dot">★</span>
                    <span>Premium Quality Fabrics</span><span className="dot">★</span>
                    <span>100% Made in India</span><span className="dot">★</span>
                    <span>Easy Returns</span><span className="dot">★</span>
                    <span>New Arrivals Every Week</span><span className="dot">★</span>
                    <span>COD Available</span><span className="dot">★</span>
                    <span>Free Shipping Above ₹599</span><span className="dot">★</span>
                    <span>Premium Quality Fabrics</span><span className="dot">★</span>
                    <span>100% Made in India</span><span className="dot">★</span>
                    <span>Easy Returns</span><span className="dot">★</span>
                    <span>New Arrivals Every Week</span><span className="dot">★</span>
                    <span>COD Available</span><span className="dot">★</span>
                  </div>
                </div>

                {/* TRUST STRIP */}
                <div className="trust-strip">
                  <div className="trust-inner">
                    <div className="trust-item"><span className="trust-icon">🚚</span><div className="trust-text"><strong>Free Delivery</strong><span>Orders above ₹599</span></div></div>
                    <div className="trust-item"><span className="trust-icon">🔄</span><div className="trust-text"><strong>Easy Returns</strong><span>7-day return policy</span></div></div>
                    <div className="trust-item"><span className="trust-icon">🔒</span><div className="trust-text"><strong>Secure Payment</strong><span>100% safe checkout</span></div></div>
                    <div className="trust-item"><span className="trust-icon">🇮🇳</span><div className="trust-text"><strong>Made in India</strong><span>Ethically sourced</span></div></div>
                  </div>
                </div>

                {/* SHOP BY COLLECTIONS GRID */}
                <section className="section" id="collections">
                  <div className="section-inner">
                    <div className="section-head">
                      <h2 className="section-title">Shop By Collections</h2>
                    </div>
                    <div className="collections-grid">
                      {COLLECTIONS.map((c, i) => (
                        <a href={c.href} key={i} className="col-card" onClick={(e) => {
                          if (c.href.startsWith('#')) {
                            e.preventDefault();
                            scrollTo(c.href);
                          }
                        }}>
                          <div className="col-img-wrap">
                            <img src={c.img} alt={c.name} className="col-img" loading="lazy" />
                          </div>
                          <div className="col-label">
                            <div className="col-name">{c.name}</div>
                            <div className="col-cta">{c.cta} →</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </section>

            {/* PRODUCT CATEGORY ROW RENDERERS */}
            
            {/* New Arrivals Row */}
            <section className="section" id="new-arrivals" style={{ background: 'var(--light)' }}>
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">New Arrivals</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getNewArrivals().map((p, idx, arr) => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      hoverImage={getHoverImage(p, idx, arr)} 
                      onOpen={() => setSelectedProduct(p)} 
                      onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                      onWishlist={() => triggerToast("Added to Wishlist ♡")}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* PROMO BANNER */}
            <div className="promo-banner">
              <h2>🔥 Big Combo Sale is Live 🔥</h2>
              <p>Your favourite styles now in combo offers at unbelievable prices. Limited stock — First come, first served!</p>
              <a href="#new-arrivals" className="promo-cta" onClick={(e) => { e.preventDefault(); scrollTo('#new-arrivals'); }}>Shop the Sale →</a>
            </div>

            {/* Cotton Collections Section */}
            <section className="section" id="cotton">
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Cotton Collections</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Cotton').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Cotton').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Co-ords Section */}
            <section className="section" id="coords" style={{ background: 'var(--light)' }}>
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Co-ords</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Co-ords').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Co-ords').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Kurtis Section */}
            <section className="section" id="kurtis">
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Kurtis</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Kurtis').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Kurtis').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Night Gown Section */}
            <section className="section" id="nightgown" style={{ background: 'var(--light)' }}>
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Night Gown</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Nightgown').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Nightgown').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Kids Collections Section */}
            <section className="section" id="kids">
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Kids Collections</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Kids').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Kids').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Feeding Dress Section */}
            <section className="section" id="feeding" style={{ background: 'var(--light)' }}>
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Feeding Dress</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Feeding').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Feeding').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Short Tops Section */}
            <section className="section" id="shorttops" style={{ background: 'var(--light)' }}>
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Short Tops</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Short Tops').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Short Tops').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => triggerToast("Added to Wishlist ♡")}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Sarees Section */}
            <section className="section" id="sarees">
              <div className="section-inner">
                <div className="section-head">
                  <h2 className="section-title">Sarees</h2>
                  <a href="#" className="view-all" onClick={(e) => e.preventDefault()}>View all products</a>
                </div>
                <div className="products-scroll">
                  {getByCategory('Sarees').length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-secondary)' }}>Coming soon!</p>
                  ) : (
                    getByCategory('Sarees').map((p, idx, arr) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        hoverImage={getHoverImage(p, idx, arr)} 
                        onOpen={() => setSelectedProduct(p)} 
                        onAddCart={() => addToCart(p, p.sizes?.[0] || 'M', p.colors?.[0] || 'Default')} 
                        onWishlist={() => toggleWishlist(p.id)}
                        isWishlisted={wishlist.includes(p.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>

              </>
            )}

            {/* CONTACT US SECTION */}
            <section id="contact-section" className="contact-section glass" style={{ marginTop: '4rem', padding: '3rem 2rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', fontWeight: '600' }}>Get In Touch</span>
                  <h2 style={{ fontSize: '2.5rem', fontFamily: "'Playfair Display', serif", fontWeight: '700', marginTop: '0.5rem', color: 'var(--text-primary)' }}>We'd Love to Hear From You</h2>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>Have questions about our premium fabrics, sizes, custom fits, or an existing order? Drop us a message below or contact us directly.</p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'stretch' }}>
                  {/* Column 1: Store Information */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>SAVI'S Collection</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Address */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>📍</span>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Our Boutique Store</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              SAVI'S Collection, 12, Ground Floor,<br />
                              Gandhi Nagar Main Road, Bengaluru,<br />
                              Karnataka 560009
                            </p>
                          </div>
                        </div>

                        {/* Phone/WhatsApp */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>📞</span>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Phone & WhatsApp</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              <a href="tel:+919876543210" style={{ color: 'inherit', textDecoration: 'none' }}>+91 98765 43210</a>
                            </p>
                            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#25D366', fontWeight: '600', textDecoration: 'none', marginTop: '4px' }}>
                              💬 Chat with us on WhatsApp
                            </a>
                          </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>✉️</span>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Email Inquiries</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              <a href="mailto:support@saviscollection.com" style={{ color: 'inherit', textDecoration: 'none' }}>support@saviscollection.com</a>
                            </p>
                          </div>
                        </div>

                        {/* Hours */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>⏰</span>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Business Hours</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              Monday - Saturday: 10:00 AM - 8:30 PM<br />
                              Sunday: 11:00 AM - 6:00 PM
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Map mockup */}
                    <div className="map-mockup" style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)', background: 'var(--bg-dark)' }}>
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🗺️</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Bengaluru Boutique Store Map</span>
                        <span style={{ fontSize: '0.75rem', marginTop: '4px' }}>Click to view directions</span>
                        <a 
                          href="https://maps.google.com/?q=Gandhi+Nagar+Bengaluru" 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary" 
                          style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          Open Maps
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Contact Form */}
                  <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Send a Message</h3>
                    <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Full Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="Your Name"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Email Address *</label>
                          <input 
                            type="email" 
                            required 
                            placeholder="your@email.com"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Phone Number</label>
                          <input 
                            type="tel" 
                            placeholder="e.g. +91 98765 43210"
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Subject *</label>
                          <select 
                            value={contactForm.subject}
                            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                          >
                            <option value="General Inquiry">General Inquiry</option>
                            <option value="Order Status">Order Status / Tracking</option>
                            <option value="Custom Fit">Custom Sizing / Fitting</option>
                            <option value="Wholesale">Wholesale & Bulk Orders</option>
                            <option value="Feedback">Suggestions & Feedback</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Message *</label>
                        <textarea 
                          rows="4" 
                          required 
                          placeholder="Tell us what you're looking for..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: '600', border: 'none', borderRadius: '4px', background: 'var(--primary)', color: '#fff', cursor: 'pointer', transition: 'transform 0.2s' }}
                      >
                        Submit Message
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: ADMIN ANALYTICS DASHBOARD */}
        {activeTab === 'admin' && !adminToken && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '75vh',
            padding: '2rem 1.5rem',
            animation: 'fadeInUp 0.6s ease'
          }}>
            <div className="glass" style={{
              width: '100%',
              maxWidth: '420px',
              padding: '2.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(26, 26, 26, 0.65)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '0.5rem'
                }}>
                  SAVI'S <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Admin</span>
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  Please enter credentials to access dashboard
                </p>
              </div>

              {adminLoginError && (
                <div style={{
                  background: 'rgba(244, 67, 54, 0.15)',
                  borderLeft: '4px solid var(--danger)',
                  color: '#ff8a80',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}>
                  ⚠️ {adminLoginError}
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Admin Username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '12px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Authorized Login
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a
                  href="#back"
                  onClick={(e) => { e.preventDefault(); setActiveTab('shop'); }}
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    borderBottom: '1px dotted rgba(255,255,255,0.4)',
                    paddingBottom: '2px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#fff'}
                  onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  ← Return to Storefront
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && adminToken && (
          <div className="admin-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', minHeight: '80vh' }}>
              
              {/* ADMIN SIDEBAR */}
              <div className="sidebar" style={{ flexShrink: 0 }}>
                <div className="logo" style={{ color: '#fff', fontSize: '20px', fontWeight: '600', marginBottom: '2rem', fontFamily: "'Playfair Display', serif" }}>
                  SAVI'S <span style={{ fontWeight: '400', color: 'rgba(255,255,255,0.6)' }}>admin</span>
                </div>
                <ul className="nav-menu">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${adminSubTab === 'dashboard' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('dashboard')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                      <span className="icon">📊</span> Dashboard
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${adminSubTab === 'orders' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('orders')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                      <span className="icon">📦</span> Orders ({orders.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${adminSubTab === 'products' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('products')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                      <span className="icon">👕</span> Products ({products.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${adminSubTab === 'customers' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('customers')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                      <span className="icon">👥</span> Customers & Outreach ({customers.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${adminSubTab === 'inquiries' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('inquiries')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                      <span className="icon">✉️</span> Contact Messages ({inquiries.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${adminSubTab === 'billing' ? 'active' : ''}`}
                      onClick={() => setAdminSubTab('billing')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                    >
                      <span className="icon">📄</span> Invoicing & Billing
                    </button>
                  </li>
                  <li className="nav-item" style={{ marginTop: '2rem' }}>
                    <button 
                      className="nav-link"
                      onClick={() => setActiveTab('shop')}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'rgba(255,255,255,0.7)' }}
                    >
                      <span className="icon">🛒</span> Return to Shop
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className="nav-link"
                      onClick={handleAdminLogout}
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit', color: 'var(--danger)' }}
                    >
                      <span className="icon">🚪</span> Logout
                    </button>
                  </li>
                </ul>
              </div>

              {/* ADMIN SUB TAB CONTENT */}
              <div style={{ flex: 1 }}>
                
                {/* ADMIN HEADER */}
                <div className="admin-header glass" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '600', fontFamily: "'Playfair Display', serif", margin: 0 }}>
                    {adminSubTab === 'dashboard' && "Analytics Dashboard"}
                    {adminSubTab === 'orders' && "Manage Client Orders"}
                    {adminSubTab === 'products' && "Manage Catalog Items"}
                    {adminSubTab === 'customers' && "Customer Database & Outreach Hub"}
                    {adminSubTab === 'inquiries' && "Contact Messages & Inquiries"}
                    {adminSubTab === 'billing' && "Boutique Invoicing & POS Billing"}
                  </h1>
                  <div className="admin-actions">
                    {adminSubTab === 'products' && (
                      <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>＋ Add New Product</button>
                    )}
                    <span className="user-badge">👑 Admin Active</span>
                  </div>
                </div>

                {/* STATS ANALYTICS GRID */}
                {adminSubTab === 'dashboard' && (
                  <>
                    <div className="stats-grid">
                      <div className="stat-card glass">
                        <div className="label">Total Revenue</div>
                        <div className="value">₹{stats.totalSales.toLocaleString('en-IN')}</div>
                        <div className="change">Live updates active</div>
                      </div>
                      <div className="stat-card glass">
                        <div className="label">Total Orders</div>
                        <div className="value">{stats.totalOrders}</div>
                        <div className="change">Customer checkouts</div>
                      </div>
                      <div className="stat-card glass">
                        <div className="label">Active Products</div>
                        <div className="value">{stats.totalProducts}</div>
                        <div className="change">Web storefront catalog</div>
                      </div>
                      <div className="stat-card glass">
                        <div className="label">Registered Customers</div>
                        <div className="value">{stats.totalCustomers}</div>
                        <div className="change">In database registry</div>
                      </div>
                    </div>

                    {/* RECENT ORDERS ON DASHBOARD */}
                    <div className="section glass" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                      <h2 className="section-title">Recent Client Orders</h2>
                      <div className="table-wrapper">
                        {orders.length === 0 ? (
                          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No orders registered in the system yet.</p>
                        ) : (
                          <table>
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Order Status</th>
                                <th>Payment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.slice(0, 5).map(o => (
                                <tr key={o.id}>
                                  <td style={{ fontWeight: '600' }}>{o.id}</td>
                                  <td>
                                    <div>{o.customerName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{o.phone || o.email}</div>
                                  </td>
                                  <td style={{ fontSize: '0.85rem' }}>
                                    {o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                  </td>
                                  <td style={{ fontWeight: '600' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                                  <td>
                                    <span className={`status-badge status-${o.status.toLowerCase()}`}>{o.status}</span>
                                  </td>
                                  <td>
                                    <span className={`payment-badge payment-${(o.paymentStatus || 'Pending').toLowerCase()}`}>
                                      {o.paymentStatus || 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      {orders.length > 5 && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setAdminSubTab('orders')} 
                          style={{ marginTop: '1rem', width: '100%' }}
                        >
                          View All Orders
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* ORDERS MANAGEMENT TAB */}
                {adminSubTab === 'orders' && (
                  <div className="section glass" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                      <h2 className="section-title" style={{ margin: 0 }}>All Orders Log</h2>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                          <button 
                            key={status}
                            onClick={() => setOrderFilter(status)}
                            className={`btn ${orderFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem' }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '1rem' }}>
                      {orders.filter(o => orderFilter === 'All' || o.status === orderFilter).length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '8px' }}>No orders match this filter.</p>
                      ) : (
                        orders.filter(o => orderFilter === 'All' || o.status === orderFilter).map(o => (
                          <div key={o.id} className="glass" style={{
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            background: 'var(--bg-card)',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                          }}>
                            {/* Card Header (Amazon Style) */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 20px',
                              background: 'rgba(0,0,0,0.15)',
                              borderBottom: '1px solid var(--border-color)',
                              fontSize: '0.85rem',
                              flexWrap: 'wrap',
                              gap: '15px'
                            }}>
                              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Order Placed</span>
                                  <strong style={{ color: 'var(--text-primary)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Total Amount</span>
                                  <strong style={{ color: 'var(--primary)', fontWeight: '600' }}>₹{o.totalAmount.toLocaleString('en-IN')}</strong>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>Deliver To</span>
                                  <strong style={{ color: 'var(--text-primary)' }}>{o.customerName}</strong>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>ORDER # {o.id}</span>
                                <span style={{ 
                                  fontSize: '0.8rem', 
                                  fontWeight: '600', 
                                  padding: '3px 8px', 
                                  borderRadius: '4px',
                                  background: o.status === 'Delivered' ? 'rgba(45, 140, 78, 0.15)' : o.status === 'Cancelled' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                                  color: o.status === 'Delivered' ? '#2d8c4e' : o.status === 'Cancelled' ? '#f44336' : '#ff9800'
                                }}>
                                  {o.status}
                                </span>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
                              
                              {/* Left Side: Order Items */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {o.items.map((item, idx) => {
                                  const itemImg = item.image || (products.find(p => p.id === item.id)?.image) || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100&auto=format&fit=crop';
                                  return (
                                    <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: idx < o.items.length - 1 ? '1px dotted var(--border-color)' : 'none', paddingBottom: idx < o.items.length - 1 ? '15px' : '0' }}>
                                      <img 
                                        src={itemImg} 
                                        alt={item.name} 
                                        style={{ 
                                          width: '70px', 
                                          height: '85px', 
                                          objectFit: 'cover', 
                                          borderRadius: '6px', 
                                          border: '1px solid var(--border-color)',
                                          background: '#fff'
                                        }} 
                                      />
                                      <div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{item.name}</h4>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                          Size: <strong style={{ color: 'var(--text-primary)' }}>{item.size || 'M'}</strong> | Color: <strong style={{ color: 'var(--text-primary)' }}>{item.color || 'Default'}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                          Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong> | Price: <strong style={{ color: 'var(--text-primary)' }}>₹{item.price}</strong>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Right Side: Shipping Details & Quick Actions */}
                              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'space-between' }}>
                                <div>
                                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>Shipping Destination</h4>
                                  <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{o.customerName}</strong><br/>
                                    <span style={{ color: 'var(--text-secondary)' }}>📞 {o.phone}</span><br/>
                                    <span style={{ color: 'var(--text-secondary)' }}>✉️ {o.email}</span><br/>
                                    <span style={{ color: 'var(--text-primary)', display: 'block', marginTop: '6px', fontSize: '0.8rem' }}>📍 {o.address}</span>
                                  </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px 15px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Update Status</span>
                                    <select 
                                      value={o.status}
                                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.75rem' }}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payment</span>
                                    <select 
                                      value={o.paymentStatus || 'Pending'}
                                      onChange={(e) => handleUpdateOrderPayment(o.id, e.target.value)}
                                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.75rem' }}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Failed">Failed</option>
                                    </select>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                                  <button 
                                    onClick={() => handleDeleteOrder(o.id)}
                                    className="btn btn-secondary"
                                    style={{ 
                                      padding: '6px 12px', 
                                      fontSize: '0.75rem', 
                                      borderRadius: '4px', 
                                      background: 'rgba(244, 67, 54, 0.1)', 
                                      color: '#ff8a80', 
                                      border: '1px solid rgba(244, 67, 54, 0.2)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    🗑️ Delete Order Record
                                  </button>
                                </div>

                              </div>

                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* PRODUCTS CATALOG MANAGEMENT TAB */}
                {adminSubTab === 'products' && (
                  <div className="section glass" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock / Options</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(p => (
                            <tr key={p.id}>
                              <td>
                                <img src={p.image} alt={p.name} style={{ width: '45px', height: '55px', objectFit: 'cover', borderRadius: '4px', background: 'var(--light)' }} />
                              </td>
                              <td style={{ fontWeight: '500', maxWidth: '280px', whiteSpace: 'normal' }}>
                                {p.name}
                                {p.featured && <span className="badge badge-primary" style={{ marginLeft: '8px', fontSize: '8px' }}>Featured</span>}
                              </td>
                              <td>{p.category}</td>
                              <td style={{ fontWeight: '600' }}>₹{p.price.toLocaleString('en-IN')}</td>
                               <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <div style={{ marginBottom: '6px' }}>
                                  Sizes: {p.sizes ? p.sizes.join(', ') : 'Default'} · Colors: {p.colors ? p.colors.join(', ') : 'Default'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '10px', 
                                    fontWeight: '700',
                                    background: (p.stock === undefined || p.stock > 5) ? 'rgba(45, 140, 78, 0.15)' : (p.stock === 0 ? 'rgba(244, 67, 54, 0.15)' : 'rgba(255, 152, 0, 0.15)'),
                                    color: (p.stock === undefined || p.stock > 5) ? '#2d8c4e' : (p.stock === 0 ? '#f44336' : '#ff9800')
                                  }}>
                                    Stock: {p.stock !== undefined ? p.stock : 20}
                                  </span>
                                  <input 
                                    type="number" 
                                    id={`restock-${p.id}`}
                                    defaultValue={p.stock !== undefined ? p.stock : 20}
                                    style={{ width: '60px', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '11px' }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const newVal = document.getElementById(`restock-${p.id}`).value;
                                      handleRestockProduct(p.id, newVal);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '10px', borderRadius: '4px' }}
                                  >
                                    Update Stock
                                  </button>
                                </div>
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="btn btn-danger"
                                  style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}



                {/* CUSTOMERS & OUTREACH MARKETING TAB */}
                {adminSubTab === 'customers' && (
                  <div className="section glass" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
                      
                      {/* Customer list table */}
                      <div className="section" style={{ padding: 0 }}>
                        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Registered Customers ({customers.length})</h2>
                        <div className="table-wrapper">
                          {customers.length === 0 ? (
                            <p style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>No registered customers found.</p>
                          ) : (
                            <table>
                              <thead>
                                <tr>
                                  <th>Customer Details</th>
                                  <th>Address</th>
                                  <th>Marketing Outreach Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {customers.map(c => (
                                  <tr key={c.id}>
                                    <td>
                                      <strong>{c.name || 'Unnamed User'}</strong><br/>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🆔 {c.id}</span><br/>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>✉️ {c.email}</span><br/>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📞 {c.phone}</span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', maxWidth: '180px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                      {c.address || 'No address saved'}
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                          className="btn btn-secondary"
                                          onClick={() => handleIndividualOutreach(c.id, 'whatsapp', c.email, c.phone, c.name)}
                                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#25D366', color: '#fff', border: 'none' }}
                                        >
                                          💬 WhatsApp
                                        </button>
                                        <button 
                                          className="btn btn-secondary"
                                          onClick={() => handleIndividualOutreach(c.id, 'email', c.email, c.phone, c.name)}
                                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none' }}
                                        >
                                          ✉️ Email
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                      {/* Bulk campaign outreach card */}
                      <div className="guide-card" style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>📢 Launch Outreach Campaign</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                          Draft a personalized campaign message. Use the placeholder <code>[Name]</code> to dynamically insert each customer's name.
                        </p>
                        <form onSubmit={handleBulkOutreach} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div className="form-group">
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Campaign Channel</label>
                            <select
                              value={outreachForm.type}
                              onChange={(e) => setOutreachForm({ ...outreachForm, type: e.target.value })}
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
                            >
                              <option value="whatsapp">WhatsApp Broadcast (api.whatsapp.com)</option>
                              <option value="email">Email Broadcast (Simulated Mailer & Mailto Logs)</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Message Template</label>
                            <textarea
                              rows="5"
                              required
                              value={outreachForm.message}
                              onChange={(e) => setOutreachForm({ ...outreachForm, message: e.target.value })}
                              placeholder="e.g. Hi [Name], premium fabrics combo offers are live at SAVI'S! Get 20% discount."
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={campaignProgress}
                            style={{ padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                          >
                            {campaignProgress ? 'Launching Broadcast...' : 'Launch Broadcast Campaign'}
                          </button>
                        </form>
                        
                        {campaignStatus && (
                          <div style={{ marginTop: '1.5rem', padding: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: outreachForm.type === 'whatsapp' ? '#25D366' : 'var(--text-primary)', lineHeight: '1.4' }}>
                            ℹ️ <b>Campaign Log:</b><br/>{campaignStatus}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* CONTACT MESSAGES / INQUIRIES SUBTAB */}
                {adminSubTab === 'inquiries' && (
                  <div className="section glass" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                    <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Client Messages & Inquiries ({inquiries.length})</h2>
                    
                    <div className="table-wrapper">
                      {inquiries.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>✉️</span>
                          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)' }}>No messages received yet.</p>
                          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem' }}>Messages submitted through the contact form will appear here.</p>
                        </div>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>Sender Details</th>
                              <th>Subject</th>
                              <th>Message Content</th>
                              <th>Submitted At</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inquiries.map(inq => (
                              <tr key={inq.id}>
                                <td>
                                  <strong>{inq.name}</strong><br/>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>🆔 {inq.id}</span><br/>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>✉️ <a href={`mailto:${inq.email}`} style={{ color: 'inherit' }}>{inq.email}</a></span>
                                  {inq.phone && (
                                    <>
                                      <br/>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📞 <a href={`tel:${inq.phone}`} style={{ color: 'inherit' }}>{inq.phone}</a></span>
                                    </>
                                  )}
                                </td>
                                <td>
                                  <span style={{ 
                                    padding: '3px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600', 
                                    background: inq.subject === 'Wholesale' ? 'rgba(218, 165, 32, 0.15)' : inq.subject === 'Order Status' ? 'rgba(30, 144, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    color: inq.subject === 'Wholesale' ? '#daa520' : inq.subject === 'Order Status' ? '#1e90ff' : 'var(--text-primary)',
                                    border: '1px solid currentColor'
                                  }}>
                                    {inq.subject}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                  {inq.message}
                                </td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {new Date(inq.createdAt).toLocaleString()}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <a 
                                      className="btn btn-primary"
                                      href={`mailto:${inq.email}?subject=Re: SAVI'S Collection Inquiry [${inq.id}] - ${inq.subject}&body=Hi ${inq.name},%0D%0A%0D%0AThank you for contacting SAVI'S Collection.%0D%0A%0D%0ARegarding your query: "${inq.message}"%0D%0A%0D%0A`}
                                      style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                    >
                                      ✉️ Reply
                                    </a>
                                    {inq.phone && (
                                      <a 
                                        className="btn btn-secondary"
                                        href={`https://wa.me/${inq.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inq.name)},%20this%20is%20SAVI'S%20Collection%20responding%20to%20your%20message%20regarding%20${encodeURIComponent(inq.subject)}.`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#25D366', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                                      >
                                        💬 WhatsApp
                                      </a>
                                    )}
                                    <button 
                                      className="btn btn-secondary"
                                      onClick={() => handleDeleteInquiry(inq.id)}
                                      style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--danger)', color: '#fff', border: 'none' }}
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* BILLING & INVOICING SUBTAB */}
                {adminSubTab === 'billing' && (
                  <div className="section glass" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
                      
                      {/* Left Side: Invoice Creation Form */}
                      <div style={{ background: 'var(--bg-dark)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📄 Generate Customer Bill / Invoice
                        </h3>
                        
                        <form onSubmit={handleCreateBill} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          
                          {/* Customer Selection */}
                          <div className="form-group">
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Select Customer Registry</label>
                            <select
                              value={billingCustomer}
                              onChange={(e) => setBillingCustomer(e.target.value)}
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            >
                              <option value="new">🆕 Register & Bill New Customer</option>
                              {customers.map(c => (
                                <option key={c.id} value={c.id}>👤 {c.name} ({c.phone})</option>
                              ))}
                            </select>
                          </div>

                          {/* New Customer Info Input */}
                          {billingCustomer === 'new' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                  <input 
                                    type="text" 
                                    placeholder="Customer Full Name" 
                                    required={billingCustomer === 'new'}
                                    value={billingNewCustName}
                                    onChange={(e) => setBillingNewCustName(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '13px' }}
                                  />
                                </div>
                                <div className="form-group">
                                  <input 
                                    type="tel" 
                                    placeholder="Phone Number" 
                                    required={billingCustomer === 'new'}
                                    value={billingNewCustPhone}
                                    onChange={(e) => setBillingNewCustPhone(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '13px' }}
                                  />
                                </div>
                              </div>
                              <div className="form-group">
                                  <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    required={billingCustomer === 'new'}
                                    value={billingNewCustEmail}
                                    onChange={(e) => setBillingNewCustEmail(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '13px' }}
                                  />
                              </div>
                              <div className="form-group">
                                <textarea 
                                  placeholder="Shipping/Billing Address" 
                                  rows="2"
                                  value={billingNewCustAddress}
                                  onChange={(e) => setBillingNewCustAddress(e.target.value)}
                                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                              </div>
                            </div>
                          )}

                          <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '5px 0' }} />

                          {/* Product Selection */}
                          <div className="form-group">
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Select Product to Add</label>
                            <select
                              value={billingSelectedProdId}
                              onChange={(e) => setBillingSelectedProdId(e.target.value)}
                              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                            >
                              <option value="">-- Choose apparel item --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  👕 {p.name} (Stock: {p.stock !== undefined ? p.stock : 20} | Price: ₹{p.price})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Selected Product swatch options */}
                          {billingSelectedProdId && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {/* Size swatch select */}
                                <div className="form-group">
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Size</label>
                                  <select 
                                    value={billingSelectedSize}
                                    onChange={(e) => setBillingSelectedSize(e.target.value)}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '12px' }}
                                  >
                                    {(products.find(p => p.id === billingSelectedProdId)?.sizes || ['S', 'M', 'L', 'XL']).map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Color swatch select */}
                                <div className="form-group">
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Color</label>
                                  <select 
                                    value={billingSelectedColor}
                                    onChange={(e) => setBillingSelectedColor(e.target.value)}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '12px' }}
                                  >
                                    {(products.find(p => p.id === billingSelectedProdId)?.colors || ['Default']).map(c => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px', alignItems: 'flex-end' }}>
                                {/* Quantity */}
                                <div className="form-group">
                                  <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Quantity</label>
                                  <input 
                                    type="number" 
                                    min="1"
                                    max={products.find(p => p.id === billingSelectedProdId)?.stock || 20}
                                    value={billingSelectedQty}
                                    onChange={(e) => setBillingSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '12px' }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddBillingItem}
                                  className="btn btn-secondary"
                                  style={{ padding: '8px', fontSize: '0.8rem', width: '100%' }}
                                >
                                  📥 Add Item to Bill
                                </button>
                              </div>

                            </div>
                          )}

                          <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '5px 0' }} />

                          {/* Taxes and Discounting */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Tax Rate (GST)</label>
                              <select
                                value={billingTaxRate}
                                onChange={(e) => setBillingTaxRate(parseInt(e.target.value))}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px' }}
                              >
                                <option value="0">0% (GST Exempted)</option>
                                <option value="5">5% (Apparel below ₹1000)</option>
                                <option value="12">12% (Standard Fabric)</option>
                                <option value="18">18% (Luxury Designer Goods)</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Discount (₹)</label>
                              <input 
                                type="number" 
                                min="0"
                                value={billingDiscount}
                                onChange={(e) => setBillingDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)', fontSize: '13px' }}
                              />
                            </div>
                          </div>

                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            style={{ padding: '14px', borderRadius: '4px', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '10px' }}
                          >
                            💾 Generate Invoice & Update Stocks
                          </button>

                        </form>
                      </div>

                      {/* Right Side: Invoice Items Preview list */}
                      <div className="guide-card" style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🧾 Invoice Items List
                        </h3>

                        {billingInvoiceItems.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '60px 10px', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🧾</span>
                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)' }}>Invoice is currently empty.</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem' }}>Select products on the left and click "Add Item" to draft the bill.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                              {billingInvoiceItems.map(item => (
                                <div key={item.itemKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px dotted var(--border-color)' }}>
                                  <div style={{ fontSize: '13px' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                      Size: {item.size} | Color: {item.color} · Qty: {item.quantity} · @ ₹{item.price} each
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveBillingItem(item.itemKey)}
                                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Summary Math Block */}
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span>
                                <span>₹{billingInvoiceItems.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString('en-IN')}</span>
                              </div>
                              {billingDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                                  <span>Discount Applied</span>
                                  <span>- ₹{parseFloat(billingDiscount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Estimated Tax ({billingTaxRate}%)</span>
                                <span>
                                  ₹{Math.round(
                                    (billingInvoiceItems.reduce((acc, i) => acc + i.price * i.quantity, 0) - billingDiscount) * (billingTaxRate / 100)
                                  ).toLocaleString('en-IN')}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '5px' }}>
                                <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Grand Total</strong>
                                <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>
                                  ₹{Math.max(
                                    0,
                                    billingInvoiceItems.reduce((acc, i) => acc + i.price * i.quantity, 0) - billingDiscount + Math.round((billingInvoiceItems.reduce((acc, i) => acc + i.price * i.quantity, 0) - billingDiscount) * (billingTaxRate / 100))
                                  ).toLocaleString('en-IN')}
                                </strong>
                              </div>

                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="logo" style={{ color: '#fff' }} onClick={(e) => { e.preventDefault(); setActiveTab('shop'); }}>
              SAVI'S <span style={{ color: 'rgba(255,255,255,.5)' }}>collection</span>
            </a>
            <p className="footer-about">Premium fabrics, Made in India, Made for you. Quality materials ethically sourced and crafted with love.</p>
            <div className="footer-socials">
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>f</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>in</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>📸</a>
              <a href="#" className="social" onClick={(e) => e.preventDefault()}>▶</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Collections</h4>
            <ul>
              <li><a href="#kids" onClick={(e) => { e.preventDefault(); scrollTo('#kids'); }}>Kids Collections</a></li>
              <li><a href="#collections" onClick={(e) => { e.preventDefault(); scrollTo('#collections'); }}>Home Essentials</a></li>
              <li><a href="#coords" onClick={(e) => { e.preventDefault(); scrollTo('#coords'); }}>Co Ords</a></li>
              <li><a href="#cotton" onClick={(e) => { e.preventDefault(); scrollTo('#cotton'); }}>Cotton Collection</a></li>
              <li><a href="#feeding" onClick={(e) => { e.preventDefault(); scrollTo('#feeding'); }}>Feeding Dress</a></li>
              <li><a href="#kurtis" onClick={(e) => { e.preventDefault(); scrollTo('#kurtis'); }}>Kurtis</a></li>
              <li><a href="#nightgown" onClick={(e) => { e.preventDefault(); scrollTo('#nightgown'); }}>Night Gown</a></li>
              <li><a href="#sarees" onClick={(e) => { e.preventDefault(); scrollTo('#sarees'); }}>Sarees</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Customer Help</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Track Your Order</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Return & Exchange</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Size Guide</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Shipping Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>FAQ</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); setActiveTab('shop'); setTimeout(() => scrollTo('#contact-section'), 100); }}>Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>About Us</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Refund Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 SAVI'S collection — All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </footer>

      {/* WHATSAPP FLOATING BUTTON */}
      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="wa-btn" title="Chat on WhatsApp">💬</a>

      {/* TOAST NOTIFICATION POPUP */}
      <div className={`toast ${toastShow ? 'show' : ''}`} id="toast">
        {toastMessage}
      </div>

      {/* BILLING INVOICE RECEIPT MODAL */}
      {generatedInvoice && (
        <div className="modal-overlay" style={{ zIndex: 1005 }} onClick={() => setGeneratedInvoice(null)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#1a1a1a', maxWidth: '550px', width: '95%', padding: '2.5rem' }}>
            
            {/* Invoice Branding Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '24px', fontFamily: "'Playfair Display', serif", fontWeight: '700', color: 'var(--primary)', margin: '0 0 5px 0' }}>SAVI'S COLLECTION</h1>
              <span style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Fabric Store & Boutique</span>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>Bengaluru Boutique Store · Phone: +91 98765 43210</div>
            </div>

            {/* Invoice Meta Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '12px', color: '#333', marginBottom: '1.5rem' }}>
              <div>
                <strong>BILL TO:</strong>
                <div style={{ fontWeight: '600', marginTop: '4px', fontSize: '14px' }}>{generatedInvoice.customerName}</div>
                <div style={{ marginTop: '2px' }}>📞 {generatedInvoice.phone}</div>
                <div>✉️ {generatedInvoice.email}</div>
                <div style={{ marginTop: '4px', color: '#555' }}>📍 {generatedInvoice.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>INVOICE DETAIL:</strong>
                <div style={{ fontWeight: '600', marginTop: '4px', color: 'var(--primary)' }}>Receipt #: {generatedInvoice.id}</div>
                <div>Date: {new Date(generatedInvoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div>Payment Method: <strong>UPI / POS Receipt</strong></div>
                <div>Status: <span style={{ color: 'var(--green)', fontWeight: '700' }}>PAID</span></div>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #eaeaea', textAlign: 'left', background: '#f9f9f9' }}>
                  <th style={{ padding: '8px', color: '#1a1a1a', background: 'transparent' }}>Item Details</th>
                  <th style={{ padding: '8px', color: '#1a1a1a', background: 'transparent', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', color: '#1a1a1a', background: 'transparent', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px', color: '#1a1a1a', background: 'transparent', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {generatedInvoice.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f2f2f2' }}>
                    <td style={{ padding: '8px' }}>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>Size: {item.size} | Color: {item.color}</div>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Invoice Total Calculation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', alignItems: 'flex-end', borderTop: '1.5px solid #eaeaea', paddingTop: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
                <span style={{ color: '#555' }}>Subtotal:</span>
                <strong>₹{(generatedInvoice.subtotalAmount || generatedInvoice.totalAmount).toLocaleString('en-IN')}</strong>
              </div>
              {generatedInvoice.discountAmount > 0 && (
                <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', color: 'var(--green)' }}>
                  <span>Discount Applied:</span>
                  <strong>- ₹{generatedInvoice.discountAmount.toLocaleString('en-IN')}</strong>
                </div>
              )}
              {generatedInvoice.taxAmount > 0 && (
                <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between' }}>
                  <span style={{ color: '#555' }}>GST Tax ({generatedInvoice.taxRate || 18}%):</span>
                  <strong>₹{generatedInvoice.taxAmount.toLocaleString('en-IN')}</strong>
                </div>
              )}
              <div style={{ display: 'flex', width: '220px', justifyContent: 'space-between', borderTop: '1px dashed #ccc', paddingTop: '6px', marginTop: '4px', fontSize: '14px' }}>
                <strong style={{ color: '#1a1a1a' }}>Total Amount Paid:</strong>
                <strong style={{ color: 'var(--primary)' }}>₹{generatedInvoice.totalAmount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Print or Send Invoice Button Footer */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => window.print()} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px', fontSize: '12px' }}
              >
                🖨️ Print Invoice Receipt
              </button>
              <button 
                onClick={() => {
                  const itemsDesc = generatedInvoice.items.map(item => `• ${item.name} (${item.size}/${item.color}) x${item.quantity}`).join('%0D%0A');
                  const message = `Hi ${generatedInvoice.customerName}! Here is your invoice receipt from SAVI'S Collection.%0D%0A%0D%0A*Receipt #:* ${generatedInvoice.id}%0D%0A*Items Purchased:*%0D%0A${itemsDesc}%0D%0A%0D%0A*Discount:* -₹${generatedInvoice.discountAmount || 0}%0D%0A*GST Tax:* ₹${generatedInvoice.taxAmount || 0}%0D%0A*Total Amount Paid:* ₹${generatedInvoice.totalAmount.toLocaleString('en-IN')}%0D%0A%0D%0AThank you for shopping with us! ✨`;
                  const waUrl = `https://api.whatsapp.com/send?phone=${generatedInvoice.phone.replace(/\D/g, '')}&text=${message}`;
                  window.open(waUrl, '_blank');
                }} 
                className="btn btn-secondary" 
                style={{ flex: 1.2, padding: '10px', fontSize: '12px', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                💬 Share via WhatsApp
              </button>
              <button 
                onClick={() => setGeneratedInvoice(null)} 
                className="btn btn-secondary" 
                style={{ padding: '10px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}


      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content product-details glass" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#1a1a1a' }}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)} aria-label="Close Details">✕</button>
            <div className="modal-img-container">
              <img 
                src={getProductImageForColor(selectedProduct, selectedColor)} 
                alt={selectedProduct.name} 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop';
                }}
              />
            </div>
            <div className="modal-details" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="modal-header" style={{ marginBottom: '10px' }}>
                <span className="modal-category" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gray)', fontWeight: '600' }}>{selectedProduct.category}</span>
                <h2 className="modal-title" style={{ fontSize: '20px', fontFamily: "'Playfair Display', serif", fontWeight: '600', marginTop: '4px' }}>{selectedProduct.name}</h2>
              </div>
              <div className="modal-price" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary)', marginBottom: '15px' }}>
                ₹{selectedProduct.price.toLocaleString('en-IN')}
                {selectedProduct.oldPrice && (
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--gray)', marginLeft: '10px', fontWeight: '400' }}>
                    ₹{selectedProduct.oldPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="modal-desc" style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
                {selectedProduct.description || "Premium high-quality fabric, crafted with comfort and elegance in mind."}
              </p>
              
              <div className="option-select" style={{ marginBottom: '15px' }}>
                <span className="option-label" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Select Size</span>
                <div className="size-swatches" style={{ display: 'flex', gap: '8px' }}>
                  {(selectedProduct.sizes || ['S', 'M', 'L', 'XL']).map(size => (
                    <button
                      key={size}
                      className={`size-swatch ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      style={{ padding: '6px 12px', border: '1px solid var(--border)', background: selectedSize === size ? 'var(--primary)' : '#fff', color: selectedSize === size ? '#fff' : '#1a1a1a', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-select" style={{ marginBottom: '20px' }}>
                <span className="option-label" style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Select Color</span>
                <div className="color-swatches" style={{ display: 'flex', gap: '8px' }}>
                  {(selectedProduct.colors || ['Mustard', 'Indigo', 'Sage']).map(color => (
                    <button
                      key={color}
                      className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ padding: '6px 12px', border: '1px solid var(--border)', background: selectedColor === color ? 'var(--primary)' : '#fff', color: selectedColor === color ? '#fff' : '#1a1a1a', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => addToCart(selectedProduct, selectedSize, selectedColor)}
                style={{ padding: '12px', borderRadius: '4px', width: '100%', fontSize: '13px', fontWeight: '600' }}
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {isCartOpen && (
        <>
          <div className="overlay open" onClick={() => setIsCartOpen(false)}></div>
          <div className="cart-drawer open" style={{ background: '#fff', color: '#1a1a1a' }}>
            <div className="cart-head" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray)' }}>✕</button>
            </div>

            <div className="cart-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {checkoutSuccess ? (
                <div className="cart-empty-msg" style={{ padding: '40px 10px', textAlign: 'center' }}>
                  <div className="empty-icon" style={{ fontSize: '50px', color: 'var(--success)' }}>🎉</div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '15px 0 8px 0' }}>Order Placed Successfully!</h4>
                  <p style={{ fontSize: '13px', color: 'var(--gray)', lineHeight: '1.5' }}>Your purchase request has been submitted. The store owner will receive your order and connect with you shortly.</p>
                  <button className="btn btn-primary" onClick={() => setCheckoutSuccess(false)} style={{ marginTop: '1.5rem', padding: '10px 20px', fontSize: '12px', width: '100%' }}>
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="cart-empty-msg" style={{ textAlign: 'center', color: 'var(--gray)', padding: '50px 10px' }}>
                  <div className="empty-icon" style={{ fontSize: '52px', opacity: '0.3', marginBottom: '15px' }}>🛒</div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Your cart is empty</h4>
                  <p style={{ fontSize: '12px' }}>Add some products to get started!</p>
                </div>
              ) : (
                <>
                  <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '2rem' }}>
                    {cart.map((c, i) => (
                      <div key={c.cartItemId} className="cart-item" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <img src={c.image} alt={c.name} className="ci-img" style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '4px', background: 'var(--light)' }} />
                        <div className="ci-info" style={{ flex: 1 }}>
                          <div className="ci-name" style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.3', marginBottom: '4px' }}>{c.name}</div>
                          <div className="ci-meta" style={{ fontSize: '11px', color: 'var(--gray)', marginBottom: '8px' }}>{c.size} / {c.color} · ₹{c.price}</div>
                          <div className="ci-qty" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button className="qty-btn" onClick={() => updateCartQty(c.cartItemId, -1)} style={{ width: '24px', height: '24px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', borderRadius: '3px' }}>−</button>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{c.quantity}</span>
                            <button className="qty-btn" onClick={() => updateCartQty(c.cartItemId, 1)} style={{ width: '24px', height: '24px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', borderRadius: '3px' }}>+</button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <span className="ci-price" style={{ fontSize: '13px', fontWeight: '600' }}>₹{(c.price * c.quantity).toLocaleString('en-IN')}</span>
                          <button className="ci-remove" onClick={() => updateCartQty(c.cartItemId, -c.quantity)} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-foot-summary" style={{ borderTop: '1.5px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--gray)' }}>
                      <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: 'var(--gray)' }}>
                      <span>Delivery Charge</span>
                      <span>{getCartTotal() >= 599 ? <strong style={{ color: 'var(--green)' }}>FREE</strong> : '₹50'}</span>
                    </div>
                    
                    {getCartTotal() < 599 && (
                      <div className="free-shipping-tip" style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: '12px', background: 'rgba(200, 16, 46, 0.05)', padding: '6px 10px', borderRadius: '4px', textAlign: 'center' }}>
                        💡 Add <strong>₹{(599 - getCartTotal()).toLocaleString('en-IN')}</strong> more for <strong>FREE Shipping</strong>!
                      </div>
                    )}

                    <div className="cart-subtotal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingTop: '10px', borderTop: '1px dashed var(--border)' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>Order Estimate</span>
                      <strong style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                        ₹{(getCartTotal() >= 599 ? getCartTotal() : getCartTotal() + 50).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <button 
                      onClick={handleCheckout} 
                      className="checkout-btn" 
                      style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '4px', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      Proceed to Checkout ➔
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* WISHLIST DRAWER */}
      {isWishlistOpen && (
        <>
          <div className="overlay open" onClick={() => setIsWishlistOpen(false)}></div>
          <div className="cart-drawer open" style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', borderLeft: '1px solid var(--border-color)' }}>
            <div className="cart-head" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, fontFamily: "'Playfair Display', serif" }}>❤️ Your Wishlist ({wishlist.length})</h3>
              <button className="close-btn" onClick={() => setIsWishlistOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
            </div>

            <div className="cart-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {wishlist.length === 0 ? (
                <div className="cart-empty-msg" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '50px 10px' }}>
                  <div className="empty-icon" style={{ fontSize: '52px', opacity: '0.3', marginBottom: '15px' }}>❤️</div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Your wishlist is empty</h4>
                  <p style={{ fontSize: '12px' }}>Save your favorite items here!</p>
                </div>
              ) : (
                <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '2rem' }}>
                  {wishlist.map(id => {
                    const item = products.find(p => p.id === id);
                    if (!item) return null;
                    return (
                      <div key={item.id} className="cart-item" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <img src={item.image} alt={item.name} className="ci-img" style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '4px', background: 'var(--bg-card)' }} />
                        <div className="ci-info" style={{ flex: 1 }}>
                          <div className="ci-name" style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.3', marginBottom: '4px', color: 'var(--text-primary)' }}>{item.name}</div>
                          <div className="ci-meta" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>₹{item.price}</div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsWishlistOpen(false);
                            }}
                            style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Select Options & Buy
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <button onClick={() => toggleWishlist(item.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ADMIN ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1001 }} onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#1a1a1a', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', fontFamily: "'Playfair Display', serif" }}>Add New Apparel Product</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Product Name</label>
                <input 
                  type="text" 
                  required 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Cambric Cotton Frock"
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Price (INR)</label>
                  <input 
                    type="number" 
                    required 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="999"
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Compare Price (Old Price)</label>
                  <input 
                    type="number" 
                    value={newProduct.oldPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                    placeholder="1299"
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                >
                  <option value="Kids">Kids Collections</option>
                  <option value="Home Essentials">Home Essentials</option>
                  <option value="Co-ords">Co Ords</option>
                  <option value="Cotton">Cotton Collection</option>
                  <option value="Feeding">Feeding Dress</option>
                  <option value="Kurtis">Kurtis</option>
                  <option value="Nightwear">Night Gown</option>
                  <option value="Sarees">Sarees</option>
                  <option value="Short Tops">Short Tops</option>
                </select>
              </div>

              <div className="form-group" style={{ border: '1px dashed var(--border)', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.02)' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Product Image (Main)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    style={{ fontSize: '11px', flex: 1 }}
                  />
                  {imageUploading && <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Uploading...</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OR</span>
                  <input 
                    type="text" 
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    style={{ flex: 1, padding: '6px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '11px' }}
                  />
                </div>
                {newProduct.image && (
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <img src={newProduct.image} alt="Main Preview" style={{ height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea 
                  rows="2"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Apparel description here..."
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Sizes (comma-separated)</label>
                  <input 
                    type="text" 
                    value={newProduct.sizes}
                    onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                    placeholder="S, M, L, XL"
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Colors (comma-separated)</label>
                  <input 
                    type="text" 
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    placeholder="Mustard, Sage"
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* DYNAMIC COLOR IMAGE MAPPING */}
              {newProduct.colors && newProduct.colors.split(',').map(c => c.trim()).filter(Boolean).length > 0 && (
                <div style={{ border: '1px dashed var(--border)', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.01)', maxHeight: '180px', overflowY: 'auto' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '8px', color: 'var(--primary)' }}>🎨 Color-Specific Images (Optional)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {newProduct.colors.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                      <div key={color} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600' }}>Color: <span style={{ color: 'var(--accent)' }}>{color}</span></span>
                          {newProduct.colorImages?.[color] && (
                            <img src={newProduct.colorImages[color]} alt={color} style={{ height: '30px', width: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleColorImageUpload(color, e)}
                            style={{ fontSize: '10px', width: '150px' }}
                          />
                          <input 
                            type="text" 
                            value={newProduct.colorImages?.[color] || ''}
                            onChange={(e) => setNewProduct({
                              ...newProduct,
                              colorImages: {
                                ...newProduct.colorImages,
                                [color]: e.target.value
                              }
                            })}
                            placeholder="Or paste image URL"
                            style={{ flex: 1, padding: '4px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '10px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>Initial Stock Inventory</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={newProduct.stock !== undefined ? newProduct.stock : 20}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                  placeholder="20"
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                <input 
                  type="checkbox" 
                  id="p-feat" 
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                />
                <label htmlFor="p-feat" style={{ fontSize: '12px', fontWeight: '600' }}>Feature this product on homepage banner</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px', borderRadius: '4px' }}>
                Create Product Listing
              </button>
            </form>
          </div>
        </div>
      )}
      {isLoginModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1002 }} onClick={() => setIsLoginModalOpen(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsLoginModalOpen(false)} className="auth-close-btn" aria-label="Close authentication modal">✕</button>
            
            {/* Modal tabs */}
            <div className="auth-tabs">
              <button 
                onClick={() => setLoginTab('login')} 
                className={`auth-tab-btn ${loginTab === 'login' ? 'active' : ''}`}
              >
                Log In
              </button>
              <button 
                onClick={() => setLoginTab('register')} 
                className={`auth-tab-btn ${loginTab === 'register' ? 'active' : ''}`}
              >
                Register
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {loginTab === 'login' && (
              <div>
                <p className="auth-helper-text">
                  Welcome back! Enter your registered Email or Phone number to access your account instantly.
                </p>
                <form onSubmit={handleUserLoginOnly} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="auth-form-group">
                    <label className="auth-label">Email or Phone Number</label>
                    <input 
                      type="text" 
                      required 
                      value={emailOrPhoneInput}
                      onChange={(e) => setEmailOrPhoneInput(e.target.value)}
                      placeholder="e.g. mukil@example.com or 9876543210"
                      className="auth-input"
                    />
                  </div>
                  <button type="submit" className="auth-submit-btn">
                    Access Account ➔
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: REGISTER */}
            {loginTab === 'register' && (
              <div>
                <p className="auth-helper-text">
                  New to SAVI'S? Create a customer profile to place orders and manage your deliveries.
                </p>
                <form onSubmit={handleUserRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="auth-form-group">
                    <label className="auth-label">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={loginForm.name}
                      onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                      placeholder="e.g. Mukil Kumar"
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="e.g. mukil@example.com"
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Confirm Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={loginForm.confirmEmail}
                      onChange={(e) => setLoginForm({ ...loginForm, confirmEmail: e.target.value })}
                      placeholder="Re-enter email address"
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={loginForm.phone}
                      onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="auth-input"
                    />
                  </div>
                  <div className="auth-form-group">
                    <label className="auth-label">Default Delivery Address</label>
                    <textarea 
                      rows="2"
                      required 
                      value={loginForm.address}
                      onChange={(e) => setLoginForm({ ...loginForm, address: e.target.value })}
                      placeholder="e.g. 45 Palace Road, Bengaluru, KA"
                      className="auth-input"
                      style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="auth-submit-btn">
                    Create Profile ➔
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {isProfileOpen && currentUser && (
        <div className="modal-overlay" style={{ zIndex: 1002 }} onClick={() => setIsProfileOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#1a1a1a', maxWidth: '650px', width: '90%', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', fontFamily: "'Playfair Display', serif", margin: 0 }}>👤 My Account Profile</h2>
              <button onClick={() => setIsProfileOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray)' }}>✕</button>
            </div>

            <div className="profile-details-grid" style={{ marginBottom: '2rem', background: 'var(--light)', padding: '15px', borderRadius: '8px', fontSize: '13px' }}>
              <div>
                <strong style={{ color: 'var(--gray)' }}>Name:</strong>
                <div style={{ fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>{currentUser.name || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--gray)' }}>Email:</strong>
                <div style={{ fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>{currentUser.email || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--gray)' }}>Phone:</strong>
                <div style={{ fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>{currentUser.phone || 'N/A'}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--gray)' }}>Default Shipping Address:</strong>
                <div style={{ fontWeight: '600', marginTop: '4px', lineHeight: '1.4' }}>{currentUser.address || 'No address saved.'}</div>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>📦 Order History & Status Tracking</h3>

            {userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', color: 'var(--gray)', fontSize: '13px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                No orders placed yet. Add items to cart to start shopping!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {userOrders.map(order => {
                  return (
                    <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '15px', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
                        <div>
                          <strong>Order ID:</strong> <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{order.id}</span>
                        </div>
                        <div style={{ color: 'var(--gray)' }}>
                          Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontWeight: '600' }}>
                          Total: ₹{order.totalAmount.toLocaleString('en-IN')} ({order.paymentMethod || 'COD'})
                        </div>
                      </div>

                      {/* Items details */}
                      <div style={{ marginBottom: '15px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '4px 0', color: '#333' }}>
                            <span>• {item.name} ({item.size} / {item.color}) x{item.quantity}</span>
                            <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                          </div>
                        ))}
                      </div>

                      {/* Flipkart tracker style progress bar */}
                      <div style={{ padding: '15px 0', margin: '10px 0' }}>
                        {order.status === 'Cancelled' ? (
                          <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                            <span>❌</span> This order was <strong>Cancelled</strong>.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            {/* Line connecting the steps */}
                            <div style={{ position: 'absolute', top: '10px', left: '10%', right: '10%', height: '4px', background: '#e0e0e0', zIndex: 1 }}>
                              <div style={{ 
                                height: '100%', 
                                background: 'var(--primary)', 
                                transition: 'width 0.4s ease',
                                width: 
                                  order.status === 'Delivered' ? '100%' :
                                  order.status === 'Shipped' ? '66%' :
                                  order.status === 'Confirmed' || order.status === 'Processing' ? '33%' : '0%'
                              }}></div>
                            </div>

                            {/* Steps */}
                            {['Ordered', 'Confirmed', 'Shipped', 'Delivered'].map((step, stepIdx) => {
                              const isCompleted = 
                                (step === 'Ordered') ||
                                (step === 'Confirmed' && (order.status === 'Confirmed' || order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Delivered')) ||
                                (step === 'Shipped' && (order.status === 'Shipped' || order.status === 'Delivered')) ||
                                (step === 'Delivered' && (order.status === 'Delivered'));

                              return (
                                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '20%' }}>
                                  <div style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    background: isCompleted ? 'var(--primary)' : '#fff', 
                                    border: isCompleted ? '2px solid var(--primary)' : '2px solid #ccc', 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    color: isCompleted ? '#fff' : '#ccc',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                  }}>
                                    {isCompleted ? '✓' : stepIdx + 1}
                                  </div>
                                  <span style={{ fontSize: '11px', fontWeight: '600', marginTop: '6px', color: isCompleted ? 'var(--black)' : 'var(--gray)' }}>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {order.status === 'Pending' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleCancelOrder(order.id)}
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button 
                className="btn btn-danger" 
                onClick={() => { handleUserLogout(); setIsProfileOpen(false); }}
                style={{ padding: '10px 20px', borderRadius: '4px', fontWeight: '600' }}
              >
                Logout Account
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsProfileOpen(false)}
                style={{ padding: '10px 20px', borderRadius: '4px' }}
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {isCheckoutWizardOpen && (
        <div className="modal-overlay" style={{ zIndex: 1002 }} onClick={() => setIsCheckoutWizardOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#1a1a1a', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '12px' }}>
            
            {checkoutStep < 4 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                {['1. Delivery', '2. Payment', '3. Review'].map((stepName, idx) => {
                  const stepNum = idx + 1;
                  const isActive = checkoutStep === stepNum;
                  const isPast = checkoutStep > stepNum;
                  return (
                    <div key={stepName} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: isActive ? 'var(--primary)' : (isPast ? 'var(--green)' : '#ccc'), 
                        color: '#fff', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontWeight: '600', 
                        fontSize: '12px' 
                      }}>
                        {isPast ? '✓' : stepNum}
                      </span>
                      <strong style={{ fontSize: '13px', color: isActive ? 'var(--primary)' : 'var(--gray)' }}>{stepName}</strong>
                    </div>
                  );
                })}
              </div>
            )}

            {checkoutStep === 1 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Playfair Display', serif", marginBottom: '1.25rem' }}>📍 Delivery Address</h3>
                <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep(2); }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mukil Kumar"
                      style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. mukil@example.com"
                      style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Shipping Address</label>
                    <textarea 
                      required 
                      rows="3"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 45 Palace Road, Bengaluru, KA"
                      style={{ width: '100%', padding: '10px', border: '1.5px solid var(--border)', borderRadius: '4px', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCheckoutWizardOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '4px' }}>Continue to Payment ➔</button>
                  </div>
                </form>
              </div>
            )}

            {checkoutStep === 2 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Playfair Display', serif", marginBottom: '1.25rem' }}>💳 Select Payment Option</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'COD' ? 'rgba(200, 16, 46, 0.03)' : '#fff', borderColor: paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border)' }}>
                    <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                    <div>
                      <strong style={{ fontSize: '14px' }}>Cash on Delivery (COD)</strong>
                      <div style={{ fontSize: '11px', color: 'var(--gray)' }}>Pay at your doorstep after delivery.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'UPI' ? 'rgba(200, 16, 46, 0.03)' : '#fff', borderColor: paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border)' }}>
                    <input type="radio" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                    <div>
                      <strong style={{ fontSize: '14px' }}>UPI Transfer (Mock QR Scan)</strong>
                      <div style={{ fontSize: '11px', color: 'var(--gray)' }}>Scan Google Pay/PhonePe QR code instantly.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', background: paymentMethod === 'CARD' ? 'rgba(200, 16, 46, 0.03)' : '#fff', borderColor: paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border)' }}>
                    <input type="radio" checked={paymentMethod === 'CARD'} onChange={() => setPaymentMethod('CARD')} />
                    <div>
                      <strong style={{ fontSize: '14px' }}>Credit / Debit Card</strong>
                      <div style={{ fontSize: '11px', color: 'var(--gray)' }}>Secure checkout via MasterCard, Visa, RuPay.</div>
                    </div>
                  </label>

                </div>

                {paymentMethod === 'CARD' && (
                  <div style={{ border: '1px solid var(--border)', padding: '15px', borderRadius: '6px', background: 'var(--light)', marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>Enter Mock Card Credentials:</h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Card Number (e.g. 4111 2222 3333 4444)" 
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px' }}
                      />
                      <input 
                        type="password" 
                        placeholder="CVV" 
                        maxLength="3"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--light)', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>Scan to Pay with UPI Apps:</div>
                    <div style={{ width: '120px', height: '120px', background: '#fff', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', borderRadius: '6px' }}>
                      📱
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gray)' }}>Scan this code to simulate payment verification</div>
                    <button 
                      type="button" 
                      onClick={() => { setUpiVerified(true); triggerToast("UPI Status: Verification Successful! ✅"); }}
                      className="btn btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px', background: upiVerified ? 'var(--green)' : 'var(--primary)', color: '#fff', border: 'none' }}
                    >
                      {upiVerified ? "✓ Payment Verified" : "Simulate Payment Complete"}
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep(1)}>⬅ Back to Address</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    disabled={paymentMethod === 'CARD' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)}
                    onClick={() => setCheckoutStep(3)}
                    style={{ padding: '10px 20px', borderRadius: '4px' }}
                  >
                    Go to Final Review ➔
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Playfair Display', serif", marginBottom: '1.25rem' }}>📝 Review & Confirm Order</h3>
                
                <div style={{ border: '1px solid var(--border)', padding: '15px', borderRadius: '8px', background: 'var(--light)', marginBottom: '1.5rem', fontSize: '13px' }}>
                  <div style={{ marginBottom: '8px' }}><strong>Deliver to:</strong> {customerName} ({phone})</div>
                  <div style={{ marginBottom: '8px', color: '#555' }}><strong>Address:</strong> {address}</div>
                  <div><strong>Payment Method:</strong> {paymentMethod === 'COD' ? "Cash on Delivery" : (paymentMethod === 'UPI' ? "UPI Mobile Transfer" : "Credit/Debit Card")}</div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gray)' }}>Your Cart Items:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {cart.map(item => (
                      <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>{item.name} ({item.size}/{item.color}) x{item.quantity}</span>
                        <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Charges:</span>
                    <span>{getCartTotal() >= 599 ? <strong style={{ color: 'var(--green)' }}>FREE</strong> : '₹50'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px dashed var(--border)', paddingTop: '8px', marginTop: '4px', color: 'var(--primary)' }}>
                    <span>Final Amount:</span>
                    <span>₹{(getCartTotal() >= 599 ? getCartTotal() : getCartTotal() + 50).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep(2)}>⬅ Back to Payment</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={submitOrder}
                    style={{ padding: '12px 24px', borderRadius: '4px', background: 'var(--green)', borderColor: 'var(--green)', fontWeight: '600' }}
                  >
                    PLACE ORDER NOW ➔
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 4 && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎉</div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--green)', fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>Congratulations!</h2>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Your Order Has Been Successfully Placed!</h3>
                
                <div style={{ border: '1px solid var(--border)', padding: '15px', borderRadius: '8px', background: 'var(--light)', maxWidth: '400px', margin: '0 auto 2rem auto', fontSize: '13px', textAlign: 'left' }}>
                  <div style={{ marginBottom: '6px' }}><strong>Order Number:</strong> <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{checkoutOrderId}</span></div>
                  <div style={{ marginBottom: '6px' }}><strong>Shipped to:</strong> {customerName}</div>
                  <div style={{ marginBottom: '6px' }}><strong>Estimated Delivery:</strong> {new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} (Approx. 4 days)</div>
                  <div><strong>Payment Mode:</strong> {paymentMethod === 'COD' ? "Cash on Delivery" : "Prepaid Secure Payment"}</div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--gray)', maxWidth: '450px', margin: '0 auto 2rem auto', lineHeight: '1.5' }}>
                  Your order has been registered in our system. You can view or cancel this order status anytime by clicking on your <strong>Account Details</strong>.
                </p>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsCheckoutWizardOpen(false)}
                    style={{ padding: '12px 24px', borderRadius: '4px' }}
                  >
                    Continue Shopping
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleConfirmOnWhatsApp}
                    style={{ padding: '12px 24px', borderRadius: '4px', background: '#25D366', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    Confirm on WhatsApp 💬
                  </button>
                </div>
              </div>
            )}

        </div>
      </div>
    )}

      {isTrackModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1002 }} onClick={() => setIsTrackModalOpen(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#1a1a1a', maxWidth: '500px', width: '90%', padding: '2rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', fontFamily: "'Playfair Display', serif", margin: 0 }}>🔍 Public Order Tracker</h2>
              <button onClick={() => setIsTrackModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--gray)' }}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Enter your unique 6-digit Order ID (e.g. <code>ORD-123456</code>) to verify shipping progress and active tracking status.
            </p>

            <form onSubmit={handleTrackOrder} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                required
                placeholder="e.g. ORD-786118"
                value={trackOrderIdInput}
                onChange={(e) => setTrackOrderIdInput(e.target.value)}
                style={{ flex: 1, padding: '10px', border: '1.5px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '4px', fontWeight: '600' }}>
                Track
              </button>
            </form>

            {trackError && (
              <div style={{ padding: '10px', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '6px', color: '#dc2626', fontSize: '12px', marginBottom: '1rem', textAlign: 'center' }}>
                ⚠️ {trackError}
              </div>
            )}

            {trackedOrder && (
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '15px', background: 'var(--light)', animation: 'fadeIn 0.4s ease' }}>
                <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Status:</strong> <span style={{ 
                    fontWeight: '700', 
                    color: 
                      trackedOrder.status === 'Delivered' ? 'var(--green)' :
                      (trackedOrder.status === 'Cancelled' ? '#dc2626' : 'var(--primary)')
                  }}>{trackedOrder.status}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '8px' }}>
                  <strong>Deliver to:</strong> {trackedOrder.customerName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '12px' }}>
                  <strong>Amount:</strong> ₹{trackedOrder.totalAmount.toLocaleString('en-IN')}
                </div>

                <div style={{ margin: '15px 0' }}>
                  {trackedOrder.status === 'Cancelled' ? (
                    <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>
                      ❌ This order was cancelled.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '8px', left: '10%', right: '10%', height: '3px', background: '#ccc', zIndex: 1 }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'var(--primary)', 
                          width: 
                            trackedOrder.status === 'Delivered' ? '100%' :
                            trackedOrder.status === 'Shipped' ? '66%' :
                            trackedOrder.status === 'Confirmed' || trackedOrder.status === 'Processing' ? '33%' : '0%'
                        }}></div>
                      </div>

                      {['Ordered', 'Confirmed', 'Shipped', 'Delivered'].map((step, stepIdx) => {
                        const isCompleted = 
                          (step === 'Ordered') ||
                          (step === 'Confirmed' && (trackedOrder.status === 'Confirmed' || trackedOrder.status === 'Processing' || trackedOrder.status === 'Shipped' || trackedOrder.status === 'Delivered')) ||
                          (step === 'Shipped' && (trackedOrder.status === 'Shipped' || trackedOrder.status === 'Delivered')) ||
                          (step === 'Delivered' && (trackedOrder.status === 'Delivered'));

                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative', width: '20%' }}>
                            <div style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '50%', 
                              background: isCompleted ? 'var(--primary)' : '#fff', 
                              border: isCompleted ? '2px solid var(--primary)' : '2px solid #ccc', 
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center',
                              color: isCompleted ? '#fff' : '#ccc',
                              fontSize: '9px',
                              fontWeight: '700'
                            }}>
                              {isCompleted ? '✓' : stepIdx + 1}
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: '600', marginTop: '4px', color: isCompleted ? 'var(--black)' : 'var(--gray)' }}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {trackedOrder.status === 'Pending' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => { handleCancelOrder(trackedOrder.id); setIsTrackModalOpen(false); }}
                      style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '4px' }}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable Product Card Component
function ProductCard({ product, hoverImage, onOpen, onAddCart, onWishlist, isWishlisted }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  
  return (
    <div className="product-card" onClick={onOpen}>
      <div className="pc-img-wrap">
        <img 
          src={product.image} 
          alt={product.name} 
          className="pc-img" 
          loading="lazy" 
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80';
          }}
        />
        <img 
          src={hoverImage} 
          alt={product.name} 
          className="pc-img-hover" 
          loading="lazy" 
          onError={(e) => {
            e.target.src = product.image;
          }}
        />
        <div className="pc-badges">
          {discount > 0 && <span className="badge badge-off">-{discount}% OFF</span>}
          {product.badge === 'new' && <span className="badge badge-new">NEW</span>}
        </div>
        <div className="pc-actions">
          <button 
            className="pc-cart-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onAddCart();
            }}
          >
            Add to Cart
          </button>
          <button 
            className="pc-wish-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onWishlist();
            }}
            style={{
              color: isWishlisted ? 'var(--primary)' : 'inherit'
            }}
          >
            {isWishlisted ? '❤️' : '♡'}
          </button>
        </div>
      </div>
      <div className="pc-name">{product.name}</div>
      <div className="pc-category">{product.category}</div>
      <div className="pc-price-row">
        <span className="pc-price">₹{product.price.toLocaleString('en-IN')}</span>
        {product.oldPrice && <span className="pc-old">₹{product.oldPrice.toLocaleString('en-IN')}</span>}
        {discount > 0 && <span className="pc-discount">{discount}% off</span>}
      </div>
    </div>
  );
}

export default App;
