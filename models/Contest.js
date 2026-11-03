const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Upcoming', 'Live', 'Completed'], default: 'Upcoming', index: true },
  deadline: { type: String, index: true },
  prizePool: { type: String, default: '₹10,000' },
  teamSize: { type: String, default: '1-4 Members' },
  rules: [{ type: String }],
  prizes: [{ type: String }],
  registrationOpen: { type: Boolean, default: true },
}, { timestamps: true });

ContestSchema.index({ deadline: 1, status: 1 });

module.exports = mongoose.models.Contest || mongoose.model('Contest', ContestSchema);
