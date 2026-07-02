import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Sparkles, TrendingUp, Trophy } from 'lucide-react';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await userService.getLeaderboard();
        setUsers(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (rank === 2) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-white text-slate-500 border-slate-150';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      
      {/* 1. Header Card */}
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-tr from-brand-50/40 to-slate-50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Top Contributors System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Leaderboard</h1>
          <p className="text-sm text-slate-550 leading-relaxed">
            Interact with AcadVault by uploading materials and logs to earn points and claim your uploader badge rank.
          </p>
        </div>
      </div>

      {/* 2. Top Three Podiums */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-slate-400 py-6 text-sm">No contributors yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          
          {/* Rank 2 Podium */}
          {/* Rank 2 Podium */}
          {users[1] && (
            <div className="order-2 md:order-1 flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-premium relative md:h-44 justify-center hover:-translate-y-1 transition-transform">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border border-slate-200 bg-slate-100 text-slate-700 text-xs font-bold shadow-sm">
                Rank #2
              </span>
              <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-700 font-extrabold flex items-center justify-center text-lg shadow-sm border border-slate-100">
                {users[1].name ? users[1].name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h4 className="font-bold text-sm text-slate-800 mt-3">{users[1].name || 'Contributor'}</h4>
              <span className="text-[10px] text-slate-400 font-medium">{users[1].college || 'Colleague Campus'}</span>
              <div className="flex items-center gap-1 text-xs text-brand-600 font-bold mt-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{users[1].points || 0} pts</span>
              </div>
            </div>
          )}

          {/* Rank 1 Podium */}
          {users[0] && (
            <div className="order-1 md:order-2 flex flex-col items-center rounded-2xl border-2 border-amber-200 bg-amber-50/25 p-8 text-center shadow-premium relative md:h-52 justify-center hover:-translate-y-1 transition-transform">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border border-amber-300 bg-amber-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1">
                <Trophy className="h-3 w-3 fill-current" /> Champion #1
              </span>
              <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center text-2xl shadow-sm border border-amber-200">
                {users[0].name ? users[0].name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h4 className="font-extrabold text-base text-slate-800 mt-4">{users[0].name || 'Contributor'}</h4>
              <span className="text-[10px] text-slate-500 font-semibold">{users[0].college || 'Colleague Campus'}</span>
              <div className="flex items-center gap-1 text-sm text-amber-600 font-extrabold mt-3">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{users[0].points || 0} pts</span>
              </div>
            </div>
          )}

          {/* Rank 3 Podium */}
          {users[2] && (
            <div className="order-3 flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-premium relative md:h-40 justify-center hover:-translate-y-1 transition-transform">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-bold shadow-sm">
                Rank #3
              </span>
              <div className="h-11 w-11 rounded-2xl bg-orange-50 text-orange-700 font-extrabold flex items-center justify-center text-base shadow-sm border border-orange-100">
                {users[2].name ? users[2].name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h4 className="font-bold text-sm text-slate-800 mt-3">{users[2].name || 'Contributor'}</h4>
              <span className="text-[10px] text-slate-400 font-medium">{users[2].college || 'Colleague Campus'}</span>
              <div className="flex items-center gap-1 text-xs text-brand-600 font-bold mt-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{users[2].points || 0} pts</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. Detailed Rankings List Table */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 font-bold text-slate-850">
          Rankings Standings
        </div>
        
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-50 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5 text-center">Rank</th>
                  <th className="px-6 py-3.5 text-left">Student Name</th>
                  <th className="px-6 py-3.5 text-left hidden sm:table-cell">Uploader Badge</th>
                  <th className="px-6 py-3.5 text-left hidden md:table-cell">College & Stream</th>
                  <th className="px-6 py-3.5 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-500">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold ${getRankBadgeColor(idx + 1)}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-650 font-bold text-xs">
                          {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="rounded-lg bg-brand-50 border border-brand-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-650">
                        {item.badge}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs hidden md:table-cell">
                      <div className="flex flex-col text-slate-500">
                        <span className="line-clamp-1">{item.college || 'AcadVault Contributor'}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{item.branch || 'MCA/BTech'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-800">
                      {item.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Leaderboard;
