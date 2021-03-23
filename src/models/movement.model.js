const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Types.ObjectId(), required: true },
    amount: { type: Number, required: true },
    name: {
      type: String,
      required: true,
      match: /^(HNL)?(USD)?(EUR)?$/,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('movements', movementSchema);
