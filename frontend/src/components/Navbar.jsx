import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  User, 
  LogOut, 
  BookOpen, 
  LayoutDashboard, 
  ShieldCheck, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isTeacher, isAdmin, isStudent, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-navy-900 group-hover:text-brand-600 transition">
                Learn<span className="text-brand-600">Hub</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                Academy
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="What do you want to learn today? (e.g. React, Python...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
            />
          </form>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/courses" 
              className={`text-sm font-medium transition ${
                location.pathname === '/courses' ? 'text-brand-600' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Explore Courses
            </Link>

            {/* Instructor links */}
            {!isAuthenticated && (
              <Link 
                to="/register?role=teacher" 
                className="text-sm font-medium text-slate-600 hover:text-navy-900 transition"
              >
                Become an Instructor
              </Link>
            )}

            {isAuthenticated && isTeacher && (
              <Link 
                to="/teacher/dashboard" 
                className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                Instructor Dashboard
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link 
                to="/admin/dashboard" 
                className="text-sm font-medium text-rose-700 hover:text-rose-800 flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            {isAuthenticated && isStudent && (
              <Link 
                to="/student/dashboard" 
                className="text-sm font-medium text-brand-700 hover:text-brand-800 flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200"
              >
                <BookOpen className="w-4 h-4" />
                My Learning
              </Link>
            )}
          </div>

          {/* User Auth Buttons / Profile Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
                >
                  <img
                    src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-navy-900 truncate max-w-[120px]">{user.name}</p>
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">{user.role}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-navy-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    {isStudent && (
                      <Link
                        to="/student/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                      >
                        <BookOpen className="w-4 h-4" />
                        Student Dashboard
                      </Link>
                    )}

                    {isTeacher && (
                      <>
                        <Link
                          to="/teacher/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Teacher Dashboard
                        </Link>
                        <Link
                          to="/teacher/courses/new"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <BookOpen className="w-4 h-4" />
                          Create New Course
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-navy-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative px-2">
              <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </form>

            <div className="flex flex-col space-y-2 px-2 pt-2">
              <Link
                to="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Explore Courses
              </Link>

              {isAuthenticated ? (
                <>
                  {isStudent && (
                    <Link
                      to="/student/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg"
                    >
                      My Learning Dashboard
                    </Link>
                  )}
                  {isTeacher && (
                    <Link
                      to="/teacher/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg"
                    >
                      Instructor Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    Log out ({user.name})
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
