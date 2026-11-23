const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { connectDB } = require('../config/db');

const seedData = async () => {
  try {
    console.log('Seeding LearnHub database with realistic sample data...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Users (1 Admin, 2 Teachers, 2 Students)
    const admin = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@learnhub.com',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
      headline: 'LearnHub Lead Platform Administrator',
      bio: 'Oversees course quality assurance, platform operations, and user compliance.',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    });

    const teacher1 = await User.create({
      name: 'Dr. Marcus Sterling',
      email: 'marcus.sterling@learnhub.com',
      passwordHash,
      role: 'teacher',
      accountStatus: 'active',
      headline: 'Principal Software Engineer & Cloud Architect',
      bio: 'Former Tech Lead at Stripe. 15+ years building distributed cloud platforms, JavaScript ecosystems, and modern web applications.',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    });

    const teacher2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@learnhub.com',
      passwordHash,
      role: 'teacher',
      accountStatus: 'active',
      headline: 'Staff Product Designer & AI Researcher',
      bio: 'Design systems lead and AI practitioner. Mentored over 10,000 students in modern UI/UX design, Figma architectures, and Python data science.',
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80'
    });

    const student1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@learnhub.com',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
      headline: 'Aspiring Full-Stack Software Developer',
      bio: 'Learning modern web development and DevOps to launch a software engineering career.',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
    });

    const student2 = await User.create({
      name: 'Chloe Chen',
      email: 'chloe.chen@learnhub.com',
      passwordHash,
      role: 'student',
      accountStatus: 'active',
      headline: 'Computer Science Undergraduate',
      bio: 'Passionate about artificial intelligence, database engineering, and interactive frontends.',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
    });

    console.log('✓ Users created');

    // 2. Create Courses (7 diverse courses across levels and categories)
    const coursesData = [
      {
        title: 'Full-Stack React & Node.js: The Complete Guide 2026',
        description: 'Master modern full-stack web development with React 18, Node.js, Express, and MongoDB. Build production-ready, performant web applications from scratch with authentication, responsive design, and robust REST APIs.',
        instructorId: teacher1._id,
        category: 'Development',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Build complete full-stack web applications with React and Node.js',
          'Implement secure JWT authentication and authorization middleware',
          'Design scalable RESTful APIs with Express and Mongoose',
          'Structure reusable components and manage state efficiently'
        ],
        requirements: [
          'Basic understanding of HTML, CSS, and modern JavaScript (ES6+)',
          'A computer with Node.js installed and an internet connection'
        ],
        sections: [
          {
            title: 'Section 1: Foundations of Full-Stack Architecture',
            order: 1,
            lessons: [
              {
                title: 'Welcome to LearnHub & Course Orientation',
                description: 'An overview of what we will build, tools required, and the modern full-stack development landscape.',
                videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
                duration: '8 min',
                order: 1
              },
              {
                title: 'Architecture Deep-Dive: Monoliths vs Microservices',
                description: 'Understanding modular monolith design principles and state synchronization between client and server.',
                videoUrl: 'https://www.youtube.com/embed/Ke90Tje7VS0',
                duration: '15 min',
                order: 2
              },
              {
                title: 'Setting Up Your Modern Development Environment',
                description: 'Configuring Vite, ESLint, Node.js, and MongoDB connection strings for peak developer productivity.',
                videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
                duration: '12 min',
                order: 3
              }
            ]
          },
          {
            title: 'Section 2: Building Scalable REST APIs with Express & Mongoose',
            order: 2,
            lessons: [
              {
                title: 'Designing MongoDB Schemas & Relations',
                description: 'Data modeling, schema validation, virtuals, and compound indexes.',
                videoUrl: 'https://www.youtube.com/embed/DZBGEExL2VU',
                duration: '18 min',
                order: 1
              },
              {
                title: 'Implementing JWT Authentication & Role Guards',
                description: 'Protecting endpoints, token rotation, password hashing with bcrypt, and role checks.',
                videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4',
                duration: '22 min',
                order: 2
              }
            ]
          },
          {
            title: 'Section 3: Crafting the Interactive React Frontend',
            order: 3,
            lessons: [
              {
                title: 'State Management and Custom Hooks',
                description: 'Creating centralized API clients, context providers, and clean UI components.',
                videoUrl: 'https://www.youtube.com/embed/k3Vfj-e1Ma4',
                duration: '20 min',
                order: 1
              },
              {
                title: 'Connecting Frontend to Backend with Seamless DX',
                description: 'Integrating API calls, handling error states, and rendering optimistic UI updates.',
                videoUrl: 'https://www.youtube.com/embed/0riHps91AzE',
                duration: '16 min',
                order: 2
              }
            ]
          }
        ],
        status: 'published'
      },
      {
        title: 'Mastering Modern UI/UX Design: From Figma to Production',
        description: 'Design intuitive, accessible, and high-converting web and mobile products. Master design tokens, responsive layouts, typography scales, wireframing, interactive prototyping, and design systems in Figma.',
        instructorId: teacher2._id,
        category: 'Design',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Master Figma layout grids, auto-layout, and component variants',
          'Create accessible color palettes with high WCAG contrast',
          'Construct complete design systems with reusable tokens',
          'Conduct usability testing and prototype interactive user journeys'
        ],
        requirements: [
          'No prior design experience needed — free Figma account is sufficient',
          'Curiosity for visual hierarchy and user psychology'
        ],
        sections: [
          {
            title: 'Section 1: Fundamentals of Visual Hierarchy',
            order: 1,
            lessons: [
              {
                title: 'Principles of Modern UI: Space, Type, and Contrast',
                description: 'Why spacing is the secret weapon of great interfaces and how to pick typeface pairings.',
                videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
                duration: '14 min',
                order: 1
              },
              {
                title: 'Figma Auto-Layout Masterclass',
                description: 'Learn how to build responsive UI components that flex across all screen sizes.',
                videoUrl: 'https://www.youtube.com/embed/NrKX46DzkGQ',
                duration: '21 min',
                order: 2
              }
            ]
          },
          {
            title: 'Section 2: Designing an E-Learning Web Application',
            order: 2,
            lessons: [
              {
                title: 'Wireframing the Learning Experience',
                description: 'Translating student user stories into low-fidelity wireframes.',
                videoUrl: 'https://www.youtube.com/embed/FTFaQWZBqQ8',
                duration: '19 min',
                order: 1
              },
              {
                title: 'High-Fidelity Component Library & Prototyping',
                description: 'Building buttons, course cards, progress rings, and interactive navigation bars.',
                videoUrl: 'https://www.youtube.com/embed/dXQ7IHkTiMM',
                duration: '25 min',
                order: 2
              }
            ]
          }
        ],
        status: 'published'
      },
      {
        title: 'Python for Data Science & Machine Learning Bootcamp',
        description: 'Go from zero to hero in Python data analytics, NumPy, Pandas, Matplotlib, Scikit-Learn, and introductory neural networks. Solve real-world data problems with clean, reproducible Jupyter notebooks.',
        instructorId: teacher2._id,
        category: 'Data Science',
        level: 'All Levels',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Perform exploratory data analysis with Pandas and NumPy',
          'Visualize patterns with Matplotlib and Seaborn',
          'Train regression, classification, and clustering machine learning models',
          'Evaluate model performance with precision, recall, and ROC curves'
        ],
        requirements: [
          'Basic math concepts (high school algebra)',
          'Any computer running Windows, macOS, or Linux'
        ],
        sections: [
          {
            title: 'Section 1: Python Data Analysis Foundations',
            order: 1,
            lessons: [
              {
                title: 'Introduction to Data Science Workflow',
                description: 'The complete lifecycle of data collection, cleaning, feature engineering, and modeling.',
                videoUrl: 'https://www.youtube.com/embed/ua-CiDNNj30',
                duration: '11 min',
                order: 1
              },
              {
                title: 'Pandas Wrangling: Filtering, Grouping & Aggregations',
                description: 'Master Series and DataFrames with real-world sales and education datasets.',
                videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
                duration: '24 min',
                order: 2
              }
            ]
          },
          {
            title: 'Section 2: Applied Machine Learning with Scikit-Learn',
            order: 2,
            lessons: [
              {
                title: 'Supervised Learning: Linear & Logistic Regression',
                description: 'Building predictive models and interpreting coefficients.',
                videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
                duration: '28 min',
                order: 1
              },
              {
                title: 'Random Forests and Model Evaluation Metrics',
                description: 'Preventing overfitting and benchmarking algorithms.',
                videoUrl: 'https://www.youtube.com/embed/J4Wdy0Wc_xQ',
                duration: '22 min',
                order: 2
              }
            ]
          }
        ],
        status: 'published'
      },
      {
        title: 'Cloud DevOps & Docker Mastery: Zero to Production',
        description: 'Learn modern DevOps practices: containerization with Docker, multi-stage builds, Docker Compose, automated CI/CD pipelines, reverse proxies with NGINX, and zero-downtime deployments.',
        instructorId: teacher1._id,
        category: 'DevOps',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Containerize Node.js and React applications using optimized Dockerfiles',
          'Manage multi-container microservices with Docker Compose',
          'Implement automated CI/CD pipelines with GitHub Actions',
          'Secure container runtimes and manage secrets safely'
        ],
        requirements: [
          'Familiarity with the command line / bash terminal',
          'Basic knowledge of web servers and ports'
        ],
        sections: [
          {
            title: 'Section 1: Container Fundamentals',
            order: 1,
            lessons: [
              {
                title: 'Why Containers Matter in Modern Software Delivery',
                description: 'Virtual machines vs Docker containers: solving the "works on my machine" dilemma.',
                videoUrl: 'https://www.youtube.com/embed/fqMOX6JJhGo',
                duration: '10 min',
                order: 1
              },
              {
                title: 'Writing Production-Grade Dockerfiles',
                description: 'Multi-stage builds, alpine base images, layer caching, and non-root security.',
                videoUrl: 'https://www.youtube.com/embed/gAkwW2tuIqE',
                duration: '18 min',
                order: 2
              }
            ]
          },
          {
            title: 'Section 2: Orchestration & Compose',
            order: 1,
            lessons: [
              {
                title: 'Docker Compose for Full-Stack Applications',
                description: 'Running frontend, backend API, and MongoDB with one unified command.',
                videoUrl: 'https://www.youtube.com/embed/HG6yLvbp24c',
                duration: '22 min',
                order: 1
              }
            ]
          }
        ],
        status: 'published'
      },
      {
        title: 'Cybersecurity Fundamentals & Ethical Hacking',
        description: 'Understand modern threat models, network security, web application vulnerabilities (OWASP Top 10), penetration testing principles, and defensive hardening strategies.',
        instructorId: teacher1._id,
        category: 'Cybersecurity',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Understand cybersecurity threat landscapes and attack vectors',
          'Detect and mitigate OWASP Top 10 vulnerabilities (XSS, CSRF, SQL Injection)',
          'Secure authentication, session handling, and sensitive customer data',
          'Perform ethical security audits and penetration tests'
        ],
        requirements: [
          'Basic understanding of HTTP and networking concepts',
          'Ethical mindset committed to responsible disclosure'
        ],
        sections: [
          {
            title: 'Section 1: Introduction to Web Security',
            order: 1,
            lessons: [
              {
                title: 'The Hacker Mindset & Ethical Hacking Principles',
                description: 'Legal boundaries, bug bounty programs, and vulnerability disclosure.',
                videoUrl: 'https://www.youtube.com/embed/3Kq1MIfTWCE',
                duration: '13 min',
                order: 1
              },
              {
                title: 'Exploring the OWASP Top 10 Vulnerabilities',
                description: 'Detailed analysis of injection attacks, broken access controls, and cryptographic failures.',
                videoUrl: 'https://www.youtube.com/embed/WlmkwU8Kk34',
                duration: '20 min',
                order: 2
              }
            ]
          }
        ],
        status: 'published'
      },
      {
        title: 'Advanced TypeScript & Architectural Patterns',
        description: 'Level up your JavaScript skills with TypeScript. Master generics, conditional types, mapped types, abstract classes, dependency injection, and clean architecture principles for enterprise applications.',
        instructorId: teacher1._id,
        category: 'Development',
        level: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Write strict, type-safe enterprise TypeScript applications',
          'Master advanced generics, utility types, and template literal types',
          'Apply SOLID principles and Clean Architecture in TypeScript',
          'Refactor legacy JavaScript codebases with zero downtime'
        ],
        requirements: [
          'Solid proficiency in modern JavaScript',
          'Prior experience with React or Node.js'
        ],
        sections: [
          {
            title: 'Section 1: Advanced Type System Mastery',
            order: 1,
            lessons: [
              {
                title: 'Deep Dive into TypeScript Generics',
                description: 'Building flexible and reusable functions, classes, and interfaces.',
                videoUrl: 'https://www.youtube.com/embed/d56mG7DezGs',
                duration: '17 min',
                order: 1
              },
              {
                title: 'Conditional Types & Infer Keyword',
                description: 'Unlocking meta-programming in TypeScript for bulletproof typing.',
                videoUrl: 'https://www.youtube.com/embed/BCg4wg9f9_0',
                duration: '23 min',
                order: 2
              }
            ]
          }
        ],
        status: 'pending' // One course pending approval for moderation testing!
      },
      {
        title: 'Generative AI Applications with LangChain & Node.js',
        description: 'Build real-world generative AI applications using modern LLMs, vector embeddings, semantic search, and retrieval-augmented generation (RAG) using Node.js.',
        instructorId: teacher2._id,
        category: 'Artificial Intelligence',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
        learningObjectives: [
          'Integrate leading LLMs via modern APIs into Node.js applications',
          'Construct vector databases and perform semantic similarity searches',
          'Implement Retrieval-Augmented Generation (RAG) on proprietary documents'
        ],
        requirements: [
          'Good knowledge of JavaScript / Node.js async programming'
        ],
        sections: [
          {
            title: 'Section 1: Generative AI Foundations',
            order: 1,
            lessons: [
              {
                title: 'Tokens, Embeddings, and Prompt Engineering',
                description: 'How modern transformer models process context and generate structured responses.',
                videoUrl: 'https://www.youtube.com/embed/jkrNmkKvd6A',
                duration: '15 min',
                order: 1
              }
            ]
          }
        ],
        status: 'draft' // One course in draft mode for teacher course management testing!
      }
    ];

    const createdCourses = await Course.create(coursesData);
    console.log(`✓ ${createdCourses.length} Courses created (Published, Pending, Draft)`);

    // 3. Create Sample Enrollments and Progress for Students
    const reactCourse = createdCourses[0];
    const designCourse = createdCourses[1];
    const dataScienceCourse = createdCourses[2];

    // Alex Rivera enrolled in React course (has completed 3 lessons out of 7)
    const reactLesson1Id = reactCourse.sections[0].lessons[0]._id.toString();
    const reactLesson2Id = reactCourse.sections[0].lessons[1]._id.toString();
    const reactLesson3Id = reactCourse.sections[0].lessons[2]._id.toString();
    const reactLesson4Id = reactCourse.sections[1].lessons[0]._id.toString();

    await Enrollment.create({
      studentId: student1._id,
      courseId: reactCourse._id,
      completedLessonIds: [reactLesson1Id, reactLesson2Id, reactLesson3Id],
      lastAccessedLessonId: reactLesson4Id,
      enrollmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
      status: 'active'
    });

    // Alex Rivera also enrolled in Design course (completed all 4 lessons -> status: completed!)
    const designLessonIds = [];
    designCourse.sections.forEach((sec) => {
      sec.lessons.forEach((les) => designLessonIds.push(les._id.toString()));
    });

    await Enrollment.create({
      studentId: student1._id,
      courseId: designCourse._id,
      completedLessonIds: designLessonIds,
      lastAccessedLessonId: designLessonIds[designLessonIds.length - 1],
      enrollmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed'
    });

    // Chloe Chen enrolled in Data Science course (1 lesson completed)
    const dsLesson1Id = dataScienceCourse.sections[0].lessons[0]._id.toString();
    const dsLesson2Id = dataScienceCourse.sections[0].lessons[1]._id.toString();

    await Enrollment.create({
      studentId: student2._id,
      courseId: dataScienceCourse._id,
      completedLessonIds: [dsLesson1Id],
      lastAccessedLessonId: dsLesson2Id,
      enrollmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastAccessedAt: new Date(),
      status: 'active'
    });

    console.log('✓ Sample Enrollments and Progress created');
    console.log('\n=============================================');
    console.log('LEARNHUB SEEDING COMPLETE!');
    console.log('=============================================');
    console.log('DEFAULT TEST CREDENTIALS (Password for all: Password123!)');
    console.log('---------------------------------------------');
    console.log('👑 Admin:');
    console.log('   Email:    admin@learnhub.com');
    console.log('   Password: Password123!');
    console.log('\n👨‍🏫 Teacher 1:');
    console.log('   Email:    marcus.sterling@learnhub.com');
    console.log('   Password: Password123!');
    console.log('\n👩‍🏫 Teacher 2:');
    console.log('   Email:    sarah.jenkins@learnhub.com');
    console.log('   Password: Password123!');
    console.log('\n🎓 Student 1 (In-progress & Completed courses):');
    console.log('   Email:    alex.rivera@learnhub.com');
    console.log('   Password: Password123!');
    console.log('\n🎓 Student 2:');
    console.log('   Email:    chloe.chen@learnhub.com');
    console.log('   Password: Password123!');
    console.log('=============================================\n');

    return { admin, teacher1, teacher2, student1, student2, createdCourses };
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

// If run directly via CLI: node utils/seed.js
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedData();
    process.exit(0);
  })();
}

module.exports = seedData;
