const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    travelDates: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    travelers: { type: Number, required: true, min: 1 },
    specialRequests: { type: String },
    priceAtTime: { type: Number, required: true }, // Store price when added to cart
    addedAt: { type: Date, default: Date.now }
  }],
  totalAmount: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Calculate totals before saving
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
  this.lastUpdated = Date.now();
  next();
});

// Method to add item to cart
CartSchema.methods.addItem = function(packageId, quantity, travelDates, travelers, price, specialRequests = '') {
  const existingItemIndex = this.items.findIndex(item => 
    item.package.toString() === packageId.toString() &&
    item.travelDates.startDate.getTime() === travelDates.startDate.getTime() &&
    item.travelDates.endDate.getTime() === travelDates.endDate.getTime()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].travelers = travelers;
    this.items[existingItemIndex].specialRequests = specialRequests;
    this.items[existingItemIndex].addedAt = Date.now();
  } else {
    // Add new item
    this.items.push({
      package: packageId,
      quantity,
      travelDates,
      travelers,
      specialRequests,
      priceAtTime: price
    });
  }
};

// Method to remove item from cart
CartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
};

// Method to update item quantity
CartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    if (quantity <= 0) {
      this.removeItem(itemId);
    } else {
      item.quantity = quantity;
    }
  }
};

// Method to clear cart
CartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalAmount = 0;
  this.totalItems = 0;
};

module.exports = mongoose.model('Cart', CartSchema);
