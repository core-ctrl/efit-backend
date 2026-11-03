const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  longDescription: { type: String },
  category: { type: String, index: true },
  date: { type: String, index: true },
  time: { type: String },
  venue: { type: String },
  mode: { type: String },
  image: { type: String },
  organizedBy: { type: String },
  registrationOpen: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 0 },
}, { timestamps: true });

EventSchema.index({ date: 1, category: 1 });

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
