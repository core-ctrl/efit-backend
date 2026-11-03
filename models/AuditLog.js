const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  user: { type: String, required: true },
  target: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  status: { type: String, default: 'SUCCESS' },
}, { timestamps: true });

AuditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
