const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  universityId: { type: String, required: true, index: true },
  accountType: { type: String, enum: ['STUDENT', 'MEMBER', 'SUPER_ADMIN', 'ADMIN', 'GUEST'], default: 'STUDENT' },
  status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },
  roles: [{ type: String, default: ['STUDENT'] }],
  department: { type: String, default: 'Computer Science & Engineering' },
  year: { type: String, default: 'B.Tech' },
  password: { type: String },
  authProvider: { type: String, enum: ['MICROSOFT', 'CREDENTIALS'], default: 'MICROSOFT' },
  hasPasswordSet: { type: Boolean, default: false },
  allowedModules: [{ type: String }],
  customPermissions: { type: Object, default: {} },
  
  // Profile & Portfolio Attributes
  image: { type: String, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  phone: { type: String, default: '' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  projects: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    techStack: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
  }],
  experience: [{
    role: { type: String, required: true },
    organization: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' },
  }],
  socials: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    other: { type: String, default: '' },
    otherLabel: { type: String, default: '' },
  },
  portfolioStatus: {
    type: String,
    enum: ['INCOMPLETE', 'BASIC', 'COMPLETE'],
    default: 'BASIC',
  },
  portfolioVisibility: {
    type: String,
    enum: ['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'],
    default: 'PUBLIC',
  },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.index({ universityId: 1, name: 1 });
UserSchema.index({ accountType: 1, status: 1 });

module.exports = mongoose.model('User', UserSchema);
