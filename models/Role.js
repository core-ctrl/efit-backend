const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    tier: {
      type: String,
      enum: ['ZERO_ORDER', 'DIRECTOR', 'LEAD', 'COORDINATOR', 'MEMBER', 'MENTOR'],
      default: 'MEMBER',
    },
    department: { type: String, default: 'General' },
    description: { type: String, default: '' },
    clearance: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'MEMBER', 'STUDENT'],
      default: 'MEMBER',
    },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema);
