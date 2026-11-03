const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  id: { type: String, index: true },
  name: { type: String, required: true },
  role: { type: String, index: true },
  category: { type: String, index: true },
  x: String,
  y: String,
  image: String,
  universityId: { type: String, index: true },
  email: String,
}, { timestamps: true });

memberSchema.index({ universityId: 1, id: 1 });
memberSchema.index({ category: 1, role: 1 });

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);
