const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyCourses,
  getCourseEnrollment,
  updateProgress
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, enrollInCourse);
router.get('/my-courses', protect, getMyCourses);
router.get('/:courseId', protect, getCourseEnrollment);
router.patch('/:courseId/progress', protect, updateProgress);

module.exports = router;
