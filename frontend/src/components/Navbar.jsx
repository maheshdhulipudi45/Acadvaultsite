import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Bell, LogOut, User as UserIcon, BookOpen, Bookmark, FileUp, Shield, Home, Trophy } from 'lucide-react';
import { userService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, notifications, fetchNotifications } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMarkNotificationsRead = async () => {
    try {
      await userService.markNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white shadow-md shadow-brand-200 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-transparent">
              AcadVault
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-slate-600'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-slate-600'
                }`
              }
            >
              Resources
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-600 ${
                  isActive ? 'text-brand-600' : 'text-slate-600'
                }`
              }
            >
              Leaderboard
            </NavLink>
            {user ? (
              <>
                <NavLink
                  to="/uploads"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-brand-600 ${
                      isActive ? 'text-brand-600' : 'text-slate-600'
                    }`
                  }
                >
                  My Uploads
                </NavLink>
                <NavLink
                  to="/saved"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-brand-600 ${
                      isActive ? 'text-brand-600' : 'text-slate-600'
                    }`
                  }
                >
                  Saved Resources
                </NavLink>
                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `flex items-center gap-1 text-sm font-semibold transition-colors hover:text-amber-600 ${
                        isActive ? 'text-amber-600' : 'text-slate-600'
                      }`
                    }
                  >
                    <Shield className="h-4 w-4" /> Admin
                  </NavLink>
                )}
              </>
            ) : (
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-brand-600 ${
                    isActive ? 'text-brand-600' : 'text-slate-600'
                  }`
                }
              >
                Upload
              </NavLink>
            )}
          </div>

          {/* Desktop Right Side Elements */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Dropdown Container */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      if (!notifDropdownOpen) handleMarkNotificationsRead();
                    }}
                    className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600 rounded-full transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-2 shadow-premium border border-slate-100 ring-1 ring-black/5 z-50">
                      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 pb-2">
                        <span className="font-bold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg transition-colors text-left hover:bg-slate-50 ${
                                !notif.read ? 'bg-slate-50/50' : ''
                              }`}
                            >
                              <span className="font-semibold text-xs text-slate-700">{notif.title}</span>
                              <span className="text-xs text-slate-500">{notif.message}</span>
                              <span className="text-[10px] text-slate-400 mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full border border-slate-100 px-3 py-1.5 hover:bg-slate-50 transition-all hover:border-slate-200"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700">
                    {user.name}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-md shadow-brand-100 hover:from-brand-700 hover:to-brand-800 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen) handleMarkNotificationsRead();
                }}
                className="relative p-2 text-slate-500 rounded-full"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Slide-in Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />

            {/* Drawer Container */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[280px] sm:w-[320px] bg-white shadow-2xl flex flex-col md:hidden border-l border-slate-100"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white shadow-sm transition-transform group-hover:scale-105">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-700 to-accent-600 bg-clip-text text-transparent">
                    AcadVault
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto px-3.5 py-6 space-y-2">
                <NavLink
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Home className="h-4.5 w-4.5" />
                  Home
                </NavLink>

                <NavLink
                  to="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <BookOpen className="h-4.5 w-4.5" />
                  Resources
                </NavLink>

                <NavLink
                  to="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <FileUp className="h-4.5 w-4.5" />
                  Upload
                </NavLink>

                <NavLink
                  to="/leaderboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Trophy className="h-4.5 w-4.5" />
                  Leaderboard
                </NavLink>

                {user ? (
                  <>
                    <div className="border-t border-slate-100 my-4 pt-4">
                      <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Account Info
                      </span>
                    </div>

                    <NavLink
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <UserIcon className="h-4.5 w-4.5" />
                      Profile ({user.name})
                    </NavLink>

                    <NavLink
                      to="/uploads"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <FileUp className="h-4.5 w-4.5 text-slate-400" />
                      My Uploads
                    </NavLink>

                    <NavLink
                      to="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Bookmark className="h-4.5 w-4.5" />
                      Saved Resources
                    </NavLink>

                    {user.role === 'admin' && (
                      <NavLink
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-500 pl-3'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`
                        }
                      >
                        <Shield className="h-4.5 w-4.5 text-amber-500" />
                        Admin Panel
                      </NavLink>
                    )}

                    <div className="border-t border-slate-100 my-4 pt-4">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-650 hover:bg-red-50 transition-all text-left"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-t border-slate-100 my-4 pt-4 space-y-2.5">
                      <NavLink
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-600 pl-3'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`
                        }
                      >
                        <UserIcon className="h-4.5 w-4.5" />
                        Login
                      </NavLink>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex justify-center items-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-sm font-bold text-white shadow hover:from-brand-700 hover:to-brand-800 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
