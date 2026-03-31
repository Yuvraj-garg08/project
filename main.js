// images
let imgPizza = './images/pizza.png';
let imgBurger = './images/burger.png';

let restaurants = [];
let cart = []; // holds { id, name, price, qty }

let categories = [
    { name: 'Pizza', img: imgPizza },
    { name: 'Burger', img: imgBurger },
    { name: 'Italian', img: imgPizza },
    { name: 'Fast Food', img: imgBurger }
];

let API_URL = 'http://localhost:3000/api';

// getting html elements
let restContainer = document.getElementById('restaurant-container');
let catContainer = document.getElementById('category-container');
let menuModal = document.getElementById('menu-modal');
let modalRestName = document.getElementById('modal-restaurant-name');
let menuContainer = document.getElementById('menu-container');
let closeMenuBtn = document.getElementById('close-menu');

let cartSidebar = document.getElementById('cart-sidebar');
let cartBtn = document.getElementById('cart-button');
let closeCartBtn = document.getElementById('close-cart');
let cartItemsContainer = document.getElementById('cart-items-container');
let cartCountElem = document.getElementById('cart-count');
let cartTotalPriceElem = document.getElementById('cart-total-price');
let checkoutBtn = document.getElementById('checkout-btn');

let checkoutModal = document.getElementById('checkout-modal');
let closeCheckoutBtn = document.getElementById('close-checkout');
let payAmountElem = document.getElementById('pay-amount');
let paymentForm = document.getElementById('payment-form');

let locationSelector = document.getElementById('user-location');
let displayLocation = document.getElementById('display-location');

// auth elements
let authButtons = document.getElementById('auth-buttons');
let loginBtnHeader = document.getElementById('login-btn-header');
let signupBtnHeader = document.getElementById('signup-btn-header');
let userProfile = document.getElementById('user-profile');
let userGreeting = document.getElementById('user-greeting');
let logoutBtnHeader = document.getElementById('logout-btn-header');

let loginModal = document.getElementById('login-modal');
let closeLoginBtn = document.getElementById('close-login');
let loginForm = document.getElementById('login-form');
let switchToSignup = document.getElementById('switch-to-signup');

let signupModal = document.getElementById('signup-modal');
let closeSignupBtn = document.getElementById('close-signup');
let signupForm = document.getElementById('signup-form');
let switchToLogin = document.getElementById('switch-to-login');

document.addEventListener('DOMContentLoaded', async () => {
    // try loading hero image
    let heroImage = new Image();
    heroImage.src = './images/hero.png';
    heroImage.onload = () => {
        document.querySelector('.hero-section').style.backgroundImage = `url('./images/hero.png')`;
    };

    renderCategories();
    checkAuthStatus();
    
    // get data from backend
    await fetchRestaurants();
    
    // modal open close
    loginBtnHeader.addEventListener('click', () => loginModal.classList.add('show'));
    closeLoginBtn.addEventListener('click', () => loginModal.classList.remove('show'));
    
    signupBtnHeader.addEventListener('click', () => signupModal.classList.add('show'));
    closeSignupBtn.addEventListener('click', () => signupModal.classList.remove('show'));

    switchToSignup.addEventListener('click', () => {
        loginModal.classList.remove('show');
        signupModal.classList.add('show');
    });

    switchToLogin.addEventListener('click', () => {
        signupModal.classList.remove('show');
        loginModal.classList.add('show');
    });

    logoutBtnHeader.addEventListener('click', () => {
        localStorage.removeItem('foodWallahUser');
        checkAuthStatus();
        alert('You logged out');
    });

    // sign up submitting
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let name = document.getElementById('signup-name').value;
        let email = document.getElementById('signup-email').value;
        let password = document.getElementById('signup-password').value;

        try {
            let res = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password })
            });
            let data = await res.json();

            if (res.ok) {
                alert(data.message);
                localStorage.setItem('foodWallahUser', JSON.stringify(data.user));
                signupModal.classList.remove('show');
                signupForm.reset();
                checkAuthStatus();
            } else {
                alert(data.error || "failed");
            }
        } catch (err) {
            alert("server error");
            console.error(err);
        }
    });

    // log in submitting
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let email = document.getElementById('login-email').value;
        let password = document.getElementById('login-password').value;

        try {
            let res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });
            let data = await res.json();

            if (res.ok) {
                localStorage.setItem('foodWallahUser', JSON.stringify(data.user));
                loginModal.classList.remove('show');
                loginForm.reset();
                checkAuthStatus();
            } else {
                alert(data.error || "failed login");
            }
        } catch (err) {
            alert("server error");
            console.error(err);
        }
    });

    closeMenuBtn.addEventListener('click', () => menuModal.classList.remove('show'));
    cartBtn.addEventListener('click', () => cartSidebar.classList.add('show'));
    closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('show'));
    
    checkoutBtn.addEventListener('click', () => {
        let user = localStorage.getItem('foodWallahUser');
        if (!user) {
            alert("login first to checkout!");
            loginModal.classList.add('show');
            cartSidebar.classList.remove('show');
            return;
        }

        cartSidebar.classList.remove('show');
        checkoutModal.classList.add('show');
        payAmountElem.innerText = `₹${calculateTotal()}`;
    });
    
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('show'));
    
    // submit payment
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // order payload
        let orderData = {
           location: document.getElementById('delivery-address').value,
           method: document.getElementById('payment-method').value,
           totalItems: cart.reduce((acc, curr) => acc + curr.qty, 0),
           totalPrice: calculateTotal(),
           cart: cart
        };
        
        try {
            let res = await fetch(`${API_URL}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            let dbResponse = await res.json();
            
            alert(`Payment Success! order id: #${dbResponse.orderId}`);
            cart = [];
            updateCart();
            checkoutModal.classList.remove('show');
        } catch(err) {
            alert('payment error');
            console.error(err);
        }
    });

    locationSelector.addEventListener('change', (e) => {
        displayLocation.innerText = e.target.options[e.target.selectedIndex].text;
    });

    document.getElementById('payment-method').addEventListener('change', (e) => {
        let cardDetails = document.getElementById('card-details');
        cardDetails.style.display = (e.target.value === 'Credit Card') ? 'block' : 'none';
    });
    
    // click outside to close modals
    window.addEventListener('click', (e) => {
        if(e.target === menuModal) menuModal.classList.remove('show');
        if(e.target === checkoutModal) checkoutModal.classList.remove('show');
        if(e.target === loginModal) loginModal.classList.remove('show');
        if(e.target === signupModal) signupModal.classList.remove('show');
    });
});

// UI changes based on login
function checkAuthStatus() {
    let userString = localStorage.getItem('foodWallahUser');
    if (userString) {
        let user = JSON.parse(userString);
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        userGreeting.innerText = `Hi, ${user.name}`;
    } else {
        authButtons.style.display = 'block';
        userProfile.style.display = 'none';
    }
}

// global event dispatch for inline html onclicks
window.dispatchChangeQty = function(id, delta) {
    document.dispatchEvent(new CustomEvent('changeQty', {detail: {id, delta}}));
};

document.addEventListener('changeQty', (e) => {
    changeQty(e.detail.id, e.detail.delta);
});

async function fetchRestaurants() {
    try {
        let res = await fetch(`${API_URL}/restaurants`);
        restaurants = await res.json();
        renderRestaurants();
    } catch(err) {
        restContainer.innerHTML = '<p>Error fetching data from server</p>';
        console.error(err);
    }
}

function renderCategories() {
    catContainer.innerHTML = '';
    categories.forEach(cat => {
        let div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <div class="category-img-container">
                <img src="${cat.img}" alt="${cat.name}" class="category-img"/>
            </div>
            <div class="category-name">${cat.name}</div>
        `;
        catContainer.appendChild(div);
    });
}

function renderRestaurants() {
    restContainer.innerHTML = '';
    restaurants.forEach(rest => {
        let card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="rest-img-container">
                <img src="${rest.img}" alt="${rest.name}" class="rest-img"/>
                <div class="rest-rating">${rest.rating} ★</div>
            </div>
            <div class="rest-info">
                <div class="rest-name">${rest.name}</div>
                <div class="rest-cuisines">${rest.cuisines}</div>
                <div class="rest-meta">
                    <span>${rest.cost}</span>
                    <span>${rest.time}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => openMenu(rest));
        restContainer.appendChild(card);
    });
}

async function openMenu(rest) {
    modalRestName.innerText = rest.name;
    menuContainer.innerHTML = '<p>loading menu...</p>';
    menuModal.classList.add('show');
    
    try {
        let res = await fetch(`${API_URL}/menu/${rest.id}`);
        let menu = await res.json();
        
        menuContainer.innerHTML = '';
        
        if (menu.length === 0) {
            menuContainer.innerHTML = '<p>no items found</p>';
        } else {
            menu.forEach(item => {
                let div = document.createElement('div');
                div.className = 'menu-item';
                div.innerHTML = `
                    <div class="menu-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.desc}</p>
                        <div class="menu-item-price">₹${item.price.toFixed(2)}</div>
                    </div>
                    <button class="btn-add">Add</button>
                `;
                div.querySelector('.btn-add').addEventListener('click', () => {
                    addToCart(item);
                    let btn = div.querySelector('.btn-add');
                    btn.innerText = 'Added!';
                    btn.style.background = 'green';
                    btn.style.color = 'white';
                    setTimeout(() => {
                        btn.innerText = 'Add';
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1000);
                });
                menuContainer.appendChild(div);
            });
        }
    } catch(err) {
        menuContainer.innerHTML = '<p>Failed to grab menu</p>';
    }
}

// cart stuff
function addToCart(item) {
    let existing = cart.find(c => c.id === item.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateCart();
}

function changeQty(id, delta) {
    let item = cart.find(c => c.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            updateCart();
        }
    }
}

function calculateTotal() {
    return cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0).toFixed(2);
}

function updateCart() {
    let totalQty = cart.reduce((acc, curr) => acc + curr.qty, 0);
    cartCountElem.innerText = totalQty;
    
    if (totalQty > 0) {
        cartCountElem.style.color = '#fff';
    } else {
        cartCountElem.style.color = '';
    }

    cartTotalPriceElem.innerText = `₹${calculateTotal()}`;
    
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color:gray;text-align:center;">Empty cart</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            let div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div style="flex:1">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="window.dispatchChangeQty(${item.id}, -1)">-</button>
                    <span style="font-weight:bold; width: 20px; text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="window.dispatchChangeQty(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }
}
