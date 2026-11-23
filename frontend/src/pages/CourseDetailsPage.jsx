import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Edit,
  AlertCircle
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isTeacher, isAdmin } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);

        // Open all sections by default
        if (data.sections) {
          const initialExpanded = {};
          data.sections.forEach((_, index) => {
            initialExpanded[index] = true;
          });
          setExpandedSections(initialExpanded);
        }

        // If user is authenticated as student or user, check enrollment
        if (isAuthenticated) {
          try {
            const enrollRes = await enrollmentService.getCourseEnrollment(id);
            if (enrollRes.isEnrolled) {
              setIsEnrolled(true);
              setEnrollmentData(enrollRes.enrollment);
            }
          } catch (e) {
            // Not enrolled
            setIsEnrolled(false);
          }
        }
      } catch (err) {
        setError(err.message || 'Course not found or access restricted.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated]);

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentService.enroll(course._id);
      setIsEnrolled(true);
      // Navigate straight to the learning player
      navigate(`/student/learn/${course._id}`);
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading course curriculum...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Unable to load course</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link
          to="/courses"
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition"
        >
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  const totalLessons = course.sections
    ? course.sections.reduce((acc, sec) => acc + (sec.lessons ? sec.lessons.length : 0), 0)
    : 0;

  const isOwner = user && course.instructorId && user._id === (course.instructorId._id || course.instructorId);

  return (
    <div className="pb-20">
      
      {/* Course Hero Banner */}
      <section className="bg-navy-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left 2 Cols: Course Overview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 text-xs font-semibold bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30">
                  {course.category}
                </span>
                <span className="px-3 py-1 text-xs font-semibold bg-slate-800 text-slate-300 rounded-full">
                  {course.level}
                </span>
                <StatusBadge status={course.status} />
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.description}
              </p>

              {/* Meta stats */}
              <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-400" />
                  <span>{course.sections?.length || 0} Sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-brand-400" />
                  <span>{totalLessons} Video Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-400" />
                  <span>{course.enrollmentCount || 0} Students Enrolled</span>
                </div>
              </div>

              {/* Instructor badge */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <img
                  src={course.instructorId?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorId?.name || 'Instructor')}&background=4f46e5&color=fff`}
                  alt={course.instructorId?.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="text-xs text-slate-400">Created by</p>
                  <p className="text-sm font-bold text-white">{course.instructorId?.name || 'LearnHub Instructor'}</p>
                </div>
              </div>
            </div>

            {/* Right Card: Sticky Enrollment Card */}
            <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-xl space-y-5 lg:-mb-24 relative z-10">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 relative group">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-navy-900/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-navy-900">Free</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Full Lifetime Access
                </span>
              </div>

              {/* Action Button */}
              {isEnrolled ? (
                <Link
                  to={`/student/learn/${course._id}`}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Continue Learning ({enrollmentData?.progressPercent || 0}%)</span>
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                >
                  {enrolling ? (
                    <span>Enrolling...</span>
                  ) : (
                    <>
                      <span>Enroll in Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {/* Teacher or Admin controls */}
              {isOwner && (
                <Link
                  to={`/teacher/courses/${course._id}/edit`}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Curriculum & Info</span>
                </Link>
              )}

              <div className="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>On-demand streaming video lessons</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Interactive lesson progress tracking</span>
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Access on mobile, tablet, and desktop</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Body: Objectives, Requirements, Curriculum, Instructor Bio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            
            {/* Learning Objectives */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                  <span>What You Will Learn</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-navy-900">Course Curriculum</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.sections?.length || 0} sections • {totalLessons} lectures
                  </p>
                </div>
              </div>

              {/* Sections Accordion */}
              <div className="space-y-3">
                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section, sIdx) => {
                    const isExpanded = !!expandedSections[sIdx];
                    return (
                      <div
                        key={sIdx}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => toggleSection(sIdx)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/60 text-left transition"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="font-bold text-sm text-navy-900">{section.title}</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {section.lessons?.length || 0} lessons
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="divide-y divide-slate-100 p-2">
                            {section.lessons && section.lessons.length > 0 ? (
                              section.lessons.map((lesson, lIdx) => (
                                <div
                                  key={lesson._id || lIdx}
                                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                                      <Play className="w-3 h-3 fill-brand-600" />
                                    </div>
                                    <span className="font-medium text-slate-800">{lesson.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{lesson.duration || '10 min'}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 p-3 italic">No lessons in this section yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-white rounded-xl border border-slate-200">
                    Curriculum outline is being finalized by the instructor.
                  </p>
                )}
              </div>
            </div>

            {/* Course Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-lg font-bold text-navy-900">Requirements</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  {course.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Bio Card */}
            {course.instructorId && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-navy-900">Meet Your Instructor</h3>
                <div className="flex items-start gap-4">
                  <img
                    src={course.instructorId.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorId.name)}&background=4f46e5&color=fff`}
                    alt={course.instructorId.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-navy-900">{course.instructorId.name}</h4>
                    <p className="text-xs font-semibold text-brand-600">{course.instructorId.headline || 'Industry Expert & Instructor'}</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {course.instructorId.bio || 'Passionate about delivering high-caliber educational content and mentoring the next generation of engineers and creators.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right column empty space for desktop offset */}
          <div className="hidden lg:block"></div>

        </div>
      </div>

    </div>
  );
};

export default CourseDetailsPage;
