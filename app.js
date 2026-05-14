// State Management
let appState = {
    settings: {
        shopName: '',
        address: '',
        regNo: '',
        phone: '',
        image: '',
        password: '12345'
    },
    inventory: [],
    salesBills: [],
    supplierBills: []
};

// Current Cart
let currentCart = [];

// Initialize App
function initApp() {
    loadData();
    checkAuth();
}

// Data Persistence
function loadData() {
    const savedData = localStorage.getItem('groceryApp_state');
    if (savedData) {
        appState = JSON.parse(savedData);
    } else {
        // Load Sample Data if first time
        appState.inventory = [
            { id: generateId(), code: '1001', name: 'සීනි (Sugar)', buyPrice: 280, sellPrice: 300, qty: 50, unit: 'Kg', recvDate: '2023-10-01', mfdDate: '', expDate: '2024-10-01' },
            { id: generateId(), code: '1002', name: 'පරිප්පු (Dhal)', buyPrice: 350, sellPrice: 380, qty: 25, unit: 'Kg', recvDate: '2023-10-02', mfdDate: '', expDate: '2024-05-01' },
            { id: generateId(), code: '1003', name: 'සබන් (Soap)', buyPrice: 70, sellPrice: 85, qty: 10, unit: 'unit', recvDate: '2023-09-15', mfdDate: '2023-08-01', expDate: '2025-08-01' }
        ];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('groceryApp_state', JSON.stringify(appState));
    checkLowStock();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Authentication
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('groceryApp_logged_in');
    if (isLoggedIn) {
        showMainApp();
    } else {
        document.getElementById('login-view').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }
}

function login() {
    const pwdInput = document.getElementById('login-password').value;
    if (pwdInput === appState.settings.password) {
        sessionStorage.setItem('groceryApp_logged_in', 'true');
        document.getElementById('login-password').value = '';
        showMainApp();
        showToast('සාර්ථකව ඇතුල් විය!', 'success');
    } else {
        showToast('මුරපදය වැරදියි!', 'error');
    }
}

function logout() {
    sessionStorage.removeItem('groceryApp_logged_in');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
    showToast('සාර්ථකව පිටවිය.', 'success');
}

// UI Navigation
function showMainApp() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    loadSettingsUI();
    showView('home-view');
    checkLowStock();
}

function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.content .view').forEach(el => el.classList.add('hidden'));
    // Deactivate nav links
    document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
    
    // Show selected view
    document.getElementById(viewId).classList.remove('hidden');
    const navLink = document.getElementById(`link-${viewId}`);
    if (navLink) navLink.classList.add('active');

    // Hide mobile menu if open
    const navLinksList = document.getElementById('nav-links');
    if (navLinksList) {
        navLinksList.classList.remove('show-mobile');
    }

    // View specific init
    if (viewId === 'inventory-view') renderInventory();
    if (viewId === 'sales-view') { renderPosItems(); updateCartUI(); }
    if (viewId === 'bills-view') renderBills();
    if (viewId === 'supplier-view') renderSupplierBills();
    if (viewId === 'reports-view') generateReport();
}

function toggleMobileMenu() {
    const navLinksList = document.getElementById('nav-links');
    if (navLinksList) {
        navLinksList.classList.toggle('show-mobile');
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Settings
function loadSettingsUI() {
    const s = appState.settings;
    
    // Form Inputs
    document.getElementById('shop-name').value = s.shopName || '';
    document.getElementById('shop-address').value = s.address || '';
    document.getElementById('shop-reg-no').value = s.regNo || '';
    document.getElementById('shop-phone').value = s.phone || '';
    
    // Display Mode
    document.getElementById('display-shop-name').textContent = s.shopName || 'කඩයේ නම යොදා නැත';
    document.getElementById('display-shop-address').textContent = s.address || '-';
    document.getElementById('display-shop-reg').textContent = s.regNo || '-';
    document.getElementById('display-shop-phone').textContent = s.phone || '-';

    if (s.image) {
        // Form preview
        const preview = document.getElementById('shop-image-preview');
        preview.src = s.image;
        preview.classList.remove('hidden');
        
        // Display Mode img
        const displayImg = document.getElementById('display-shop-img');
        if (displayImg) {
            displayImg.src = s.image;
            displayImg.classList.remove('hidden');
        }
        
        // Nav logo
        document.getElementById('nav-shop-img').src = s.image;
    } else {
        document.getElementById('shop-image-preview').classList.add('hidden');
        const displayImg = document.getElementById('display-shop-img');
        if (displayImg) displayImg.classList.add('hidden');
        document.getElementById('nav-shop-img').src = 'default-shop.png';
    }
    
    if (s.shopName) {
        document.getElementById('nav-shop-name').textContent = s.shopName;
    }

    // Always show display mode, hide form mode
    document.getElementById('shop-info-display').classList.remove('hidden');
    document.getElementById('shop-info-form').classList.add('hidden');
}

function editShopInfo() {
    document.getElementById('shop-info-display').classList.add('hidden');
    document.getElementById('shop-info-form').classList.remove('hidden');
}

function cancelEditShopInfo() {
    loadSettingsUI(); // reset form back to saved state and show display
}

function deleteShopInfo() {
    if (confirm('ඔබට කඩයේ තොරතුරු සියල්ල මකා දැමීමට අවශ්‍ය බව විශ්වාසද?')) {
        appState.settings.shopName = '';
        appState.settings.address = '';
        appState.settings.regNo = '';
        appState.settings.phone = '';
        appState.settings.image = '';
        saveData();
        loadSettingsUI();
        showToast('තොරතුරු මකා දමන ලදී!', 'success');
    }
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('shop-image-preview');
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
}

function saveSettings() {
    const imgPreviewSrc = document.getElementById('shop-image-preview').src;
    
    appState.settings.shopName = document.getElementById('shop-name').value;
    appState.settings.address = document.getElementById('shop-address').value;
    appState.settings.regNo = document.getElementById('shop-reg-no').value;
    appState.settings.phone = document.getElementById('shop-phone').value;
    
    if (imgPreviewSrc && imgPreviewSrc !== window.location.href && !document.getElementById('shop-image-preview').classList.contains('hidden')) {
        appState.settings.image = imgPreviewSrc;
    }

    const newPwd = document.getElementById('new-password').value;
    if (newPwd) {
        appState.settings.password = newPwd;
        document.getElementById('new-password').value = '';
    }

    saveData();
    loadSettingsUI();
    showToast('තොරතුරු සුරකින ලදී!', 'success');
}

// Modals
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Inventory
function renderInventory() {
    const tbody = document.getElementById('inventory-tbody');
    const searchTerm = document.getElementById('search-inventory').value.toLowerCase();
    
    tbody.innerHTML = '';
    appState.inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.code.toLowerCase().includes(searchTerm)
    ).forEach(item => {
        const isLow = item.qty <= 5;
        const row = `
            <tr style="${isLow ? 'background-color: #FEF2F2;' : ''}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>Rs. ${parseFloat(item.buyPrice).toFixed(2)}</td>
                <td>Rs. ${parseFloat(item.sellPrice).toFixed(2)}</td>
                <td style="${isLow ? 'color: red; font-weight: bold;' : ''}">${item.qty} ${item.unit}</td>
                <td>${item.expDate || '-'}</td>
                <td>
                    <button class="icon-btn btn-primary" onclick="editItem('${item.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-btn btn-danger" onclick="deleteItem('${item.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function openItemModal() {
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('item-modal-title').textContent = 'නව භාණ්ඩයක් එක් කරන්න';
    openModal('item-modal');
}

function saveItem(e) {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    
    const itemData = {
        code: document.getElementById('item-code').value,
        name: document.getElementById('item-name').value,
        buyPrice: parseFloat(document.getElementById('item-buy-price').value),
        sellPrice: parseFloat(document.getElementById('item-sell-price').value),
        qty: parseFloat(document.getElementById('item-qty').value),
        unit: document.getElementById('item-unit').value,
        recvDate: document.getElementById('item-recv-date').value,
        mfdDate: document.getElementById('item-mfd-date').value,
        expDate: document.getElementById('item-exp-date').value,
    };

    if (id) {
        // Edit
        const index = appState.inventory.findIndex(i => i.id === id);
        if (index > -1) {
            appState.inventory[index] = { ...appState.inventory[index], ...itemData };
            showToast('භාණ්ඩය වෙනස් කරන ලදී!', 'success');
        }
    } else {
        // Add
        itemData.id = generateId();
        appState.inventory.push(itemData);
        showToast('නව භාණ්ඩය එක් කරන ලදී!', 'success');
    }

    saveData();
    renderInventory();
    closeModal('item-modal');
}

function editItem(id) {
    const item = appState.inventory.find(i => i.id === id);
    if (!item) return;

    document.getElementById('item-id').value = item.id;
    document.getElementById('item-code').value = item.code;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-buy-price').value = item.buyPrice;
    document.getElementById('item-sell-price').value = item.sellPrice;
    document.getElementById('item-qty').value = item.qty;
    document.getElementById('item-unit').value = item.unit;
    document.getElementById('item-recv-date').value = item.recvDate;
    document.getElementById('item-mfd-date').value = item.mfdDate;
    document.getElementById('item-exp-date').value = item.expDate;

    document.getElementById('item-modal-title').textContent = 'භාණ්ඩය වෙනස් කරන්න';
    openModal('item-modal');
}

function deleteItem(id) {
    if (confirm('මෙම භාණ්ඩය මකා දැමීමට අවශ්‍ය බව විශ්වාසද?')) {
        appState.inventory = appState.inventory.filter(i => i.id !== id);
        saveData();
        renderInventory();
        showToast('භාණ්ඩය මකා දමන ලදී!', 'success');
    }
}

function checkLowStock() {
    const lowStockItems = appState.inventory.filter(i => i.qty <= 5);
    const badge = document.getElementById('low-stock-badge');
    const alert = document.getElementById('low-stock-alert');
    
    if (lowStockItems.length > 0) {
        badge.classList.remove('hidden');
        if (alert) alert.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
        if (alert) alert.classList.add('hidden');
    }
}

// POS (Sales)
function renderPosItems(searchTerm = '') {
    const grid = document.getElementById('pos-item-grid');
    grid.innerHTML = '';
    
    appState.inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.code.toLowerCase().includes(searchTerm)
    ).forEach(item => {
        const isLow = item.qty <= 5;
        const card = `
            <div class="pos-item-card ${isLow ? 'low-stock' : ''}" onclick="addToCart('${item.id}')">
                <div class="pos-item-title">${item.name}</div>
                <div style="font-size: 0.8rem; color: #666;">${item.code}</div>
                <div class="pos-item-price">Rs. ${parseFloat(item.sellPrice).toFixed(2)}</div>
                <div class="pos-item-stock ${isLow ? 'stock-warning' : ''}">තොගය: ${item.qty} ${item.unit}</div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function filterPosItems() {
    const term = document.getElementById('pos-search').value.toLowerCase();
    renderPosItems(term);
}

function addToCart(id) {
    const item = appState.inventory.find(i => i.id === id);
    if (!item) return;

    if (item.qty <= 0) {
        showToast('මෙම භාණ්ඩයේ තොග අවසන් වී ඇත!', 'error');
        return;
    }

    const existingCartItem = currentCart.find(c => c.id === id);
    if (existingCartItem) {
        if (existingCartItem.cartQty < item.qty) {
            existingCartItem.cartQty++;
            existingCartItem.subTotal = existingCartItem.cartQty * existingCartItem.sellPrice;
        } else {
            showToast('පවතින තොගයට වඩා එකතු කළ නොහැක!', 'warning');
        }
    } else {
        currentCart.push({
            id: item.id,
            code: item.code,
            name: item.name,
            sellPrice: item.sellPrice,
            buyPrice: item.buyPrice, // for profit calc later
            unit: item.unit,
            cartQty: 1,
            subTotal: item.sellPrice
        });
    }
    updateCartUI();
}

function updateCartQty(id, qtyStr) {
    const qty = parseFloat(qtyStr);
    const cartItem = currentCart.find(c => c.id === id);
    const invItem = appState.inventory.find(i => i.id === id);
    
    if (cartItem && invItem) {
        if (qty > invItem.qty) {
            showToast('පවතින තොගයට වඩා එකතු කළ නොහැක!', 'warning');
            cartItem.cartQty = invItem.qty;
        } else if (qty <= 0) {
            removeFromCart(id);
            return;
        } else {
            cartItem.cartQty = qty;
        }
        cartItem.subTotal = cartItem.cartQty * cartItem.sellPrice;
        updateCartUI();
    }
}

function removeFromCart(id) {
    currentCart = currentCart.filter(c => c.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    
    let total = 0;
    
    currentCart.forEach(item => {
        total += item.subTotal;
        const html = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name} (${item.code})</div>
                    <div class="cart-item-price">Rs. ${item.sellPrice.toFixed(2)} x ${item.unit}</div>
                </div>
                <div class="cart-item-actions">
                    <input type="number" class="cart-qty-input" value="${item.cartQty}" min="0" step="any" onchange="updateCartQty('${item.id}', this.value)">
                    <span>Rs. ${item.subTotal.toFixed(2)}</span>
                    <button class="icon-btn btn-danger" onclick="removeFromCart('${item.id}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
        `;
        cartContainer.innerHTML += html;
    });

    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function checkout() {
    if (currentCart.length === 0) {
        showToast('බිල්පත සඳහා භාණ්ඩ එකතු කර නැත!', 'warning');
        return;
    }

    const customerName = document.getElementById('customer-name').value || 'සාමාන්‍ය පාරිභෝගික';
    const total = currentCart.reduce((sum, item) => sum + item.subTotal, 0);
    const totalProfit = currentCart.reduce((sum, item) => sum + ((item.sellPrice - item.buyPrice) * item.cartQty), 0);
    const billNo = 'INV-' + Date.now().toString().slice(-6);
    const date = new Date().toLocaleString();

    // Deduct from inventory
    currentCart.forEach(cartItem => {
        const invItem = appState.inventory.find(i => i.id === cartItem.id);
        if (invItem) {
            invItem.qty -= cartItem.cartQty;
        }
    });

    // Save Bill
    const bill = {
        id: generateId(),
        billNo,
        customerName,
        date,
        items: [...currentCart],
        total,
        profit: totalProfit
    };
    appState.salesBills.push(bill);
    saveData();

    // Print Bill
    printBill(bill);

    // Clear Cart
    currentCart = [];
    document.getElementById('customer-name').value = '';
    updateCartUI();
    renderPosItems(); // update stock UI
    showToast('බිල්පත සාර්ථකව නිකුත් කරන ලදී!', 'success');
}

// Printing
function printBill(bill) {
    const s = appState.settings;
    document.getElementById('print-shop-name').textContent = s.shopName || 'කඩයේ නම';
    document.getElementById('print-shop-address').textContent = s.address || '';
    document.getElementById('print-shop-phone').textContent = s.phone || '';
    document.getElementById('print-shop-reg').textContent = s.regNo ? `Reg: ${s.regNo}` : '';
    
    document.getElementById('print-bill-no').textContent = bill.billNo;
    document.getElementById('print-date').textContent = bill.date;
    document.getElementById('print-customer').textContent = bill.customerName;

    const tbody = document.getElementById('print-items');
    tbody.innerHTML = '';
    bill.items.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.cartQty}</td>
                <td>${item.sellPrice}</td>
                <td>${item.subTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    document.getElementById('print-total').textContent = bill.total.toFixed(2);

    // Show print area, print, then hide
    document.getElementById('print-area').classList.remove('hidden');
    window.print();
    document.getElementById('print-area').classList.add('hidden');
}

function printSupplierBill(bill) {
    document.getElementById('print-supp-no').textContent = bill.billNo;
    document.getElementById('print-supp-date').textContent = bill.date;
    document.getElementById('print-supp-name').textContent = bill.supplierName;
    document.getElementById('print-supp-phone').textContent = bill.phone || '-';
    document.getElementById('print-supp-details').textContent = bill.details;
    document.getElementById('print-supp-total').textContent = bill.amount.toFixed(2);

    document.getElementById('print-supp-area').classList.remove('hidden');
    window.print();
    document.getElementById('print-supp-area').classList.add('hidden');
}

// Bills History
function renderBills() {
    const tbody = document.getElementById('bills-tbody');
    tbody.innerHTML = '';
    
    // Sort descending by date (newest first)
    const sortedBills = [...appState.salesBills].reverse();

    sortedBills.forEach(bill => {
        const row = `
            <tr>
                <td>${bill.billNo}</td>
                <td>${bill.customerName}</td>
                <td>${bill.date}</td>
                <td>Rs. ${bill.total.toFixed(2)}</td>
                <td>
                    <button class="icon-btn btn-secondary" onclick="reprintBill('${bill.id}')"><i class="fa-solid fa-print"></i></button>
                    <button class="icon-btn btn-danger" onclick="deleteBill('${bill.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function reprintBill(id) {
    const bill = appState.salesBills.find(b => b.id === id);
    if (bill) printBill(bill);
}

function deleteBill(id) {
    if (confirm('මෙම බිල්පත මකා දැමීමට අවශ්‍ය බව විශ්වාසද?')) {
        appState.salesBills = appState.salesBills.filter(b => b.id !== id);
        saveData();
        renderBills();
        showToast('බිල්පත මකා දමන ලදී!', 'success');
    }
}

// Supplier Bills
function renderSupplierBills() {
    const tbody = document.getElementById('supplier-tbody');
    tbody.innerHTML = '';
    
    const sortedBills = [...appState.supplierBills].reverse();

    sortedBills.forEach(bill => {
        const row = `
            <tr>
                <td>${bill.billNo}</td>
                <td>${bill.supplierName}</td>
                <td>${bill.date}</td>
                <td>Rs. ${bill.amount.toFixed(2)}</td>
                <td>
                    <button class="icon-btn btn-secondary" onclick="reprintSupplierBill('${bill.id}')"><i class="fa-solid fa-print"></i></button>
                    <button class="icon-btn btn-danger" onclick="deleteSupplierBill('${bill.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function openSupplierModal() {
    document.getElementById('supplier-form').reset();
    openModal('supplier-modal');
}

function saveSupplierBill(e) {
    e.preventDefault();
    const bill = {
        id: generateId(),
        billNo: 'SUP-' + Date.now().toString().slice(-6),
        supplierName: document.getElementById('supp-name').value,
        phone: document.getElementById('supp-phone').value,
        date: document.getElementById('supp-date').value,
        amount: parseFloat(document.getElementById('supp-amount').value),
        details: document.getElementById('supp-details').value
    };

    appState.supplierBills.push(bill);
    saveData();
    renderSupplierBills();
    closeModal('supplier-modal');
    showToast('සැපයුම්කරු බිල්පත සුරකින ලදී!', 'success');
    
    // Auto print
    printSupplierBill(bill);
}

function reprintSupplierBill(id) {
    const bill = appState.supplierBills.find(b => b.id === id);
    if (bill) printSupplierBill(bill);
}

function deleteSupplierBill(id) {
    if (confirm('මෙම බිල්පත මකා දැමීමට අවශ්‍ය බව විශ්වාසද?')) {
        appState.supplierBills = appState.supplierBills.filter(b => b.id !== id);
        saveData();
        renderSupplierBills();
        showToast('බිල්පත මකා දමන ලදී!', 'success');
    }
}

// Reports
function generateReport() {
    // Current month filter (simplified for demo: getting all time profit, or can filter by month)
    // To filter by month, we would parse dates. For simplicity, we show all-time or last 30 days.
    // Let's calculate total from all bills in DB.
    
    let totalSales = 0;
    let totalProfit = 0;

    appState.salesBills.forEach(bill => {
        totalSales += bill.total;
        totalProfit += bill.profit;
    });

    document.getElementById('report-total-sales').textContent = `Rs. ${totalSales.toFixed(2)}`;
    document.getElementById('report-total-profit').textContent = `Rs. ${totalProfit.toFixed(2)}`;
}

// Init execution
window.onload = initApp;
