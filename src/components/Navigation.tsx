import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Leaf, Menu, X, User, LogOut, PlusCircle, LayoutDashboard, Search, MessageSquare, Phone } from "lucide-react";

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `inline-flex items-center px-3 py-1 border-b-2 text-xs font-semibold transition-colors duration-200 ${
      isActive(path)
        ? "border-emerald-600 text-emerald-900 bg-emerald-50/40"
        : "border-transparent text-slate-500 hover:text-emerald-800 hover:border-slate-300"
    }`;

  const mobileLinkClass = (path: string) =>
    `block pl-3 pr-4 py-2 border-l-4 text-sm font-semibold transition-colors duration-150 ${
      isActive(path)
        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
        : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-emerald-800"
    }`;

  const roleLabels: Record<string, string> = {
    donor: "Donor",
    ngo: "NGO",
    volunteer: "Volunteer",
    admin: "Admin",
  };

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
              <Leaf className="h-5 w-5 text-emerald-600" />
              <span className="font-bold text-base tracking-tight text-slate-900">
                Food<span className="text-emerald-600">Share</span>
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-3 items-stretch">
              <Link to="/" className={linkClass("/")}>
                Home
              </Link>
              <Link to="/listings" className={linkClass("/listings")}>
                Browse Food
              </Link>
              <Link to="/contact" className={linkClass("/contact")}>
                Contact
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" className={linkClass("/dashboard")}>
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                    Dashboard
                  </Link>

                  {user.role === "donor" && (
                    <Link to="/donate" className={linkClass("/donate")}>
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Donate Food
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link to="/admin/messages" className={linkClass("/admin/messages")}>
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Inquiries
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* User Section (Desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-xs text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
                >
                  {user.avatar ? (
                    <span className="text-lg">{user.avatar}</span>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold uppercase border border-emerald-100 text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left leading-none">
                    <div className="text-[9px] text-slate-400 capitalize tracking-wider font-bold mb-0.5">{roleLabels[user.role]}</div>
                    <div className="text-xs text-slate-800">{user.name}</div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-md text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer transition-all duration-150"
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  state={{ mode: "login" }}
                  className="text-xs font-bold text-slate-600 hover:text-emerald-600 px-2.5 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  state={{ mode: "register" }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger (Mobile Toggle) */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white transition duration-200">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass("/")}>
              Home
            </Link>
            <Link to="/listings" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass("/listings")}>
              Browse Food
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass("/contact")}>
              Contact
            </Link>

            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass("/dashboard")}>
                  Dashboard
                </Link>

                {user.role === "donor" && (
                  <Link to="/donate" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass("/donate")}>
                    Donate Food
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link to="/admin/messages" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass("/admin/messages")}>
                    Admin Inquiries
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile User Panel */}
          <div className="pt-4 pb-4 border-t border-gray-200 bg-gray-50/50">
            {user ? (
              <div className="px-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold uppercase">
                    {user.avatar || user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-800">{user.name}</div>
                    <div className="text-xs font-medium text-emerald-600 capitalize">{roleLabels[user.role]}</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 px-4 border border-emerald-600 text-sm font-semibold rounded-lg text-emerald-700 bg-white hover:bg-emerald-50 transition"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 px-4 border border-gray-300 text-sm font-semibold rounded-lg text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-2">
                <Link
                  to="/auth"
                  state={{ mode: "login" }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 px-4 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  state={{ mode: "register" }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
