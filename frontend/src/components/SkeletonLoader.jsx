
const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white p-6 border border-slate-100 shadow-premium">
            <div className="h-4 w-16 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-24 bg-slate-350 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'slider') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-premium">
            <div className="h-6 w-20 bg-slate-200 rounded mb-3"></div>
            <div className="h-5 w-44 bg-slate-350 rounded mb-2"></div>
            <div className="h-4 w-full bg-slate-200 rounded mb-4"></div>
            <div className="h-10 w-full bg-slate-250 rounded mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-premium flex flex-col justify-between">
          <div>
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-slate-200 rounded-lg"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-6 w-3/4 bg-slate-300 rounded mb-2"></div>
            <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded mb-4"></div>
          </div>
          <div className="border-t border-slate-50 pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-slate-250 rounded-full"></div>
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
              </div>
              <div className="h-4 w-12 bg-slate-200 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-9 bg-slate-250 rounded-xl"></div>
              <div className="h-9 bg-slate-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
