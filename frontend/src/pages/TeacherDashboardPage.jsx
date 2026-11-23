import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  BookOpen, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Send, 
  Trash2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { teacherService } from '../services/teacherService';
import { courseService } from '../services/courseService';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

const TeacherDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const data = await teacherService.getDashboard();
      setStats(data.stats);
      setCourses(data.recentCourses || []);
    } catch (err) {
      console.error('Error fetching teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSubmitForReview = async (courseId) => {
    if (!window.confirm('Submit this course for administrative review?')) return;
    setSubmittingId(courseId);
    try {
      await courseService.submitCourse(courseId);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Submission failed');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      await courseService.deleteCourse(courseId);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Instructor Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build educational content, manage your curricula, and track student enrollment.
          </p>
        </div>

        <Link
          to="/teacher/courses/new"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Course</span>
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Courses</span>
            <BookOpen className="w-4 h-4 text-brand-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-navy-900 mt-2">
            {stats?.totalCourses || 0}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Published</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {stats?.publishedCourses || 0}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Under Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">
            {stats?.pendingCourses || 0}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Enrollments</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-navy-900 mt-2">
            {stats?.totalEnrollments || 0}
          </h3>
        </div>
      </div>

      {/* Courses Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-navy-900">Your Educational Courses</h2>
          <span className="text-xs text-slate-500">{courses.length} courses listed</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={BookOpen}
              title="No courses created yet"
              description="Start by structuring your first course with lessons, learning objectives, and curriculum sections."
              action={
                <Link
                  to="/teacher/courses/new"
                  className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition inline-block"
                >
                  Create Course
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Course</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Enrollments</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {courses.map((course) => {
                  const isDraft = course.status === 'draft';
                  const isRejected = course.status === 'rejected';

                  return (
                    <tr key={course._id} className="hover:bg-slate-50/60 transition">
                      
                      {/* Course Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                          />
                          <div>
                            <Link
                              to={`/courses/${course._id}`}
                              className="font-bold text-navy-900 hover:text-brand-600 transition line-clamp-1"
                            >
                              {course.title}
                            </Link>
                            <p className="text-[11px] text-slate-400">
                              {course.sections?.length || 0} sections • {course.level}
                            </p>
                            {/* Rejection Note if applicable */}
                            {isRejected && course.rejectionReason && (
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Rejection feedback: {course.rejectionReason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {course.category}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={course.status} />
                      </td>

                      {/* Enrollments */}
                      <td className="py-4 px-4 text-slate-700 font-semibold">
                        {course.enrollmentCount || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Submit for Review (if draft or rejected) */}
                          {(isDraft || isRejected) && (
                            <button
                              onClick={() => handleSubmitForReview(course._id)}
                              disabled={submittingId === course._id}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              title="Submit for Admin Approval"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          )}

                          {/* Edit Course */}
                          <Link
                            to={`/teacher/courses/${course._id}/edit`}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition"
                            title="Edit Curriculum & Details"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Delete Course (if not published) */}
                          {(isDraft || isRejected) && (
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Course"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Preview */}
                          <Link
                            to={`/courses/${course._id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Preview Course"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherDashboardPage;
