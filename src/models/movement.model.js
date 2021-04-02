const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.ObjectId, required: true },
    categoryId: { type: mongoose.ObjectId, required: true },
    amount: { type: Number, required: true },
    isIncome: { type: Boolean, required: true },
    note: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('movements', movementSchema);
