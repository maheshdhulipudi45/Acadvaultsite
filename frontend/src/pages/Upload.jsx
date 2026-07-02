import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceService } from '../services/api';
import { FileUp, Link as LinkIcon, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form toggles
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'

  // Input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [university, setUniversity] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('BTech'); // default BTech
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');
  const [tags, setTags] = useState('');
  const [resourceType, setResourceType] = useState('pdf'); // default pdf for file, drive for link
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState(null);

  // Status indicators
  const [duplicateMessage, setDuplicateMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Link regex validators
  const validateUrls = (url, type) => {
    try {
      if (!url) return false;
      const parsed = new URL(url);
      
      if (type === 'drive') {
        return parsed.hostname.includes('drive.google.com');
      }
      if (type === 'youtube') {
        return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
      }
      if (type === 'github') {
        return parsed.hostname.includes('github.com');
      }
      return true; // standard website URL is valid if parses
    } catch {
      return false;
    }
  };

  // Blur checker for duplicate detection
  const handleCheckDuplicates = async () => {
    setDuplicateMessage('');
    if (!title.trim() || !branch) return;

    try {
      const payload = {
        title: title.trim(),
        branch: branch,
        semester: parseInt(semester),
        resourceType: uploadMode === 'file' ? resourceType : resourceType,
      };

      if (uploadMode === 'link' && linkUrl.trim()) {
        payload.linkUrl = linkUrl.trim();
      }

      const response = await resourceService.checkDuplicate(payload);
      if (response.data.duplicate) {
        setDuplicateMessage('Similar resource already exists in AcadVault (Duplicate detected).');
      }
    } catch (err) {
      console.error('Duplicate check error:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedExtensions = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.zip'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError('Only PDF, PPT, DOCX, and ZIP file uploads are allowed.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB.');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    
    // Auto-populate title if empty
    if (!title) {
      const cleanName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.'));
      setTitle(cleanName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDuplicateMessage('');

    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/upload');
      navigate('/login');
      return;
    }

    // Validation checks
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description.');
      return;
    }

    if (uploadMode === 'file' && !file) {
      setError('Please select a file to upload.');
      return;
    }

    if (uploadMode === 'link') {
      if (!linkUrl.trim()) {
        setError('Please provide an external URL link.');
        return;
      }
      if (!validateUrls(linkUrl.trim(), resourceType)) {
        setError(`Please provide a valid ${resourceType} URL.`);
        return;
      }
    }

    // Re-verify duplicate detection before submitting
    try {
      const payload = {
        title: title.trim(),
        branch: branch,
        semester: parseInt(semester),
        resourceType: uploadMode === 'file' ? resourceType : resourceType,
      };
      if (uploadMode === 'link') payload.linkUrl = linkUrl.trim();

      const dupRes = await resourceService.checkDuplicate(payload);
      if (dupRes.data.duplicate) {
        setDuplicateMessage('Similar resource already exists.');
        return;
      }
    } catch {
      // Ignore error during duplicate check to let normal form submission proceed
    }

    // Form submission processing
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('resourceType', uploadMode === 'file' ? resourceType : resourceType);
    formData.append('university', university.trim());
    formData.append('college', college.trim());
    formData.append('branch', branch);
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('tags', tags.trim());

    if (uploadMode === 'file') {
      formData.append('file', file);
    } else {
      formData.append('linkUrl', linkUrl.trim());
    }

    try {
      await resourceService.uploadResource(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/resources');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resource. Please verify fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-md">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Upload Successful!</h2>
        <p className="text-sm text-slate-500">
          Your resource has been uploaded and points have been credited to your profile. Redirecting to resources...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 text-left space-y-8">
      
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-premium">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3 w-3 text-brand-500" />
            <span>Earn +10 points on upload</span>
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Share Knowledge</h1>
          <p className="text-sm text-slate-500">
            Upload course notes, playlists, website articles, and exam papers to build the community library.
          </p>
        </div>
      </div>

      {/* Main Upload Form */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-premium space-y-6">
        
        {/* Toggle Mode */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => {
              setUploadMode('file');
              setResourceType('pdf');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              uploadMode === 'file'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileUp className="h-4 w-4" />
            File Document Upload
          </button>
          <button
            onClick={() => {
              setUploadMode('link');
              setResourceType('drive');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              uploadMode === 'link'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            Share External URL Link
          </button>
        </div>

        {/* Status Panels */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {duplicateMessage && (
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-100 text-xs font-semibold text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
            <span>{duplicateMessage}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Picker Section */}
          {uploadMode === 'file' && (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-400 transition-colors bg-slate-50 relative group">
              <input
                type="file"
                required={uploadMode === 'file'}
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileUp className="h-8 w-8 text-slate-400 mx-auto mb-2 group-hover:text-brand-500 transition-colors" />
              <p className="text-xs font-bold text-slate-700">
                {file ? file.name : 'Click to select or drag document'}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports PDF, PPT, DOCX, ZIP files up to 50MB
              </p>
            </div>
          )}

          {/* Form details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Resource Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                onBlur={handleCheckDuplicates}
                placeholder="e.g., MCA Java Core Concepts Guide"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Detailed Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what study modules or placement materials this covers..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white placeholder-slate-400"
              ></textarea>
            </div>

            {/* Resource Type Indicator */}
            {uploadMode === 'file' ? (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Document File Format</label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="pdf">PDF Notes</option>
                  <option value="ppt">PPT Slide Presentation</option>
                  <option value="docx">DOCX Word Document</option>
                  <option value="zip">ZIP Archive Folder</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">External Resource Type</label>
                <select
                  value={resourceType}
                  onChange={(e) => {
                    setResourceType(e.target.value);
                    setLinkUrl('');
                    setError('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="drive">Google Drive Link</option>
                  <option value="youtube">YouTube Playlist URL</option>
                  <option value="github">GitHub Repository Link</option>
                  <option value="website">Educational Web Link</option>
                </select>
              </div>
            )}

            {/* URL Input */}
            {uploadMode === 'link' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Resource Link URL</label>
                <input
                  type="url"
                  required={uploadMode === 'link'}
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    if (error) setError('');
                  }}
                  onBlur={handleCheckDuplicates}
                  placeholder={`e.g., https://${resourceType === 'github' ? 'github.com/profile/repo' : 'drive.google.com/...'}`}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            )}

            {/* Stream/Branch */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Stream/Branch category</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                onBlur={handleCheckDuplicates}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="BTech">B.Tech Engineering</option>
                <option value="MCA">MCA computer app</option>
                <option value="Placement">Placement preparation</option>
                <option value="Interview Prep">Interview Preparation</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Target Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                onBlur={handleCheckDuplicates}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              >
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

            {/* Year */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">College Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior)</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Search Tags (Comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., java, ds, array, loops"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Affiliated University (Optional)</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g., VTU, Anna University"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* College */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">College Campus (Optional)</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g., RV College of Engineering"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/resources')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !!duplicateMessage}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-6 py-2.5 text-sm font-bold shadow-md shadow-brand-100 disabled:opacity-40 transition-colors"
            >
              {submitting ? 'Uploading Resource...' : 'Confirm Upload'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default Upload;
