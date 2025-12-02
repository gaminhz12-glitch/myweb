document.addEventListener('DOMContentLoaded', () => {
    // ===== Elements =====
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');
    const categoryList = document.getElementById('category-list');
    const products = Array.from(document.querySelectorAll('.product'));

    const cartLink = document.getElementById('cart-link');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeCartBtn = document.getElementById('close-cart');

    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    // ===== Cart state =====
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // ===== Cart helpers =====
    function updateCartBadge() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = count;
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }

    // Global addToCart for inline onclick in HTML
    window.addToCart = function(name, price) {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        saveCart();
    };

    function renderCart() {
        if (!cartItems || !cartTotal) return;
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
  <td>${item.name}</td>
  <td>${item.price.toLocaleString('vi-VN')}₫</td>
  <td>
    <div class="qty-controls">
      <button class="qty-btn" data-index="${index}" data-delta="-1">-</button>
      <span>${item.quantity}</span>
      <button class="qty-btn" data-index="${index}" data-delta="1">+</button>
    </div>
  </td>
  <td>${subtotal.toLocaleString('vi-VN')}₫</td>
  <td><button class="remove-btn" data-index="${index}">Xóa</button></td>
`;
            cartItems.appendChild(row);
        });

        cartTotal.textContent = total.toLocaleString('vi-VN') + '₫';
    }

    function changeQuantity(index, delta) {
        const item = cart[index];
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart.splice(index, 1); // xóa nếu về 0
        }
        saveCart();
        renderCart();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    // Delegate click for qty and remove buttons inside table
    if (cartItems) {
        cartItems.addEventListener('click', (e) => {
            const btn = e.target;
            if (btn.classList.contains('qty-btn')) {
                const index = parseInt(btn.dataset.index, 10);
                const delta = parseInt(btn.dataset.delta, 10);
                changeQuantity(index, delta);
            } else if (btn.classList.contains('remove-btn')) {
                const index = parseInt(btn.dataset.index, 10);
                removeItem(index);
            }
        });
    }

    // ===== Modal open/close =====
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            renderCart();
            if (cartModal) cartModal.style.display = 'flex';
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartModal) cartModal.style.display = 'none';
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const totalText = cartTotal ? cartTotal.textContent : '0₫';
            alert(`Đã thanh toán thành công số tiền ${totalText}`);
            cart = [];
            saveCart();
            renderCart();
            if (cartModal) cartModal.style.display = 'none';
        });
    }

    // ===== Hamburger toggle (desktop & mobile) =====
    function toggleSidebar() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!sidebar || !hamburger) return;

        if (isMobile) {
            sidebar.classList.toggle('show');
            hamburger.classList.toggle('active');
        } else {
            const isHidden = sidebar.classList.contains('hidden');
            sidebar.classList.toggle('hidden', !isHidden);
            container && container.classList.toggle('sidebar-closed', !isHidden);
            hamburger.classList.toggle('active', !isHidden);
        }
    }

    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSidebar();
        });
    }

    function applyInitialResponsiveState() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!sidebar || !container) return;
        if (isMobile) {
            sidebar.classList.remove('hidden');
            sidebar.classList.remove('show'); // mặc định ẩn (transform)
        } else {
            sidebar.classList.remove('show');
            sidebar.classList.remove('hidden'); // mặc định hiện
            container.classList.remove('sidebar-closed');
        }
    }
    applyInitialResponsiveState();
    window.addEventListener('resize', applyInitialResponsiveState);

    // ===== Category filtering =====
    function filterByCategory(category) {
        products.forEach((p) => {
            const matches = category === 'all' || p.dataset.category === category;
            p.style.display = matches ? '' : 'none';
        });
    }

    function setActiveCategoryLink(targetLink) {
        if (!categoryList) return;
        const links = Array.from(categoryList.querySelectorAll('a'));
        links.forEach((a) => a.classList.toggle('active', a === targetLink));
    }

    if (categoryList) {
        categoryList.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-category]');
            if (!link) return;
            e.preventDefault();
            const category = link.dataset.category;
            setActiveCategoryLink(link);
            filterByCategory(category);

            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            if (isMobile && sidebar && hamburger) {
                sidebar.classList.remove('show');
                hamburger.classList.remove('active');
            }
        });
    }

    // Initialize default products state
    filterByCategory('all');

    // ===== Search by name =====
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const keyword = searchInput.value.trim().toLowerCase();
            products.forEach((p) => {
                const name = (p.dataset.name || '').toLowerCase();
                p.style.display = name.includes(keyword) ? '' : 'none';
            });
        });
    }

    // Initial badge update
    updateCartBadge();
});