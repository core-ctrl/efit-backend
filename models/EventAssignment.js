const mongoose = require('mongoose');

const AuditEntrySchema = new mongoose.Schema(
  {
    modifiedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    previousAttendance: { type: String },
    updatedAttendance: { type: String },
    previousHours: { type: Number },
    updatedHours: { type: Number },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const EventAssignmentSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    eventTitle: { type: String, required: true },
    eventSlug: { type: String, required: true },
    club: { type: String, enum: ['rubix', 'fornix', 'efit'], default: 'rubix', index: true },
    eventPoster: { type: String, default: '' },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, default: '' },
    assignedRole: { type: String, required: true }, // 'Photography', 'Registration', 'Logistics', etc.
    assignedTaskDetails: { type: String, default: '' },
    assignmentDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    scheduleType: {
      type: String,
      enum: ['SPECIFIC_SLOT', 'FULL_DAY', 'MULTI_DAY'],
      default: 'SPECIFIC_SLOT',
    },
    startTime: { type: String, default: '09:00 AM' },
    endTime: { type: String, default: '05:00 PM' },
    isFullDay: { type: Boolean, default: false },
    // Independent student attendance status:
    attendance: {
      type: String,
      enum: ['Pending', 'Present', 'Not Present', 'Partially Present'],
      default: 'Pending',
      index: true,
    },
    // Independent student task workflow status:
    status: {
      type: String,
      enum: ['Assigned', 'Ongoing', 'Awaiting Verification', 'Verified', 'Cancelled'],
      default: 'Assigned',
      index: true,
    },
    actualParticipationHours: { type: Number, default: 0 },
    actualTimeDetails: { type: String, default: '' },
    adminRemarks: { type: String, default: '' },
    verifiedBy: { type: String, default: '' },
    verifiedAt: { type: Date },
    emailStatus: {
      type: String,
      enum: ['sent', 'failed', 'pending', 'skipped'],
      default: 'pending',
    },
    auditLog: [AuditEntrySchema],
  },
  { timestamps: true }
);

EventAssignmentSchema.index({ eventId: 1, studentId: 1, assignmentDate: 1 });
EventAssignmentSchema.index({ studentId: 1, assignmentDate: -1 });
EventAssignmentSchema.index({ eventId: 1, attendance: 1 });
EventAssignmentSchema.index({ club: 1, assignmentDate: -1 });

module.exports =
  mongoose.models.EventAssignment || mongoose.model('EventAssignment', EventAssignmentSchema);

