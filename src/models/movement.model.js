const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.ObjectId, required: true },
    accountPrev: { type: Number, required: true },
    amount: { type: Number, required: true },
    isIncome: { type: Boolean, required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, required: false, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('movements', movementSchema);
