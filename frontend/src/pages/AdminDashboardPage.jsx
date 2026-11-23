import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckSquare, 
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { adminService } from '../services/adminService';
import StatusBadge from '../components/StatusBadge';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentPending, setRecentPending] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const data = await adminService.getDashboard();
        setStats(data.stats);
        setRecentPending(data.recentPending || []);
        setRecentUsers(data.recentUsers || []);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, user verification, and course moderation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/courses"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Moderation Queue ({stats?.pendingCourses || 0})</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Students</span>
          <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{stats?.totalStudents || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Instructors</span>
          <h3 className="text-2xl font-extrabold text-brand-600 mt-1">{stats?.totalTeachers || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Courses</span>
          <h3 className="text-2xl font-extrabold text-navy-900 mt-1">{stats?.totalCourses || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Published</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.publishedCourses || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Pending Review</span>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.pendingCourses || 0}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500">Total Enrollments</span>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{stats?.totalEnrollments || 0}</h3>
        </div>

      </div>

      {/* Two Columns: Moderation Queue & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Courses Pending Review */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h2 className="font-bold text-sm sm:text-base text-navy-900">
                  Courses Awaiting Moderation
                </h2>
              </div>
              <Link
                to="/admin/courses"
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                View all →
              </Link>
            </div>

            <div className="p-5">
              {loading ? (
                <p className="text-xs text-slate-400">Loading pending courses...</p>
              ) : recentPending.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-navy-900">Queue is clear</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No submitted courses are pending administrative approval.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentPending.map((course) => (
                    <div key={course._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-navy-900 truncate">{course.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          By: {course.instructorId?.name || 'Instructor'} • Category: {course.category}
                        </p>
                      </div>
                      <Link
                        to="/admin/courses"
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex-shrink-0"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Link
              to="/admin/courses"
              className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
            >
              <span>Go to Full Moderation Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recently Registered Users */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <h2 className="font-bold text-sm sm:text-base text-navy-900">
                  Recently Registered Users
                </h2>
              </div>
              <Link
                to="/admin/users"
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                Manage users →
              </Link>
            </div>

            <div className="p-5">
              {loading ? (
                <p className="text-xs text-slate-400">Loading user records...</p>
              ) : recentUsers.length === 0 ? (
                <p className="text-xs text-slate-500">No users found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentUsers.map((u) => (
                    <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-navy-900 border border-slate-200 flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                        <StatusBadge status={u.accountStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Link
              to="/admin/users"
              className="w-full py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
            >
              <span>Open User Management Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboardPage;
