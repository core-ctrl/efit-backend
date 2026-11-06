const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Chronicles', 'Event Posters', 'Branding'],
      default: 'Chronicles',
      index: true,
    },
    url: { type: String, required: true },
    publicId: { type: String },
    uploadedAt: { type: String },
  },
  { timestamps: true }
);

MediaSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Media || mongoose.model('Media', MediaSchema);

