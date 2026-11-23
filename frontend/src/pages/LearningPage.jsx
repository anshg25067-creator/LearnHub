import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Menu, 
  X,
  Clock,
  Award,
  ExternalLink
} from 'lucide-react';
import { enrollmentService } from '../services/enrollmentService';
import ProgressBar from '../components/ProgressBar';

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');

  // Flattened lessons list for previous/next navigation
  const [allLessons, setAllLessons] = useState([]);

  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await enrollmentService.getCourseEnrollment(courseId);
        setCourse(data.course);
        setEnrollment(data.enrollment);
        setCompletedLessonIds(data.enrollment.completedLessonIds || []);
        setProgressPercent(data.enrollment.progressPercent || 0);

        // Flatten all lessons
        const flattened = [];
        if (data.course.sections) {
          data.course.sections.forEach((sec, sIdx) => {
            if (sec.lessons) {
              sec.lessons.forEach((les, lIdx) => {
                flattened.push({
                  ...les,
                  sectionTitle: sec.title,
                  sectionIndex: sIdx,
                  lessonIndex: lIdx
                });
              });
            }
          });
        }
        setAllLessons(flattened);

        // Find initial active lesson: lastAccessedLessonId or first lesson
        let active = null;
        if (data.enrollment.lastAccessedLessonId) {
          active = flattened.find((l) => l._id.toString() === data.enrollment.lastAccessedLessonId);
        }
        if (!active && flattened.length > 0) {
          active = flattened[0];
        }

        if (active) {
          setCurrentLesson(active);
          setCurrentSectionIndex(active.sectionIndex);
          setCurrentLessonIndex(active.lessonIndex);
        }
      } catch (err) {
        setError(err.message || 'Access restricted. Please enroll in this course first.');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId]);

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setCurrentSectionIndex(lesson.sectionIndex);
    setCurrentLessonIndex(lesson.lessonIndex);
    setSidebarOpen(false); // close drawer on mobile

    // Save as last accessed lesson
    enrollmentService.updateProgress(courseId, lesson._id, isCompleted(lesson._id)).catch(() => {});
  };

  const isCompleted = (lessonId) => {
    if (!lessonId) return false;
    return completedLessonIds.includes(lessonId.toString());
  };

  const handleToggleComplete = async () => {
    if (!currentLesson || updating) return;

    const currentStatus = isCompleted(currentLesson._id);
    const newStatus = !currentStatus;

    setUpdating(true);
    try {
      const res = await enrollmentService.updateProgress(
        courseId,
        currentLesson._id,
        newStatus
      );

      setCompletedLessonIds(res.completedLessonIds);
      setProgressPercent(res.progressPercent);

      // Auto-advance to next lesson if user just completed current lesson and next lesson exists
      if (newStatus) {
        const currentIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
        if (currentIndex < allLessons.length - 1) {
          selectLesson(allLessons[currentIndex + 1]);
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrevLesson = () => {
    if (!currentLesson) return;
    const currentIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
    if (currentIndex > 0) {
      selectLesson(allLessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = allLessons.findIndex((l) => l._id === currentLesson._id);
    if (currentIndex < allLessons.length - 1) {
      selectLesson(allLessons[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400">Loading learning environment...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md text-center shadow-sm space-y-4">
          <BookOpen className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-navy-900">Course Enrollment Required</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to={`/courses/${courseId}`}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700"
            >
              Enroll Now (Free)
            </Link>
            <Link
              to="/student/dashboard"
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = currentLesson ? allLessons.findIndex((l) => l._id === currentLesson._id) : 0;
  const isLessonComplete = currentLesson ? isCompleted(currentLesson._id) : false;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      
      {/* Top Header Bar */}
      <header className="bg-navy-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/student/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Return to Student Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-md">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {currentLesson?.sectionTitle || 'Course Curriculum'}
            </p>
          </div>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs font-bold text-brand-400">
              {progressPercent}% Completed
            </span>
            <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Workspace (Player + Curriculum) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left: Video Player & Lecture Notes */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Responsive Video Container */}
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
            {currentLesson?.videoUrl ? (
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Play className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">Lesson Video Player</p>
                <p className="text-xs mt-1 max-w-sm">
                  Instructor will publish updated media for this lecture soon.
                </p>
              </div>
            )}
          </div>

          {/* Action Bar (Mark Complete, Prev, Next) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900 border border-slate-800">
            {/* Complete Toggle */}
            <button
              onClick={handleToggleComplete}
              disabled={updating}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                isLessonComplete
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
              }`}
            >
              {isLessonComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed (Click to undo)</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Mark Lesson as Completed</span>
                </>
              )}
            </button>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrevLesson}
                disabled={currentIndex === 0}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 transition flex items-center justify-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNextLesson}
                disabled={currentIndex >= allLessons.length - 1}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 transition flex items-center justify-center gap-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lesson Details & Overview */}
          {currentLesson && (
            <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Lecture {currentIndex + 1} of {allLessons.length}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentLesson.duration || '10 min'}</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {currentLesson.description || 'Follow along with the instructional material provided in this lesson.'}
              </p>
            </div>
          )}

        </main>

        {/* Right Sidebar: Course Curriculum Navigation */}
        <aside
          className={`fixed lg:static top-14 bottom-0 right-0 z-20 w-80 bg-navy-900 border-l border-slate-800 flex flex-col transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Curriculum Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Course Content</span>
            </h3>
            <span className="text-xs text-slate-400">
              {completedLessonIds.length}/{allLessons.length} done
            </span>
          </div>

          {/* Curriculum Accordion List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {course.sections && course.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1.5">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>

                <div className="space-y-1">
                  {section.lessons && section.lessons.map((lesson, lIdx) => {
                    const isCurrent = currentLesson?._id === lesson._id;
                    const done = isCompleted(lesson._id);

                    return (
                      <button
                        key={lesson._id || lIdx}
                        onClick={() =>
                          selectLesson({
                            ...lesson,
                            sectionTitle: section.title,
                            sectionIndex: sIdx,
                            lessonIndex: lIdx
                          })
                        }
                        className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between gap-3 transition ${
                          isCurrent
                            ? 'bg-brand-600/30 text-white border border-brand-500/50'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          )}
                          <span className={`truncate ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                            {lesson.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">
                          {lesson.duration || '10 min'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

      </div>

    </div>
  );
};

export default LearningPage;
