import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Linkedin, Twitter, Youtube, Send, ArrowUp } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Back to top floating button */}
      <div className="absolute right-8 -top-5">
        <button 
          onClick={scrollToTop}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 hover:-translate-y-1 transition-all duration-200"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-500 to-accent-500 text-white">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                AcadVault
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's premium student resource and placement prep platform. Share notes, study materials, and code repositories to learn smarter together.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-2">
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-brand-600 hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Explore</Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-white transition-colors">Upload Notes</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm text-white uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/resources?branch=BTech" className="hover:text-white transition-colors">BTech Study Notes</Link>
              </li>
              <li>
                <Link to="/resources?branch=MCA" className="hover:text-white transition-colors">MCA Core Concepts</Link>
              </li>
              <li>
                <Link to="/resources?branch=Placement" className="hover:text-white transition-colors">Placement Portals</Link>
              </li>
              <li>
                <Link to="/resources?branch=Interview%20Prep" className="hover:text-white transition-colors">Interview Preparation</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h3 className="font-semibold text-sm text-white uppercase tracking-wider mb-4">Newsletter</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Stay updated with new learning material, notes, and placement guides.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 transition-all flex items-center justify-center"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {subscribed && (
              <span className="text-xs text-brand-400 mt-2 block animate-pulse">
                ✓ Successfully subscribed!
              </span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} AcadVault. All rights reserved.</span>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
