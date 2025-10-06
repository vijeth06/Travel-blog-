const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  validateCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.get('/count', getCartItemCount);
router.post('/validate', validateCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
