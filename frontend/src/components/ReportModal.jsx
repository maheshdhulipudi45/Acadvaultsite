import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { resourceService } from '../services/api';

const ReportModal = ({ resource, onClose, onReportSuccess }) => {
  const [reportType, setReportType] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await resourceService.reportResource(resource._id, {
        reportType,
        description: description.trim(),
      });
      onReportSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold text-lg text-slate-800">Report Resource</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-550 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Resource Title */}
        <div className="mb-4 rounded-xl bg-slate-50 p-3">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Resource Title</span>
          <p className="font-semibold text-sm text-slate-700 line-clamp-1">{resource.title}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 animate-pulse">
            {error}
          </div>
        )}

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Issue Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
            >
              <option value="spam">Spam / Abuse</option>
              <option value="duplicate">Duplicate Resource</option>
              <option value="broken_link">Broken / Dead Link</option>
              <option value="wrong_content">Wrong / Inaccurate Content</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              placeholder="Please explain why this resource is being flagged..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white placeholder-slate-400"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-red-650 hover:bg-red-700 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-red-100 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ReportModal;
