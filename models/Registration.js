const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: String },
  venue: { type: String },
  passId: { type: String, required: true, unique: true },
  status: { type: String, default: 'CONFIRMED' },
}, { timestamps: true });

RegistrationSchema.index({ userId: 1, eventTitle: 1 });

module.exports = mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
