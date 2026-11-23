import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  BookOpen, 
  AlertCircle, 
  Play, 
  Archive,
  ExternalLink
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { courseService } from '../services/courseService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchModerationQueue = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPendingCourses();
      setCourses(data || []);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to fetch queue' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const handleOpenPreview = (course) => {
    setSelectedCourse(course);
    setPreviewModalOpen(true);
  };

  const handleApprove = async (courseId) => {
    if (!window.confirm('Approve and publish this course to the public marketplace?')) return;
    setActionLoading(true);
    try {
      await adminService.approveCourse(courseId);
      setFeedback({ type: 'success', text: 'Course approved and published successfully!' });
      setPreviewModalOpen(false);
      await fetchModerationQueue();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Approval failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (course) => {
    setSelectedCourse(course);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setActionLoading(true);
    try {
      await adminService.rejectCourse(selectedCourse._id, rejectionReason.trim());
      setFeedback({ type: 'success', text: 'Course returned with rejection feedback.' });
      setRejectModalOpen(false);
      setPreviewModalOpen(false);
      await fetchModerationQueue();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Rejection failed' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Course Moderation Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review educational submissions, verify curriculum quality, and approve or request revisions.
        </p>
      </div>

      {/* Feedback banner */}
      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback({ type: '', text: '' })}
            className="font-bold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-base text-navy-900">Submitted Courses Awaiting Review</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            {courses.length} pending
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading queue...</div>
        ) : courses.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CheckCircle}
              title="All courses are moderated"
              description="There are currently no courses pending administrative approval. New submissions by instructors will appear here automatically."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Course Title</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/60 transition">
                    
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-12 h-8 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-navy-900 line-clamp-1">{course.title}</p>
                          <span className="text-[11px] text-slate-400">
                            {course.sections?.length || 0} sections • {course.level}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800">{course.instructorId?.name}</p>
                      <p className="text-[11px] text-slate-400">{course.instructorId?.email}</p>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {course.category}
                    </td>

                    <td className="py-4 px-4 text-slate-500">
                      {new Date(course.updatedAt || course.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenPreview(course)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => handleApprove(course._id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenReject(course)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedCourse && (
        <Modal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={`Course Inspection: ${selectedCourse.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                className="w-20 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-900 text-sm">{selectedCourse.title}</span>
                  <StatusBadge status={selectedCourse.status} />
                </div>
                <p className="text-slate-500">
                  Instructor: <span className="font-bold text-slate-700">{selectedCourse.instructorId?.name}</span> ({selectedCourse.instructorId?.email})
                </p>
                <p className="text-slate-500">
                  Category: <span className="font-medium text-slate-700">{selectedCourse.category}</span> • Level: {selectedCourse.level}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-navy-900 mb-1">Description:</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedCourse.description}
              </p>
            </div>

            {/* Curriculum breakdown */}
            <div>
              <h4 className="font-bold text-navy-900 mb-2">Curriculum Breakdown:</h4>
              <div className="space-y-2">
                {selectedCourse.sections?.map((sec, sIdx) => (
                  <div key={sIdx} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <p className="font-bold text-navy-900">{sec.title}</p>
                    <div className="mt-2 space-y-1 pl-3">
                      {sec.lessons?.map((les, lIdx) => (
                        <div key={lIdx} className="flex items-center justify-between text-slate-600">
                          <span className="truncate">• {les.title}</span>
                          <span className="text-[10px] text-slate-400">{les.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleOpenReject(selectedCourse)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold"
              >
                Reject with Feedback
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedCourse._id)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                Approve & Publish
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {selectedCourse && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Course: ${selectedCourse.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Provide constructive feedback for the teacher explaining why this course was returned. The teacher will be able to review this message and re-submit after addressing the issues.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Rejection Reason / Guidance
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please add at least 3 detailed lessons in Section 2 with functioning video URLs and clear learning objectives."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default AdminCoursesPage;
