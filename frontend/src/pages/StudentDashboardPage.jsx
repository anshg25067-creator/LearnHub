import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Play, 
  Compass, 
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const data = await enrollmentService.getMyCourses();
        setEnrollments(data || []);
      } catch (err) {
        console.error('Error fetching student enrollments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const totalEnrolled = enrollments.length;
  const inProgressCourses = enrollments.filter((e) => e.progressPercent < 100);
  const completedCourses = enrollments.filter((e) => e.progressPercent === 100);

  // Recently accessed course is the first one since backend sorts by lastAccessedAt descending
  const continueLearningCourse = inProgressCourses.length > 0 ? inProgressCourses[0] : (enrollments[0] || null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-navy-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to continue expanding your skills today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Keep up your learning momentum. Review lectures, practice coding, and complete your enrolled courses.
          </p>
        </div>

        <Link
          to="/courses"
          className="self-start md:self-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 flex-shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Explore New Courses</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Enrolled Courses</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{totalEnrolled}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Courses In Progress</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{inProgressCourses.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Completed Courses</span>
            <h3 className="text-2xl font-extrabold text-navy-900">{completedCourses.length}</h3>
          </div>
        </div>
      </div>

      {/* Continue Learning Featured Card */}
      {continueLearningCourse && (
        <div className="bg-white rounded-2xl border border-brand-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-4">
            <Play className="w-4 h-4 fill-brand-600" />
            <span>Continue Learning (Pick up where you left off)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="aspect-video md:col-span-1 rounded-xl overflow-hidden bg-slate-100">
              <img
                src={continueLearningCourse.courseThumbnail}
                alt={continueLearningCourse.courseTitle}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                {continueLearningCourse.category}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-navy-900">
                {continueLearningCourse.courseTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Instructor: {continueLearningCourse.instructorName}
              </p>
              <div className="pt-2 max-w-md">
                <ProgressBar progress={continueLearningCourse.progressPercent} size="sm" />
              </div>
            </div>

            <div className="md:col-span-1 flex md:justify-end">
              <Link
                to={`/student/learn/${continueLearningCourse.courseId}`}
                className="w-full md:w-auto px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>Resume Lecture</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-900">My Enrolled Courses</h2>
          <span className="text-xs font-medium text-slate-500">
            {enrollments.length} {enrollments.length === 1 ? 'course' : 'courses'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 h-64 p-4 animate-pulse" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="You haven't enrolled in any courses yet"
            description="Explore our course catalog and enroll in high-caliber tech, design, and AI courses for free."
            action={
              <Link
                to="/courses"
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition inline-block"
              >
                Browse Marketplace
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-slate-100 overflow-hidden">
                  <img
                    src={item.courseThumbnail}
                    alt={item.courseTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-white/95 text-navy-900 rounded-full shadow-sm">
                      {item.category}
                    </span>
                  </div>
                  {item.progressPercent === 100 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-full shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-navy-900 line-clamp-2">
                      {item.courseTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Instructor: <span className="font-medium text-slate-700">{item.instructorName}</span>
                    </p>
                  </div>

                  {/* Progress info */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>{item.completedLessonsCount} of {item.totalLessons} lessons</span>
                      <span className="font-bold text-slate-700">{item.progressPercent}%</span>
                    </div>
                    <ProgressBar progress={item.progressPercent} showLabel={false} size="sm" />

                    <Link
                      to={`/student/learn/${item.courseId}`}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        item.progressPercent === 100
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{item.progressPercent === 100 ? 'Review Course' : 'Continue Learning'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDashboardPage;
