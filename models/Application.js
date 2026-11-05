const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  wing: { type: String, required: true },
  role: { type: String, required: true },
  cgpa: { type: String, default: '8.5' },
  portfolioUrl: { type: String, default: '' },
  statement: { type: String, default: '' },
  agreedToTerms: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['PENDING', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
    index: true,
  },
  date: { type: String },
}, { timestamps: true });

ApplicationSchema.index({ studentId: 1, wing: 1 });

module.exports = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
