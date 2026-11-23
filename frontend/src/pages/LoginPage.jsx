import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_CREDENTIALS } from '../utils/constants';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      // Redirect based on role or prior target location
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-navy-900 tracking-tight">LearnHub</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-navy-900">Welcome back</h2>
          <p className="text-xs text-slate-500">Log in to continue learning, teaching, or moderating</p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-900">⚡ 1-Click Demo Accounts:</span>
            <span className="text-[10px] text-brand-600 font-semibold">Click to autofill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="px-2.5 py-1.5 text-xs font-bold bg-white text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition flex items-center justify-center gap-1 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('teacher')}
              className="px-2.5 py-1.5 text-xs font-bold bg-white text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-100 transition flex items-center justify-center gap-1 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1.5 text-xs font-bold bg-white text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 transition flex items-center justify-center gap-1 shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. alex.rivera@learnhub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                Create free account
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
