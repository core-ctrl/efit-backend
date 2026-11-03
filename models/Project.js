const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['rubix', 'forensic'], default: 'rubix', index: true },
  technologies: [{ type: String }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

ProjectSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
