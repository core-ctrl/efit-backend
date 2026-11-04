const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  longDescription: { type: String },
  club: { type: String, enum: ['rubix', 'fornix', 'efit'], default: 'rubix', index: true },
  category: { type: String, index: true },
  date: { type: String, required: true, index: true },
  time: { type: String },
  endTime: { type: String },
  venue: { type: String },
  mode: { type: String, default: 'Offline' },
  image: { type: String },
  organizedBy: { type: String },
  registrationOpen: { type: Boolean, default: true },
  maxParticipants: { type: Number, default: 0 },
  reportUrl: { type: String, default: '' },
  reportName: { type: String, default: '' },
  semester: { type: String, default: '' },
  scheduleType: { type: String, enum: ['SPECIFIC_SLOT', 'FULL_DAY', 'MULTI_DAY'], default: 'SPECIFIC_SLOT' },
  isFullDay: { type: Boolean, default: false },
  scheduleSlots: [
    {
      date: String,
      startTime: String,
      endTime: String,
      isFullDay: Boolean,
      label: String,
    },
  ],
}, { timestamps: true });

EventSchema.index({ date: 1, club: 1 });
EventSchema.index({ club: 1, date: -1 });
EventSchema.index({ date: 1, category: 1 });

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);

