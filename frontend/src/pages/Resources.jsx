import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resourceService, SERVER_URL } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import PreviewModal from '../components/PreviewModal';
import ReportModal from '../components/ReportModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { Search, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResources, setTotalResources] = useState(0);

  // Search & Auto-suggestions
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const popularSuggestions = ['DBMS Notes', 'MCA Java', 'Placement PDF', 'Interview Questions', 'React Course', 'DSA Playlist'];

  // Sidebar filters state
  const [stream, setStream] = useState(searchParams.get('branch') || 'All'); // BTech, MCA, Placement, etc.
  const [sharingFormat, setSharingFormat] = useState(searchParams.get('resourceType') || 'All'); // PDF, YouTube, etc.
  const [verification, setVerification] = useState(searchParams.get('isVerified') === 'true' ? 'Verified Only' : 'All Resources');
  const [semester, setSemester] = useState(searchParams.get('semester') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'Newest Uploads');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [previewResource, setPreviewResource] = useState(null);
  const [reportResource, setReportResource] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle URL changes & fetching
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const queryParams = {
          search: searchParams.get('search') || '',
          branch: searchParams.get('branch') || 'All',
          resourceType: searchParams.get('resourceType') || 'All',
          isVerified: searchParams.get('isVerified') || 'All',
          semester: searchParams.get('semester') || 'All',
          sort: searchParams.get('sort') || 'Newest Uploads',
          page,
          limit: 6,
        };

        const response = await resourceService.getResources(queryParams);
        setResources(response.data.resources || []);
        setTotalPages(response.data.pages || 1);
        setTotalResources(response.data.total || 0);

        // Check if there is an auth redirect chain parameter
        const actionParam = searchParams.get('action');
        const resourceIdParam = searchParams.get('resourceId');
        if (actionParam && resourceIdParam) {
          const matchedResource = response.data.resources.find(r => r._id === resourceIdParam);
          if (matchedResource) {
            if (actionParam === 'preview') {
              setPreviewResource(matchedResource);
            } else if (actionParam === 'continue') {
              try {
                await resourceService.downloadResource(matchedResource._id);
                let targetUrl = matchedResource.fileUrl;
                if (targetUrl && targetUrl.startsWith('/uploads/')) {
                  targetUrl = `${SERVER_URL}${targetUrl}`;
                }
                window.open(targetUrl, '_blank');
              } catch (err) {
                console.error("Auto download failed:", err);
              }
            }
            // Clear search params redirect metadata
            setSearchParams({});
          }
        }

      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [searchParams, page, setSearchParams]);

  // Sync state with URL params
  const handleApplyFilters = () => {
    const params = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (stream !== 'All') params.branch = stream;
    if (sharingFormat !== 'All') params.resourceType = sharingFormat;
    if (verification === 'Verified Only') params.isVerified = 'true';
    if (semester !== 'All') params.semester = semester;
    if (sortBy !== 'Newest Uploads') params.sort = sortBy;
    
    setPage(1); // reset to page 1
    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStream('All');
    setSharingFormat('All');
    setVerification('All Resources');
    setSemester('All');
    setSortBy('Newest Uploads');
    setPage(1);
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    const params = { search: suggestion };
    if (stream !== 'All') params.branch = stream;
    if (sharingFormat !== 'All') params.resourceType = sharingFormat;
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-tr from-brand-50/40 to-slate-50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3 w-3 text-brand-500" />
            <span>{totalResources} resources available</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Explore <span className="text-brand-600">Resources</span>
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Search lecture summaries, dynamic repositories, previous exam papers, and course playlists verified by administrators.
          </p>
        </div>
      </div>

      {/* 2. Search & Suggestion Bar */}
      <div className="space-y-4">
        <div className="relative flex rounded-2xl bg-white shadow-premium border border-slate-100 p-2 items-center">
          <Search className="h-5 w-5 text-slate-400 ml-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            placeholder="Search for DBMS Notes, MCA Java, Placement PDF..."
            className="w-full bg-transparent border-none outline-none focus:ring-0 px-3 py-2 text-sm text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={handleApplyFilters}
            className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-5 py-2 text-xs font-bold transition-all shadow-md flex-shrink-0"
          >
            Search Notes
          </button>
        </div>

        {/* Suggestion tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-450 mr-1">Suggestions:</span>
          {popularSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="rounded-full bg-white border border-slate-100 hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-650 px-3 py-1 text-[11px] font-semibold text-slate-550 shadow-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Filter Sidebar + Cards Layout */}
      <div className="flex lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-705 hover:bg-slate-55 transition-all shadow-sm w-full justify-center"
        >
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Filters Panel */}
        <div className={`lg:col-span-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-premium space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" />
              <span>Filters</span>
            </div>
            <button onClick={handleResetFilters} className="text-xs text-slate-450 hover:text-brand-600 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Stream/Program */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stream/Program</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="All">All</option>
                <option value="BTech">B.Tech Notes</option>
                <option value="MCA">MCA Notes</option>
                <option value="Placement">Placement Guides</option>
                <option value="Interview Prep">Interview Preparation</option>
              </select>
            </div>

            {/* Sharing Format */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sharing Format</label>
              <select
                value={sharingFormat}
                onChange={(e) => setSharingFormat(e.target.value)}
                className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="All">All</option>
                <option value="PDF">PDF Documents</option>
                <option value="website">Websites</option>
                <option value="drive">Drive Files</option>
                <option value="youtube">YouTube Videos</option>
                <option value="github">GitHub Repositories</option>
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Verification Status</label>
              <select
                value={verification}
                onChange={(e) => setVerification(e.target.value)}
                className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="All Resources">All Resources</option>
                <option value="Verified Only">Verified Only</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="All">All</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            {/* Sorting Choice */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="Newest Uploads">Newest Uploads</option>
                <option value="Most Downloaded">Most Downloaded</option>
                <option value="Top Rated">Top Rated</option>
                <option value="Verified">Verified First</option>
              </select>
            </div>

          </div>

          <button
            onClick={handleApplyFilters}
            className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-all"
          >
            Apply Filters
          </button>
        </div>

        {/* Right Cards List */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-450">
            <span>{totalResources} resources found</span>
          </div>

          {loading ? (
            <SkeletonLoader count={6} />
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center bg-white shadow-sm">
              <p className="font-semibold text-slate-600 mb-1">No resources found</p>
              <p className="text-xs text-slate-400 mb-5">Be the first to upload a resource for this category!</p>
              <button
                onClick={handleResetFilters}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((res) => (
                  <ResourceCard
                    key={res._id}
                    resource={res}
                    onPreviewClick={setPreviewResource}
                    onReportClick={setReportResource}
                  />
                ))}
              </div>

              {/* Autocomplete / Pagination panel */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6 border-t border-slate-100">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all ${
                        page === idx + 1
                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-100'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Preview Modal */}
      {previewResource && (
        <PreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}

      {/* Report Modal */}
      {reportResource && (
        <ReportModal
          resource={reportResource}
          onClose={() => setReportResource(null)}
          onReportSuccess={() => {
            alert('Report filed successfully! Administrators will review the issue.');
            setReportResource(null);
          }}
        />
      )}

    </div>
  );
};

export default Resources;
