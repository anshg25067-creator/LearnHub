const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Enroll in a free course
// @route   POST /api/enrollments
// @access  Private (Student)
const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required for enrollment'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in an unpublished course'
      });
    }

    // Check if already enrolled
    let enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId
    });

    if (enrollment) {
      return res.status(200).json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment
      });
    }

    // Determine first lesson ID if available to set initial lastAccessedLessonId
    let firstLessonId = '';
    if (course.sections && course.sections.length > 0) {
      const firstSec = course.sections[0];
      if (firstSec.lessons && firstSec.lessons.length > 0) {
        firstLessonId = firstSec.lessons[0]._id.toString();
      }
    }

    enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId,
      completedLessonIds: [],
      lastAccessedLessonId: firstLessonId,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses enrolled by logged-in student
// @route   GET /api/enrollments/my-courses
// @access  Private (Student)
const getMyCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate({
        path: 'courseId',
        select: 'title description thumbnail category level sections instructorId',
        populate: {
          path: 'instructorId',
          select: 'name email profileImage headline'
        }
      })
      .sort({ lastAccessedAt: -1 });

    const enrichedEnrollments = enrollments.map((enr) => {
      const course = enr.courseId;
      if (!course) return null;

      let totalLessons = 0;
      if (course.sections) {
        course.sections.forEach((sec) => {
          totalLessons += sec.lessons ? sec.lessons.length : 0;
        });
      }

      const completedCount = enr.completedLessonIds ? enr.completedLessonIds.length : 0;
      const progressPercent =
        totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

      return {
        _id: enr._id,
        courseId: course._id,
        courseTitle: course.title,
        courseThumbnail: course.thumbnail,
        category: course.category,
        level: course.level,
        instructorName: course.instructorId ? course.instructorId.name : 'Unknown',
        instructorHeadline: course.instructorId ? course.instructorId.headline : '',
        totalLessons,
        completedLessonsCount: completedCount,
        progressPercent,
        lastAccessedLessonId: enr.lastAccessedLessonId,
        lastAccessedAt: enr.lastAccessedAt,
        enrollmentDate: enr.enrollmentDate,
        status: enr.status
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      count: enrichedEnrollments.length,
      enrollments: enrichedEnrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollment details for a specific course (for learning player)
// @route   GET /api/enrollments/:courseId
// @access  Private (Student)
const getCourseEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate(
      'instructorId',
      'name email profileImage headline bio'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
        isEnrolled: false
      });
    }

    let totalLessons = 0;
    if (course.sections) {
      course.sections.forEach((sec) => {
        totalLessons += sec.lessons ? sec.lessons.length : 0;
      });
    }

    const completedCount = enrollment.completedLessonIds.length;
    const progressPercent =
      totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    res.status(200).json({
      success: true,
      isEnrolled: true,
      course,
      enrollment: {
        _id: enrollment._id,
        completedLessonIds: enrollment.completedLessonIds,
        lastAccessedLessonId: enrollment.lastAccessedLessonId,
        progressPercent,
        totalLessons,
        completedCount,
        status: enrollment.status,
        lastAccessedAt: enrollment.lastAccessedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson completion progress
// @route   PATCH /api/enrollments/:courseId/progress
// @access  Private (Student)
const updateProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { lessonId, completed } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    const lessonIdStr = lessonId.toString();

    if (completed !== false) {
      // Mark as completed
      if (!enrollment.completedLessonIds.includes(lessonIdStr)) {
        enrollment.completedLessonIds.push(lessonIdStr);
      }
    } else {
      // Mark as uncompleted
      enrollment.completedLessonIds = enrollment.completedLessonIds.filter(
        (id) => id !== lessonIdStr
      );
    }

    enrollment.lastAccessedLessonId = lessonIdStr;
    enrollment.lastAccessedAt = new Date();

    // Check if all lessons completed
    let totalLessons = 0;
    if (course.sections) {
      course.sections.forEach((sec) => {
        totalLessons += sec.lessons ? sec.lessons.length : 0;
      });
    }

    const completedCount = enrollment.completedLessonIds.length;
    const progressPercent =
      totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    if (totalLessons > 0 && completedCount >= totalLessons) {
      enrollment.status = 'completed';
    } else {
      enrollment.status = 'active';
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: completed !== false ? 'Lesson marked as completed' : 'Lesson marked as incomplete',
      progressPercent,
      completedLessonsCount: completedCount,
      totalLessons,
      completedLessonIds: enrollment.completedLessonIds,
      lastAccessedLessonId: enrollment.lastAccessedLessonId,
      status: enrollment.status
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyCourses,
  getCourseEnrollment,
  updateProgress
};
