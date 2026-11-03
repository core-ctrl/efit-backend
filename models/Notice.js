const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'GENERAL', index: true },
  priority: { type: String, default: 'Normal' },
  author: { type: String, default: 'Admin' },
}, { timestamps: true });

NoticeSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
