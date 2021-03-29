const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.ObjectId, required: true },
    isActive: { type: Boolean, required: false, default: true },
    name: { type: String, required: true },
    balance: { type: Number, required: true },
    hasMinimum: { type: Boolean, required: true },
    minimum: { type: Number, required: true },
    currency: { type: String, required: true, match: /^(HNL)?(USD)?(EUR)?$/ },
  },
  { timestamps: true }
);

module.exports = mongoose.model('accounts', accountSchema);
