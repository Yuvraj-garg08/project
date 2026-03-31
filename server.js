import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // needed to parse req body

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/foodwallah')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// MongoDB Schemas & Models
const userSchema = new mongoose.Schema({
    id: Number,
    name: String,
    email: { type: String, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    location: String,
    method: String,
    totalItems: Number,
    totalPrice: String,
    cart: Array,
    orderId: Number
});
const Order = mongoose.model('Order', orderSchema);

// all my fast food and indian restaurants
const restaurants = [
    { id: 1, name: 'Pizza Paradise', cuisines: 'Italian, Pizzas', rating: '4.5', time: '30 min', cost: '₹400 for one', img: './images/pizza.png' },
    { id: 2, name: 'Burger Joint', cuisines: 'American, Fast Food', rating: '4.2', time: '25 min', cost: '₹250 for one', img: './images/burger.png' },
    { id: 3, name: 'Burger Bar', cuisines: 'American, Burgers', rating: '4.8', time: '40 min', cost: '₹500 for one', img: './images/burger.png' },
    { id: 4, name: 'The Golden Grill', cuisines: 'American, Steakhouse', rating: '4.0', time: '45 min', cost: '₹800 for one', img: './images/burger.png' },
    { id: 5, name: 'Burger King', cuisines: 'Fast Food, Burgers', rating: '4.1', time: '20 min', cost: '₹300 for one', img: './images/burger.png' },
    { id: 6, name: 'Subway', cuisines: 'Healthy Food, Sandwiches', rating: '4.3', time: '25 min', cost: '₹250 for one', img: './images/burger.png' },
    { id: 7, name: 'McDonald\'s', cuisines: 'Fast Food, Burgers', rating: '4.4', time: '15 min', cost: '₹200 for one', img: './images/burger.png' },
    { id: 8, name: 'KFC', cuisines: 'Fast Food, Chicken', rating: '4.2', time: '30 min', cost: '₹350 for one', img: './images/kfc.png' },
    { id: 9, name: 'La Pino\'z Pizza', cuisines: 'Fast Food, Pizzas', rating: '4.5', time: '35 min', cost: '₹450 for one', img: './images/pizza.png' },
    { id: 10, name: 'South Circle', cuisines: 'South Indian, Breakfast', rating: '4.6', time: '25 min', cost: '₹200 for one', img: './images/dosa.png' },
    { id: 11, name: 'Sagar Ratna', cuisines: 'South Indian, Thali', rating: '4.7', time: '30 min', cost: '₹300 for one', img: './images/dosa.png' },
    { id: 12, name: 'Punjabi Rasoi', cuisines: 'North Indian, Punjabi', rating: '4.3', time: '40 min', cost: '₹500 for one', img: './images/punjabi.png' },
    { id: 13, name: 'Sher-E-Punjab', cuisines: 'Punjabi, Tandoori', rating: '4.5', time: '45 min', cost: '₹600 for one', img: './images/punjabi.png' }
];

const menus = {
    1: [
        { id: 101, name: 'Margherita Pizza', desc: 'Classic cheese and tomato', price: 350.00 },
        { id: 102, name: 'Pepperoni & Jalapeno', desc: 'Loaded with pepperoni and spicy jalapenos', price: 450.00 },
        { id: 103, name: 'Truffle Mushroom Pizza', desc: 'White base with truffle oil and mushrooms', price: 600.00 },
    ],
    2: [
        { id: 201, name: 'Classic Cheeseburger', desc: 'Beef patty with cheddar, lettuce, tomato', price: 150.00 },
        { id: 202, name: 'Double Bacon Burger', desc: 'Two patties and smoked bacon with BBQ sauce', price: 250.00 },
        { id: 203, name: 'Crispy Fries', desc: 'Golden and salted to perfection', price: 90.00 },
    ],
    3: [
        { id: 301, name: 'Classic Smashburger', desc: 'Crispy beef patty with signature bar sauce', price: 300.00 },
        { id: 302, name: 'Onion Rings', desc: 'Thick cut and crispy', price: 180.00 },
    ],
    4: [
        { id: 401, name: 'Ribeye Steak', desc: '10oz steak with garlic herb butter', price: 850.00 },
        { id: 402, name: 'Caesar Salad', desc: 'Fresh greens, chicken and croutons', price: 250.00 },
    ],
    5: [
        { id: 501, name: 'Whopper', desc: 'Flame-grilled beef, tomatoes, fresh cut lettuce', price: 220.00 },
        { id: 502, name: 'Chicken Royale', desc: 'Crispy chicken, lettuce, mayonnaise', price: 190.00 }
    ],
    6: [
        { id: 601, name: 'Chicken Teriyaki Sub', desc: '6 inch sub with tender chicken strips', price: 250.00 },
        { id: 602, name: 'Paneer Tikka Sub', desc: '6 inch sub with grilled paneer slices', price: 230.00 }
    ],
    7: [
        { id: 701, name: 'McAloo Tikki', desc: 'Potato and peas patty coated in breadcrumbs', price: 90.00 },
        { id: 702, name: 'McSpicy Chicken', desc: 'Spicy chicken, lettuce, mayonnaise', price: 210.00 },
        { id: 703, name: 'French Fries (Large)', desc: 'World Famous Fries', price: 140.00 }
    ],
    8: [
        { id: 801, name: 'Zinger Burger', desc: 'Signature crispy chicken fillet burger', price: 200.00 },
        { id: 802, name: 'Hot & Crispy Chicken (2 pc)', desc: 'Signature fried chicken', price: 250.00 }
    ],
    9: [
        { id: 901, name: 'Seven Cheese Pizza', desc: 'Loaded with 7 highly exquisite cheeses', price: 450.00 },
        { id: 902, name: 'Garlic Breadsticks', desc: 'Freshly baked and heavily buttered', price: 150.00 }
    ],
    10: [
        { id: 1001, name: 'Masala Dosa', desc: 'Crispy crepe filled with spiced potato mash', price: 120.00 },
        { id: 1002, name: 'Idli Sambar', desc: 'Steamed rice cakes with lentil soup', price: 80.00 }
    ],
    11: [
        { id: 1101, name: 'South Indian Thali', desc: 'Authentic assortment of curries, rice, and papad', price: 250.00 },
        { id: 1102, name: 'Medu Vada', desc: 'Crispy lentil donut with chutney', price: 90.00 }
    ],
    12: [
        { id: 1201, name: 'Butter Chicken', desc: 'Tender chicken in rich creamy tomato gravy', price: 350.00 },
        { id: 1202, name: 'Garlic Naan', desc: 'Traditional flatbread with garlic & butter', price: 60.00 }
    ],
    13: [
        { id: 1301, name: 'Paneer Tikka Masala', desc: 'Charcoal cooked paneer in spicy gravy', price: 280.00 },
        { id: 1302, name: 'Dal Makhani', desc: 'Slow cooked black lentils with cream', price: 220.00 },
        { id: 1303, name: 'Tandoori Roti', desc: 'Clay oven baked flatbread', price: 30.00 }
    ]
};

// arrays replaced with MongoDB connection and schemas defined above

app.get('/api/restaurants', (req, res) => {
    res.json(restaurants);
});

app.get('/api/menu/:id', (req, res) => {
    let id = req.params.id;
    let menuData = menus[id] || [];
    res.json(menuData);
});

app.post('/api/checkout', async (req, res) => {
    try {
        let orderInfo = req.body; 
        orderInfo.orderId = Math.floor(Math.random() * 99999); // random number for order
        
        const newOrder = new Order(orderInfo);
        await newOrder.save();
        
        console.log("got an order from " + orderInfo.location + " check order id " + orderInfo.orderId);
        res.status(201).json({ message: "saved order", orderId: orderInfo.orderId });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "failed to save order" });
    }
});

// route for signup page
app.post('/api/signup', async (req, res) => {
    let n = req.body.name;
    let e = req.body.email;
    let p = req.body.password;
    
    try {
        // see if they exist
        let found = await User.findOne({ email: e });
        if (found) {
            return res.status(400).json({ error: "email already taken man" });
        }
        
        // push them to the user collection
        let newcomer = new User({ id: Date.now(), name: n, email: e, password: p });
        await newcomer.save();
        console.log("somebody signed up: " + n);
        
        res.status(201).json({ message: "you signed up!", user: { name: newcomer.name, email: newcomer.email } });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "server error saving user" });
    }
});

// login route
app.post('/api/login', async (req, res) => {
    let e = req.body.email;
    let p = req.body.password;
    
    try {
        let u = await User.findOne({ email: e, password: p });
        if (!u) {
            return res.status(401).json({ error: "wrong email or password" });
        }
        
        console.log("logged in: " + u.name);
        res.json({ message: "logged in successfully", user: { name: u.name, email: u.email } });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: "server error logging in" });
    }
});

// start everything up
app.listen(PORT, () => {
    console.log("server is listening on port " + PORT);
});
