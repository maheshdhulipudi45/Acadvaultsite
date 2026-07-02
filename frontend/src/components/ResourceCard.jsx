import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Download, Bookmark, FileText, Youtube, Github, ExternalLink, HardDrive, Star, AlertTriangle } from 'lucide-react';
import { resourceService, SERVER_URL } from '../services/api';

const ResourceCard = ({ resource, onBookmarkToggle, onReportClick, onPreviewClick }) => {
  const { user, toggleBookmark, bookmarks } = useAuth();
  const navigate = useNavigate();

  const isBookmarked = bookmarks.some((b) => b._id === resource._id);

  // Styling helper for Resource type indicators
  const getTypeStyles = (type) => {
    switch (type) {
      case 'pdf':
        return { label: 'PDF', icon: FileText, color: 'text-red-600 bg-red-50 border-red-100' };
      case 'ppt':
        return { label: 'PPT', icon: FileText, color: 'text-orange-600 bg-orange-50 border-orange-100' };
      case 'docx':
        return { label: 'DOCX', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' };
      case 'zip':
        return { label: 'ZIP Archive', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-100' };
      case 'drive':
        return { label: 'Google Drive', icon: HardDrive, color: 'text-green-600 bg-green-50 border-green-100' };
      case 'youtube':
        return { label: 'YouTube Playlist', icon: Youtube, color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'website':
        return { label: 'Web Link', icon: ExternalLink, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      case 'github':
        return { label: 'GitHub Repo', icon: Github, color: 'text-slate-800 bg-slate-100 border-slate-200' };
      default:
        return { label: 'Resource', icon: FileText, color: 'text-slate-600 bg-slate-50 border-slate-100' };
    }
  };

  const { label, icon: Icon, color: typeColor } = getTypeStyles(resource.resourceType);

  // Authentication wrapper check for sensitive buttons
  const handleAuthAction = (actionCallback) => {
    if (!user) {
      // Redirect to login page and save the redirect intent
      localStorage.setItem('redirectAfterLogin', `/resources?action=continue&resourceId=${resource._id}`);
      navigate('/login');
    } else {
      actionCallback();
    }
  };

  const handleDownloadOrLink = async () => {
    handleAuthAction(async () => {
      try {
        // Track download in backend
        await resourceService.downloadResource(resource._id);
        
        // Open link or file URL
        let targetUrl = resource.fileUrl;
        if (targetUrl && targetUrl.startsWith('/uploads/')) {
          targetUrl = `${SERVER_URL}${targetUrl}`;
        }
        window.open(targetUrl, '_blank');
      } catch (err) {
        console.error('Error opening resource:', err);
      }
    });
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    handleAuthAction(async () => {
      await toggleBookmark(resource._id);
      if (onBookmarkToggle) onBookmarkToggle();
    });
  };

  const getActionBtnLabel = () => {
    switch (resource.resourceType) {
      case 'youtube': return 'Watch Course';
      case 'github': return 'Explore Repo';
      case 'drive': return 'Open Drive';
      case 'website': return 'Open Link';
      default: return 'Download File';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-premium hover:shadow-premium-hover hover:border-brand-100 transition-all duration-300">
      
      {/* Bookmark tag */}
      <button
        onClick={handleBookmark}
        className={`absolute top-4 right-4 p-2 rounded-xl transition-all duration-200 border ${
          isBookmarked 
            ? 'bg-amber-50 text-amber-500 border-amber-200' 
            : 'bg-slate-50 text-slate-400 hover:text-brand-500 hover:bg-brand-50 border-slate-100'
        }`}
      >
        <Bookmark className="h-4.5 w-4.5" fill={isBookmarked ? "currentColor" : "none"} />
      </button>

      {/* Top Details */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${typeColor}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          {resource.isVerified && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">
              <CheckCircle2 className="h-3 w-3 fill-current text-white" />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-brand-600 transition-colors mb-1">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {resource.description}
        </p>

        {/* Branch / Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {resource.branch}
          </span>
          {resource.semester > 0 && (
            <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
              Sem {resource.semester}
            </span>
          )}
          {resource.tags && resource.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="rounded bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="border-t border-slate-50 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-4">
          
          {/* Uploader profile info */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
              {resource.uploader?.name ? resource.uploader.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                {resource.uploader?.name || 'System Contributor'}
              </span>
              <span className="text-[9px] text-brand-500 font-medium leading-none">
                {resource.uploader?.badge || 'Bronze Rank'}
              </span>
            </div>
          </div>

          {/* Ratings & Downloads count */}
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <div className="flex items-center gap-0.5 font-medium text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{resource.averageRating || '0.0'}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[11px]">
              <Download className="h-3 w-3" />
              <span>{resource.downloadsCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPreviewClick && onPreviewClick(resource)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            Explore Info
          </button>
          <button
            onClick={handleDownloadOrLink}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white px-3 py-2 text-xs font-bold hover:from-brand-700 hover:to-brand-800 transition-colors shadow-sm"
          >
            {getActionBtnLabel()}
          </button>
        </div>

        {/* Report link */}
        <div className="flex justify-end mt-2">
          <button
            onClick={() => handleAuthAction(() => onReportClick && onReportClick(resource))}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors"
          >
            <AlertTriangle className="h-3 w-3" /> Report issue
          </button>
        </div>
      </div>

    </div>
  );
};

export default ResourceCard;
