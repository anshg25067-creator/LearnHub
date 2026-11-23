import api from './api';

export const enrollmentService = {
  enroll: async (courseId) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
  },

  getMyCourses: async () => {
    const response = await api.get('/enrollments/my-courses');
    return response.data.enrollments;
  },

  getCourseEnrollment: async (courseId) => {
    const response = await api.get(`/enrollments/${courseId}`);
    return response.data;
  },

  updateProgress: async (courseId, lessonId, completed) => {
    const response = await api.patch(`/enrollments/${courseId}/progress`, {
      lessonId,
      completed
    });
    return response.data;
  }
};
