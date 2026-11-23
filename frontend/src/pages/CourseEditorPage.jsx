import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  Layers, 
  Video, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { courseService } from '../services/courseService';
import { CATEGORIES, LEVELS } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';

const CourseEditorPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Course Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [level, setLevel] = useState('Beginner');
  const [thumbnail, setThumbnail] = useState('');
  const [learningObjectives, setLearningObjectives] = useState(['']);
  const [requirements, setRequirements] = useState(['']);
  const [sections, setSections] = useState([
    {
      title: 'Introduction',
      order: 1,
      lessons: [
        {
          title: 'Course Overview & Setup',
          description: 'A brief intro to this curriculum and what we will build.',
          videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
          duration: '10 min',
          order: 1
        }
      ]
    }
  ]);
  const [status, setStatus] = useState('draft');
  const [rejectionReason, setRejectionReason] = useState('');

  // Load existing course if editing
  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const course = await courseService.getCourseById(id);
          setTitle(course.title || '');
          setDescription(course.description || '');
          setCategory(course.category || 'Development');
          setLevel(course.level || 'Beginner');
          setThumbnail(course.thumbnail || '');
          setLearningObjectives(course.learningObjectives?.length ? course.learningObjectives : ['']);
          setRequirements(course.requirements?.length ? course.requirements : ['']);
          setSections(course.sections?.length ? course.sections : []);
          setStatus(course.status || 'draft');
          setRejectionReason(course.rejectionReason || '');
        } catch (err) {
          setError('Failed to load course details for editing: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isEditing]);

  // Objectives handlers
  const handleAddObjective = () => setLearningObjectives([...learningObjectives, '']);
  const handleObjectiveChange = (index, val) => {
    const updated = [...learningObjectives];
    updated[index] = val;
    setLearningObjectives(updated);
  };
  const handleRemoveObjective = (index) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  // Requirements handlers
  const handleAddRequirement = () => setRequirements([...requirements, '']);
  const handleRequirementChange = (index, val) => {
    const updated = [...requirements];
    updated[index] = val;
    setRequirements(updated);
  };
  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  // Section handlers
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}`,
        order: sections.length + 1,
        lessons: []
      }
    ]);
  };

  const handleSectionTitleChange = (sIdx, newTitle) => {
    const updated = [...sections];
    updated[sIdx].title = newTitle;
    setSections(updated);
  };

  const handleRemoveSection = (sIdx) => {
    if (sections.length <= 1) {
      alert('Course must have at least one section');
      return;
    }
    setSections(sections.filter((_, i) => i !== sIdx));
  };

  // Lesson handlers
  const handleAddLesson = (sIdx) => {
    const updated = [...sections];
    const currentLessons = updated[sIdx].lessons || [];
    currentLessons.push({
      title: `Lesson ${currentLessons.length + 1}`,
      description: '',
      videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk',
      duration: '10 min',
      order: currentLessons.length + 1
    });
    updated[sIdx].lessons = currentLessons;
    setSections(updated);
  };

  const handleLessonChange = (sIdx, lIdx, field, val) => {
    const updated = [...sections];
    updated[sIdx].lessons[lIdx][field] = val;
    setSections(updated);
  };

  const handleRemoveLesson = (sIdx, lIdx) => {
    const updated = [...sections];
    updated[sIdx].lessons = updated[sIdx].lessons.filter((_, i) => i !== lIdx);
    setSections(updated);
  };

  // Save / Update Draft
  const handleSave = async (submitAfterSave = false) => {
    setError('');
    setSuccessMsg('');

    if (!title.trim() || !description.trim() || !category) {
      setError('Please provide course title, description, and category.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level,
      thumbnail: thumbnail.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      learningObjectives: learningObjectives.filter((o) => o.trim().length > 0),
      requirements: requirements.filter((r) => r.trim().length > 0),
      sections
    };

    setSaving(true);
    try {
      let savedCourse;
      if (isEditing) {
        savedCourse = await courseService.updateCourse(id, payload);
      } else {
        savedCourse = await courseService.createCourse(payload);
      }

      if (submitAfterSave) {
        await courseService.submitCourse(savedCourse._id);
        setSuccessMsg('Course submitted successfully for administrative review!');
        setTimeout(() => navigate('/teacher/dashboard'), 1500);
      } else {
        setSuccessMsg('Course saved successfully as draft!');
        if (!isEditing) {
          navigate(`/teacher/courses/${savedCourse._id}/edit`, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading course editor...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/teacher/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                {isEditing ? 'Edit Course Curriculum' : 'Create New Course'}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft your modules, customize lesson video links, and submit for student access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {status === 'rejected' && rejectionReason && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Admin Review Feedback:</span>
          </p>
          <p className="pl-5 leading-relaxed">{rejectionReason}</p>
        </div>
      )}

      {/* Basic Course Information */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3">
          1. Basic Course Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Full-Stack React & Node.js"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Provide a comprehensive summary of what students will accomplish in this course..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Course Thumbnail Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Provide an image URL (Unsplash or direct image link). A high-resolution default image is used if left blank.
            </p>
          </div>
        </div>
      </div>

      {/* Learning Objectives & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Objectives */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-900">Learning Objectives</h3>
            <button
              type="button"
              onClick={handleAddObjective}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Build full-stack apps with React & Node"
                  value={obj}
                  onChange={(e) => handleObjectiveChange(i, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(i)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-900">Prerequisites / Requirements</h3>
            <button
              type="button"
              onClick={handleAddRequirement}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Basic understanding of JavaScript"
                  value={req}
                  onChange={(e) => handleRequirementChange(i, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(i)}
                  className="p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Curriculum Builder (Sections & Lessons) */}
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-navy-900">2. Course Curriculum Builder</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Organize educational lectures into sections with video links and descriptions.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddSection}
            className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((section, sIdx) => (
            <div
              key={sIdx}
              className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-slate-400">#{sIdx + 1}</span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                    placeholder="Section Title"
                    className="font-bold text-sm bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-full max-w-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddLesson(sIdx)}
                    className="px-2.5 py-1 text-xs font-bold text-brand-600 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(sIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lessons inside Section */}
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-brand-200">
                {section.lessons && section.lessons.length > 0 ? (
                  section.lessons.map((lesson, lIdx) => (
                    <div
                      key={lIdx}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <Video className="w-4 h-4 text-brand-600 flex-shrink-0" />
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(sIdx, lIdx, 'title', e.target.value)}
                            placeholder="Lesson Title"
                            className="font-semibold text-xs text-navy-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-full focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={lesson.duration || '10 min'}
                            onChange={(e) => handleLessonChange(sIdx, lIdx, 'duration', e.target.value)}
                            placeholder="e.g. 15 min"
                            className="w-20 text-[11px] text-center bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLesson(sIdx, lIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Remove Lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={lesson.videoUrl || ''}
                          onChange={(e) => handleLessonChange(sIdx, lIdx, 'videoUrl', e.target.value)}
                          placeholder="Video URL (e.g. https://www.youtube.com/embed/...)"
                          className="text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-full focus:outline-none"
                        />
                        <input
                          type="text"
                          value={lesson.description || ''}
                          onChange={(e) => handleLessonChange(sIdx, lIdx, 'description', e.target.value)}
                          placeholder="Short summary of this lecture..."
                          className="text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-full focus:outline-none"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-3 bg-white rounded-lg border border-slate-200">
                    No lessons in this section yet. Click "Add Lesson" above to add your first lecture.
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CourseEditorPage;
