const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  universityId: { type: String, required: true, index: true },
  accountType: { type: String, enum: ['STUDENT', 'MEMBER', 'SUPER_ADMIN', 'ADMIN', 'GUEST'], default: 'STUDENT' },
  status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
  roles: [{ type: String, default: ['STUDENT'] }],
  department: { type: String },
  year: { type: String },
  password: { type: String },
  authProvider: { type: String, enum: ['MICROSOFT', 'CREDENTIALS'], default: 'MICROSOFT' },
  hasPasswordSet: { type: Boolean, default: false },
  allowedModules: [{ type: String }],
  customPermissions: { type: Object, default: {} }
}, { timestamps: true });

UserSchema.index({ universityId: 1, name: 1 });
UserSchema.index({ accountType: 1, status: 1 });

module.exports = mongoose.model('User', UserSchema);

