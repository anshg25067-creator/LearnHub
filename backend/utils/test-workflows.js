const http = require('http');
const { startServer } = require('../server');

// Helper to make HTTP requests
const request = (port, method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runAllWorkflowTests = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING LEARNHUB AUTOMATED WORKFLOW VERIFICATION');
  console.log('====================================================\n');

  const server = await startServer();
  const PORT = server.address().port;

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // ---------------------------------------------------------
    // Test 1: A student can register and log in
    // ---------------------------------------------------------
    const testStudentEmail = `test.student.${Date.now()}@example.com`;
    const regRes = await request(PORT, 'POST', '/api/auth/register', {}, {
      name: 'Test Student',
      email: testStudentEmail,
      password: 'Password123!',
      role: 'student'
    });
    assert(regRes.status === 201 && regRes.data.token && regRes.data.user.role === 'student', 'Test 1.1: Student registration generates token & sets student role');

    const loginRes = await request(PORT, 'POST', '/api/auth/login', {}, {
      email: testStudentEmail,
      password: 'Password123!'
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Test 1.2: Student can log in successfully');
    const studentToken = loginRes.data.token;

    // ---------------------------------------------------------
    // Login Teacher 1 and Admin
    // ---------------------------------------------------------
    const teacherLogin = await request(PORT, 'POST', '/api/auth/login', {}, {
      email: 'marcus.sterling@learnhub.com',
      password: 'Password123!'
    });
    const teacherToken = teacherLogin.data.token;
    const teacherId = teacherLogin.data.user._id;

    const teacher2Login = await request(PORT, 'POST', '/api/auth/login', {}, {
      email: 'sarah.jenkins@learnhub.com',
      password: 'Password123!'
    });
    const teacher2Token = teacher2Login.data.token;

    const adminLogin = await request(PORT, 'POST', '/api/auth/login', {}, {
      email: 'admin@learnhub.com',
      password: 'Password123!'
    });
    const adminToken = adminLogin.data.token;

    // ---------------------------------------------------------
    // Test 2: A teacher can create and submit a course
    // ---------------------------------------------------------
    const newCoursePayload = {
      title: 'Automated Test Course: Intro to Modern Architecture',
      description: 'A verified curriculum designed for end-to-end integration tests.',
      category: 'Development',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      learningObjectives: ['Understand modular monoliths'],
      requirements: ['Basic programming knowledge'],
      sections: [
        {
          title: 'Module 1: Orientation',
          order: 1,
          lessons: [
            {
              title: 'Welcome to Architecture',
              description: 'Introductory notes.',
              videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
              duration: '10 min',
              order: 1
            },
            {
              title: 'Building Components',
              description: 'Core concepts.',
              videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
              duration: '15 min',
              order: 2
            }
          ]
        }
      ]
    };

    const createCourseRes = await request(PORT, 'POST', '/api/courses', {
      Authorization: `Bearer ${teacherToken}`
    }, newCoursePayload);
    assert(createCourseRes.status === 201 && createCourseRes.data.course.status === 'draft', 'Test 2.1: Teacher can create a course in draft status');
    const createdCourseId = createCourseRes.data.course._id;

    const submitRes = await request(PORT, 'PATCH', `/api/courses/${createdCourseId}/submit`, {
      Authorization: `Bearer ${teacherToken}`
    });
    assert(submitRes.status === 200 && submitRes.data.course.status === 'pending', 'Test 2.2: Teacher can submit course for admin approval');

    // ---------------------------------------------------------
    // Test 3: An admin can approve or reject a course
    // ---------------------------------------------------------
    const pendingListRes = await request(PORT, 'GET', '/api/admin/courses/pending', {
      Authorization: `Bearer ${adminToken}`
    });
    const inQueue = pendingListRes.data.courses.some((c) => c._id === createdCourseId);
    assert(inQueue, 'Test 3.1: Submitted course appears in admin pending queue');

    // Reject first with feedback
    const rejectRes = await request(PORT, 'PATCH', `/api/admin/courses/${createdCourseId}/reject`, {
      Authorization: `Bearer ${adminToken}`
    }, { reason: 'Need to add clearer objectives.' });
    assert(rejectRes.status === 200 && rejectRes.data.course.status === 'rejected', 'Test 3.2: Admin can reject a course with reason');

    // Teacher re-submits
    await request(PORT, 'PATCH', `/api/courses/${createdCourseId}/submit`, {
      Authorization: `Bearer ${teacherToken}`
    });

    // Admin approves
    const approveRes = await request(PORT, 'PATCH', `/api/admin/courses/${createdCourseId}/approve`, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(approveRes.status === 200 && approveRes.data.course.status === 'published', 'Test 3.3: Admin can approve and publish a course');

    // ---------------------------------------------------------
    // Test 4: Only published courses appear in the public marketplace
    // ---------------------------------------------------------
    const catalogRes = await request(PORT, 'GET', '/api/courses');
    const allPublished = catalogRes.data.courses.every((c) => c.status === 'published');
    const includesNewlyApproved = catalogRes.data.courses.some((c) => c._id === createdCourseId);
    assert(allPublished && includesNewlyApproved, 'Test 4: Only published courses appear in public marketplace');

    // ---------------------------------------------------------
    // Test 5: A student can enroll in a published free course
    // ---------------------------------------------------------
    const enrollRes = await request(PORT, 'POST', '/api/enrollments', {
      Authorization: `Bearer ${studentToken}`
    }, { courseId: createdCourseId });
    assert(enrollRes.status === 201 && enrollRes.data.enrollment.status === 'active', 'Test 5: Student can enroll in published course');

    // ---------------------------------------------------------
    // Test 6: An enrolled student can access course lessons
    // ---------------------------------------------------------
    const accessRes = await request(PORT, 'GET', `/api/enrollments/${createdCourseId}`, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(accessRes.status === 200 && accessRes.data.isEnrolled === true && accessRes.data.course.sections.length > 0, 'Test 6: Enrolled student can access course curriculum and lessons');

    // ---------------------------------------------------------
    // Test 7: A student can mark lessons as completed
    // ---------------------------------------------------------
    const lesson1Id = accessRes.data.course.sections[0].lessons[0]._id;
    const markCompleteRes = await request(PORT, 'PATCH', `/api/enrollments/${createdCourseId}/progress`, {
      Authorization: `Bearer ${studentToken}`
    }, { lessonId: lesson1Id, completed: true });
    assert(markCompleteRes.status === 200 && markCompleteRes.data.progressPercent === 50, 'Test 7: Student can mark lesson complete (1 of 2 lessons = 50% progress)');

    // ---------------------------------------------------------
    // Test 8: Progress remains saved after logout and login
    // ---------------------------------------------------------
    // Simulate re-login
    const relogin = await request(PORT, 'POST', '/api/auth/login', {}, {
      email: testStudentEmail,
      password: 'Password123!'
    });
    const freshStudentToken = relogin.data.token;
    const progressCheck = await request(PORT, 'GET', `/api/enrollments/${createdCourseId}`, {
      Authorization: `Bearer ${freshStudentToken}`
    });
    assert(progressCheck.data.enrollment.progressPercent === 50 && progressCheck.data.enrollment.completedLessonIds.includes(lesson1Id.toString()), 'Test 8: Progress remains saved after re-authentication');

    // ---------------------------------------------------------
    // Test 9: A teacher cannot edit another teacher's course
    // ---------------------------------------------------------
    const unauthorizedEdit = await request(PORT, 'PATCH', `/api/courses/${createdCourseId}`, {
      Authorization: `Bearer ${teacher2Token}`
    }, { title: 'Hijacked Title' });
    assert(unauthorizedEdit.status === 403, 'Test 9: Teacher cannot modify another teacher\'s course (HTTP 403 Forbidden)');

    // ---------------------------------------------------------
    // Test 10: A student cannot access teacher or admin functionality
    // ---------------------------------------------------------
    const studentTeacherAccess = await request(PORT, 'GET', '/api/teacher/dashboard', {
      Authorization: `Bearer ${studentToken}`
    });
    const studentAdminAccess = await request(PORT, 'GET', '/api/admin/dashboard', {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentTeacherAccess.status === 403 && studentAdminAccess.status === 403, 'Test 10: Student cannot access teacher or admin routes (HTTP 403 Forbidden)');

    // ---------------------------------------------------------
    // Test 11: A user cannot change their role through frontend requests
    // ---------------------------------------------------------
    const maliciousRegister = await request(PORT, 'POST', '/api/auth/register', {}, {
      name: 'Hacker',
      email: `hacker.${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'admin' // Attempting to register as admin!
    });
    assert(maliciousRegister.status === 403, 'Test 11.1: Public registration with admin role is rejected (HTTP 403 Forbidden)');

    const maliciousProfileUpdate = await request(PORT, 'PATCH', '/api/auth/profile', {
      Authorization: `Bearer ${studentToken}`
    }, { role: 'admin' });
    const meCheck = await request(PORT, 'GET', '/api/auth/me', {
      Authorization: `Bearer ${studentToken}`
    });
    assert(meCheck.data.user.role === 'student', 'Test 11.2: Student cannot elevate their own role to admin via profile update');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
};

runAllWorkflowTests();
