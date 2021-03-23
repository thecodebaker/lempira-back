const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId(), required: true },
    name: { type: String, required: true },
    currency: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('accounts', accountSchema);
