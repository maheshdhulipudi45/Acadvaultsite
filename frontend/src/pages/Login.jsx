import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, BookOpen } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email.trim(), password);

    if (result.success) {
      // Check if redirect chain target exists
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
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl"></div>

      <div className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white/70 backdrop-blur-md p-8 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-650 to-accent-500 text-white shadow-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to download materials and earn points.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 p-3.5 border border-red-100 text-xs font-semibold text-red-650 flex items-center gap-2 animate-shake">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Email Address</label>
            <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all px-3.5">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@college.edu"
                className="w-full bg-transparent border-none outline-none focus:ring-0 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-450 mb-1.5">Password</label>
            <div className="relative flex items-center rounded-xl bg-slate-50 border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all px-3.5">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-none focus:ring-0 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-850 text-white py-3 text-sm font-bold shadow-md shadow-brand-100 disabled:opacity-50 transition-all"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Toggle option */}
        <div className="text-center pt-2 text-xs text-slate-450 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-brand-650 hover:text-brand-750">
            Create an Account
          </Link>
        </div>

        {/* Demo login tags */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left space-y-2">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Developer / Demo Accounts:</span>
          <div className="text-[11px] text-slate-500 space-y-1">
            <p><span className="font-semibold text-slate-750">Admin:</span> admin@acadvault.com / adminpassword123</p>
            <p><span className="font-semibold text-slate-750">Student:</span> Create a new one via Sign Up</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
