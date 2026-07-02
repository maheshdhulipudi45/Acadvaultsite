import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, School, ShieldAlert, BookOpen } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('BTech');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    const result = await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      college: college.trim(),
      branch,
      year,
      semester,
    });

    if (result.success) {
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      
      {/* Decorative background blur blobs */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl"></div>

      <div className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white/70 backdrop-blur-md p-8 shadow-2xl space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-650 to-accent-500 text-white shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500">Register to start uploading notes and unlock achievements.</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 border border-red-100 text-xs font-semibold text-red-650 flex items-center gap-2 animate-shake">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Full Name</label>
              <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all px-3">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mahesh Dhulipudi"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 px-2.5 py-2.5 text-sm text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Email Address</label>
              <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all px-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 px-2.5 py-2.5 text-sm text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Password</label>
            <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all px-3.5">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full bg-transparent border-none outline-none focus:ring-0 px-2.5 py-2.5 text-sm text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Academic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">College Campus (Optional)</label>
              <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all px-3">
                <School className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g., RV College of Engineering"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 px-2.5 py-2.5 text-sm text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Branch Stream</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="BTech">B.Tech Engineering</option>
                <option value="MCA">MCA Computer Applications</option>
                <option value="Placement">Placement Guides</option>
                <option value="Interview Prep">Interview Preparation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Sem</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="1">Sem 1</option>
                  <option value="2">Sem 2</option>
                  <option value="3">Sem 3</option>
                  <option value="4">Sem 4</option>
                  <option value="5">Sem 5</option>
                  <option value="6">Sem 6</option>
                  <option value="7">Sem 7</option>
                  <option value="8">Sem 8</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-850 text-white py-3 text-sm font-bold shadow-md shadow-brand-100 disabled:opacity-50 transition-all mt-4"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        {/* Toggle sign in link */}
        <div className="text-center pt-2 text-xs text-slate-450 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-650 hover:text-brand-750">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
