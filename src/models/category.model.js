const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('categories', categorySchema);
