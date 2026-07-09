import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle2, Bookmark, Star, Download, ExternalLink, Github, Eye, Sparkles, FolderSync, ShieldAlert } from 'lucide-react';
import { resourceService, resolveResourceUrl } from '../services/api';

const PreviewModal = ({ resource: initialResource, onClose }) => {
  const { user, toggleBookmark, bookmarks } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(initialResource);
  const [recommendations, setRecommendations] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const isBookmarked = bookmarks.some((b) => b._id === resource._id);

  // Fetch fresh details & recommendations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resDetails, resRecs] = await Promise.all([
          resourceService.getResourceById(resource._id),
          resourceService.getRecommendations(resource._id),
        ]);
        setResource(resDetails.data);
        setRecommendations(resRecs.data);
        
        // Find existing user rating
        if (user && resDetails.data.ratings) {
          const userRate = resDetails.data.ratings.find(r => r.user?._id === user._id || r.user === user._id);
          if (userRate) {
            setUserRating(userRate.rating);
          }
        }
      } catch (err) {
        console.error('Error loading preview details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resource._id, user]);

  const handleBookmark = async () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/resources?action=preview&resourceId=${resource._id}`);
      navigate('/login');
      return;
    }
    await toggleBookmark(resource._id);
  };

  const handleRate = async (rate) => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/resources?action=preview&resourceId=${resource._id}`);
      navigate('/login');
      return;
    }
    setSubmittingRating(true);
    setRatingMessage('');
    try {
      const response = await resourceService.rateResource(resource._id, rate);
      setUserRating(rate);
      setRatingMessage('Rating submitted successfully!');
      
      // Update local state average rating
      setResource(prev => ({
        ...prev,
        averageRating: response.data.averageRating,
      }));
    } catch (err) {
      setRatingMessage(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownloadOrOpen = async () => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', `/resources?action=continue&resourceId=${resource._id}`);
      navigate('/login');
      return;
    }
    try {
      await resourceService.downloadResource(resource._id);
      
      // Get the correct URL path
      let link = resolveResourceUrl(resource.fileUrl);
      window.open(link, '_blank');
      
      // Update local download count
      setResource(prev => ({
        ...prev,
        downloadsCount: prev.downloadsCount + 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // YouTube Helper: extract video/playlist ID
  const getEmbedLink = (url, type) => {
    if (type === 'youtube') {
      try {
        const playlistMatch = url.match(/[&?]list=([^&]+)/);
        if (playlistMatch) {
          return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
        }
        const videoMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/);
        if (videoMatch) {
          return `https://www.youtube.com/embed/${videoMatch[1]}`;
        }
      } catch {
        // Ignored
      }
      return 'https://www.youtube.com/embed/';
    }
    if (type === 'pdf') {
      return resolveResourceUrl(url);
    }
    return url;
  };

  const renderPreviewPanel = () => {
    switch (resource.resourceType) {
      case 'youtube':
        return (
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md">
            <iframe
              src={getEmbedLink(resource.linkUrl, 'youtube')}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-[260px] sm:h-[380px] rounded-2xl overflow-hidden border border-slate-250 bg-slate-100 relative group">
            <object
              data={getEmbedLink(resource.fileUrl, 'pdf')}
              type="application/pdf"
              className="w-full h-full"
            >
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
                <ShieldAlert className="h-10 w-10 text-slate-400 mb-3" />
                <p className="font-semibold text-slate-700 mb-2">Native PDF Preview Unavailable</p>
                <p className="text-xs text-slate-500 mb-4">Your browser does not support inline PDF previewing. Please download the file directly to view it.</p>
                <button
                  onClick={handleDownloadOrOpen}
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-sm"
                >
                  Download Notes PDF
                </button>
              </div>
            </object>
          </div>
        );
      case 'github':
        return (
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 font-mono shadow-inner relative overflow-hidden">
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-50">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
              <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
            </div>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 text-xs text-slate-400">
              <Github className="h-4 w-4 text-white" />
              <span>{resource.linkUrl ? resource.linkUrl.replace('https://github.com/', '') : 'repository'}</span>
            </div>
            
            <div className="space-y-2 text-xs text-slate-300">
              <p className="text-brand-400">$ git clone {resource.linkUrl || 'repository.git'}</p>
              <p className="text-slate-500">Cloning into '{resource.title.replace(/\s+/g, '-').toLowerCase()}'...</p>
              <p className="text-slate-400">⚡ Remote branch: main</p>
              <p className="text-green-400">✓ Repository verified successfully</p>
              <p className="text-slate-500 mt-4"># Features:</p>
              <p className="text-slate-400">- Comprehensive code implementations</p>
              <p className="text-slate-400">- README installation instructions & docs</p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleDownloadOrOpen}
                className="flex items-center gap-1.5 rounded-xl bg-white text-slate-900 px-4 py-2 text-xs font-bold hover:bg-slate-100 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Clone Repository
              </button>
            </div>
          </div>
        );
      case 'drive':
        return (
          <div className="rounded-2xl border border-dashed border-slate-250 p-8 text-center bg-slate-50">
            <FolderSync className="h-10 w-10 text-brand-500 mx-auto mb-3 animate-pulse" />
            <h4 className="font-bold text-slate-850 mb-1">Google Drive Secure Document</h4>
            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">This resource is stored externally in Google Drive. You can access it securely in a new window.</p>
            <button
              onClick={handleDownloadOrOpen}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto"
            >
              <ExternalLink className="h-4 w-4" /> Open Drive File
            </button>
          </div>
        );
      default:
        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-brand-500 tracking-wider">Educational Website Resource</span>
              <h4 className="font-bold text-slate-850 text-base">{resource.title}</h4>
              <p className="text-xs text-slate-500">{resource.linkUrl}</p>
            </div>
            <button
              onClick={handleDownloadOrOpen}
              className="flex items-center gap-1.5 rounded-xl bg-brand-650 hover:bg-brand-700 text-white px-4 py-2 text-xs font-bold transition-colors"
            >
              <ExternalLink className="h-4 w-4" /> Visit Site
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header Options */}
        <div className="flex justify-between items-center bg-slate-50 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h3 className="font-bold text-base text-slate-800 line-clamp-1">{resource.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition-all duration-200 border ${
                isBookmarked 
                  ? 'bg-amber-50 text-amber-500 border-amber-200' 
                  : 'bg-white text-slate-400 hover:text-brand-500 hover:bg-brand-50 border-slate-200'
              }`}
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-h-[55vh] lg:max-h-[75vh] overflow-y-auto">
          
          {/* Left Panel: Previewer & Description */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Native Preview */}
            {renderPreviewPanel()}

            {/* Title, description & tag details */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-slate-100 border border-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {resource.branch}
                </span>
                <span className="rounded-lg bg-brand-50 border border-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
                  Semester {resource.semester}
                </span>
                {resource.isVerified && (
                  <span className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                    <CheckCircle2 className="h-3 w-3 fill-current text-white" />
                    Trusted Verified Resource
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{resource.description}</p>
              
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
                {resource.tags && resource.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* User Ratings UI Section */}
            <div className="rounded-2xl border border-slate-100 p-5 bg-slate-50 text-left">
              <h4 className="font-bold text-sm text-slate-800 mb-3">Rate this resource</h4>
              
              <div className="flex items-center gap-6">
                {/* Score */}
                <div className="flex flex-col items-center justify-center pr-6 border-r border-slate-200">
                  <span className="text-3xl font-extrabold text-slate-800">{resource.averageRating || '0.0'}</span>
                  <div className="flex items-center gap-0.5 text-amber-500 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.round(resource.averageRating || 0) ? 'fill-current' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{resource.ratings?.length || 0} reviews</span>
                </div>

                {/* Rating Input controls */}
                <div className="space-y-1.5 flex-1">
                  <span className="text-xs text-slate-500 block">How helpful was this resource to your exams or placements?</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={submittingRating}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => handleRate(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 transition-all duration-100 ${
                            star <= (ratingHover || userRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {ratingMessage && (
                    <span className="text-xs text-brand-600 block animate-pulse">{ratingMessage}</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Recommendations & Contributor Details */}
          <div className="lg:col-span-5 space-y-6 text-left border-l border-slate-50 pl-0 lg:pl-6">
            
            {/* Uploader Card Info */}
            <div className="rounded-2xl border border-slate-100 p-5 bg-white space-y-4">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Contributor Info</h4>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold text-base shadow-sm">
                  {resource.uploader?.name ? resource.uploader.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-bold text-sm text-slate-800 leading-snug">{resource.uploader?.name || 'System Contributor'}</h5>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-600">
                      {resource.uploader?.badge || 'Bronze Rank'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ★ {resource.uploader?.points || 0} pts
                    </span>
                  </div>
                </div>
              </div>
              
              {resource.uploader?.college && (
                <div className="text-xs text-slate-500 space-y-1 border-t border-slate-50 pt-3">
                  <p><span className="font-semibold text-slate-700">College:</span> {resource.uploader.college}</p>
                  {resource.uploader.branch && (
                    <p><span className="font-semibold text-slate-700">Branch:</span> {resource.uploader.branch}</p>
                  )}
                </div>
              )}
            </div>

            {/* Recommendations List section */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Recommended Resources</h4>
              
              {loading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse border border-slate-100"></div>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  No similar resources found
                </div>
              ) : (
                <div className="space-y-2">
                  {recommendations.map((rec) => (
                    <div
                      key={rec._id}
                      onClick={() => setResource(rec)}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 hover:border-brand-100 transition-all cursor-pointer group"
                    >
                      <div className="space-y-0.5 truncate flex-1 pr-3">
                        <span className="text-[9px] uppercase font-bold text-brand-500">{rec.resourceType}</span>
                        <h5 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {rec.title}
                        </h5>
                      </div>
                      <Eye className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Bottom footer button bar */}
        <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={handleDownloadOrOpen}
            className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white px-5 py-2.5 text-xs font-bold hover:from-brand-700 hover:to-brand-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            {resource.resourceType === 'youtube' ? 'Open Playlist' : 'Download Document'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreviewModal;
