const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    completedLessonIds: [
      {
        type: String
      }
    ],
    lastAccessedLessonId: {
      type: String,
      default: ''
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Ensure one enrollment per student per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1 });
enrollmentSchema.index({ courseId: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
