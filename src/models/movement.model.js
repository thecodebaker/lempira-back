const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Types.ObjectId(), required: true },
    amount: { type: Number, required: true },
    isIncome: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('movements', movementSchema);
