import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Heart, Code2, Globe, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Learn<span className="text-brand-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              A modern, scalable online learning marketplace where learners gain practical industry skills and world-class instructors publish impactful education.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Code2 className="w-4 h-4 text-brand-400" />
              <span>Full-Stack MERN Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/courses" className="hover:text-white transition">Course Marketplace</Link>
              </li>
              <li>
                <Link to="/courses?category=Development" className="hover:text-white transition">Web & Software Development</Link>
              </li>
              <li>
                <Link to="/courses?category=Design" className="hover:text-white transition">UI/UX & Product Design</Link>
              </li>
              <li>
                <Link to="/courses?category=Data+Science" className="hover:text-white transition">Data Science & AI</Link>
              </li>
              <li>
                <Link to="/courses?category=DevOps" className="hover:text-white transition">DevOps & Cloud Systems</Link>
              </li>
            </ul>
          </div>

          {/* Community & Roles */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform Roles</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register?role=student" className="hover:text-white transition">Student Enrollment</Link>
              </li>
              <li>
                <Link to="/register?role=teacher" className="hover:text-white transition">Teach on LearnHub</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Instructor Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Admin Moderation</Link>
              </li>
              <li>
                <span className="text-slate-500">100% Free Open Learning</span>
              </li>
            </ul>
          </div>

          {/* Trust & Architecture */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>JWT Authentication & Role RBAC</span>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Express & RESTful API Pipeline</span>
              </p>
              <p className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>React 18 & Tailwind CSS UI</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LearnHub Platform Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with modular monolith architecture for scalable education.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
