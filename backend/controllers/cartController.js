const Cart = require('../models/Cart');
const Package = require('../models/Package');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.package', 'title price location duration images availability maxCapacity currentBookings');

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    // Filter out items with unavailable packages
    const validItems = cart.items.filter(item => 
      item.package && item.package.availability
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { packageId, quantity = 1, travelDates, travelers, specialRequests = '' } = req.body;

    // Validate package exists and is available
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (!package.availability) {
      return res.status(400).json({ message: 'Package is not available' });
    }

    // Validate travel dates
    const startDate = new Date(travelDates.startDate);
    const endDate = new Date(travelDates.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check capacity
    if (package.currentBookings + (travelers * quantity) > package.maxCapacity) {
      return res.status(400).json({ message: 'Not enough capacity available' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Add item to cart
    cart.addItem(packageId, quantity, travelDates, travelers, package.price, specialRequests);
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.package', 'title price location duration images');

    // Emit real-time cart update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('cart-updated', {
        userId: req.user.id,
        cart: updatedCart,
        action: 'item_added'
      });
    }

    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity, travelDates, travelers, specialRequests } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Validate package capacity if updating quantity or travelers
    if (quantity !== undefined || travelers !== undefined) {
      const package = await Package.findById(item.package);
      const newQuantity = quantity !== undefined ? quantity : item.quantity;
      const newTravelers = travelers !== undefined ? travelers : item.travelers;
      
      if (package.currentBookings + (newTravelers * newQuantity) > package.maxCapacity) {
        return res.status(400).json({ message: 'Not enough capacity available' });
      }
    }

    // Update item properties
    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.removeItem(itemId);
      } else {
        item.quantity = quantity;
      }
    }
    
    if (travelDates) {
      const startDate = new Date(travelDates.startDate);
      const endDate = new Date(travelDates.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        return res.status(400).json({ message: 'Start date cannot be in the past' });
      }

      if (endDate <= startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      item.travelDates = travelDates;
    }
    
    if (travelers !== undefined) item.travelers = travelers;
    if (specialRequests !== undefined) item.specialRequests = specialRequests;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.package', 'title price location duration images');

    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.removeItem(itemId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.package', 'title price location duration images');

    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.clearCart();
    await cart.save();

    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
const getCartItemCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    const count = cart ? cart.totalItems : 0;
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate cart items
// @route   POST /api/cart/validate
// @access  Private
const validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.package', 'title price availability maxCapacity currentBookings');

    if (!cart || cart.items.length === 0) {
      return res.json({ valid: true, issues: [] });
    }

    const issues = [];
    const validItems = [];

    for (const item of cart.items) {
      if (!item.package) {
        issues.push({
          itemId: item._id,
          issue: 'Package no longer exists',
          severity: 'error'
        });
        continue;
      }

      if (!item.package.availability) {
        issues.push({
          itemId: item._id,
          packageTitle: item.package.title,
          issue: 'Package is no longer available',
          severity: 'error'
        });
        continue;
      }

      if (item.package.currentBookings + (item.travelers * item.quantity) > item.package.maxCapacity) {
        issues.push({
          itemId: item._id,
          packageTitle: item.package.title,
          issue: 'Not enough capacity available',
          severity: 'error'
        });
        continue;
      }

      if (item.priceAtTime !== item.package.price) {
        issues.push({
          itemId: item._id,
          packageTitle: item.package.title,
          issue: `Price changed from $${item.priceAtTime} to $${item.package.price}`,
          severity: 'warning'
        });
      }

      validItems.push(item);
    }

    // Remove invalid items
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({
      valid: issues.filter(issue => issue.severity === 'error').length === 0,
      issues,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  validateCart
};
