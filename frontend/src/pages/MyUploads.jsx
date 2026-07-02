import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import PreviewModal from '../components/PreviewModal';
import ReportModal from '../components/ReportModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { FileUp } from 'lucide-react';

const MyUploads = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [previewResource, setPreviewResource] = useState(null);
  const [reportResource, setReportResource] = useState(null);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const response = await userService.getMyUploads();
      setResources(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      
      {/* Header */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-premium">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <FileUp className="h-3.5 w-3.5 text-brand-500" />
            <span>My Contributions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Uploads</h1>
          <p className="text-sm text-slate-500">
            Track download metrics, views, and ratings for notes you shared.
          </p>
        </div>
      </div>

      {/* Grid of uploaded cards */}
      {loading ? (
        <SkeletonLoader count={3} />
      ) : resources.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 py-20 text-center bg-white shadow-sm">
          <p className="font-semibold text-slate-600 mb-1">No uploads yet</p>
          <p className="text-xs text-slate-400">Share some course notes or video playlists to earn contributor badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onBookmarkToggle={fetchUploads}
              onPreviewClick={setPreviewResource}
              onReportClick={setReportResource}
            />
          ))}
        </div>
      )}

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

export default MyUploads;
