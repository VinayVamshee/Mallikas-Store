const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./connectDB');

const User = require('./Models/User');
const Baseline = require('./Models/Baseline');
const Item = require('./Models/Item');
const Order = require('./Models/Order');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token not found' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains user id and isAdmin
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};


// USER ROUTES
app.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('cart.itemId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// BASE INFO ROUTES
app.post('/Baseline', async (req, res) => {
  try {
    const replaced = await Baseline.findOneAndReplace(
      {},           // no filter, so it finds any document
      req.body,     // new data to replace with
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(replaced);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.get('/Baseline', async (req, res) => {
  const info = await Baseline.findOne();
  res.json(info);
});

app.put('/Baseline/:id', async (req, res) => {
  try {
    const updated = await Baseline.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/Baseline/:id', async (req, res) => {
  try {
    await Baseline.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ITEM ROUTES
app.post('/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.put('/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/addtocart', authenticate, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id; // decoded from JWT token

    if (!itemId || !quantity) {
      return res.status(400).json({ error: 'Item ID and quantity required' });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const user = await User.findById(userId);

    // Check if item already exists in cart
    const existing = user.cart.find(c => c.itemId.toString() === itemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ itemId, quantity });
    }

    await user.save();

    res.status(200).json({ message: 'Item added to cart successfully', cart: user.cart });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/removefromcart', authenticate, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id; // decoded from JWT token

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter out the item to remove from cart
    user.cart = user.cart.filter(c => c.itemId.toString() !== itemId);

    await user.save();

    res.status(200).json({ message: 'Item removed from cart successfully', cart: user.cart });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete('/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create an order
app.post('/orders', async (req, res) => {
  try {
    const { userId, items, shipping, totalPrice } = req.body;

    // 👇 Find latest orderNumber
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const nextOrderNumber = lastOrder?.orderNumber ? lastOrder.orderNumber + 1 : 1;

    const order = new Order({
      orderNumber: nextOrderNumber, // ✅ set manually
      userId,
      items,
      shipping,
      totalPrice
    });

    await order.save();

    // ✅ Clear user's cart
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.put('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveredDate, paymentMode, status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { deliveredDate, paymentMode, status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.itemId')
      .populate('userId', 'username email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by userId
app.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.itemId')
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /orders/:id/cancel
app.put('/orders/:id/cancel', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!updated) return res.status(404).send('Order not found');
    res.send(updated);
  } catch (err) {
    res.status(500).send('Error cancelling order');
  }
});


const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
