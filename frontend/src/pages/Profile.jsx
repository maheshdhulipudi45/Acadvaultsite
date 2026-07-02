import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import PreviewModal from '../components/PreviewModal';
import ReportModal from '../components/ReportModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { Edit2, Save, X, Award, FileUp, Bookmark, Calendar, Briefcase, GraduationCap } from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  // Mode toggles
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'bookmarks'

  // Input states
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [year, setYear] = useState(user?.year || '1');
  const [semester, setSemester] = useState(user?.semester || '1');

  // Lists states
  const [uploads, setUploads] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Modals interaction states
  const [previewResource, setPreviewResource] = useState(null);
  const [reportResource, setReportResource] = useState(null);

  // Error/Success status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCollege(user.college);
      setBranch(user.branch);
      setBio(user.bio);
      setAvatarUrl(user.avatarUrl);
      setYear(user.year);
      setSemester(user.semester);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      setLoadingLists(true);
      try {
        const [resUploads, resBookmarks] = await Promise.all([
          userService.getMyUploads(),
          userService.getBookmarks(),
        ]);
        setUploads(resUploads.data || []);
        setBookmarks(resBookmarks.data || []);
      } catch (err) {
        console.error('Error fetching profile lists:', err);
      } finally {
        setLoadingLists(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const result = await updateUserProfile({
        name,
        college,
        branch,
        bio,
        avatarUrl,
        year: parseInt(year),
        semester: parseInt(semester),
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center text-slate-500">
        Please login to view your profile.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      {success && <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-700">{success}</div>}
      
      {/* 1. Profile Banner Header */}
      <div className="relative rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-premium flex flex-col md:flex-row gap-6 md:items-center justify-between">
        
        {/* User basic details */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white font-extrabold text-3xl shadow-lg shadow-brand-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white shadow ring-2 ring-white">
              <Award className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="space-y-1.5 text-center md:text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{user.name}</h1>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            
            {/* Badges rank tag */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              <span className="rounded-lg bg-brand-50 border border-brand-100 px-2.5 py-1 text-xs font-bold text-brand-650">
                {user.badge}
              </span>
              <span className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                ★ {user.points} Contributor Points
              </span>
            </div>
          </div>
        </div>

        {/* Action edit button */}
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all self-center"
          >
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setEditMode(false)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all self-center"
          >
            <X className="h-4 w-4" /> Cancel Edit
          </button>
        )}
      </div>

      {/* 2. Stats Grid / Edit Mode Form */}
      {!editMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bio Description Box */}
          <div className="md:col-span-1 rounded-2xl border border-slate-100 bg-white p-5 shadow-premium space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Bio Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {user.bio || 'This student hasn\'t added a biography bio yet.'}
            </p>
            
            <div className="border-t border-slate-50 pt-4 space-y-2 text-xs text-slate-650">
              {user.college && (
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span>{user.college}</span>
                </p>
              )}
              {user.branch && (
                <p className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span>{user.branch} Stream</span>
                </p>
              )}
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Year {user.year} · Sem {user.semester}</span>
              </p>
            </div>
          </div>

          {/* Stats counters */}
          <div className="md:col-span-2 grid grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium text-center flex flex-col justify-center items-center">
              <FileUp className="h-8 w-8 text-brand-500 mb-2" />
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Uploads</span>
              <h3 className="text-3xl font-extrabold text-slate-805 mt-1">{uploads.length}</h3>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-premium text-center flex flex-col justify-center items-center">
              <Bookmark className="h-8 w-8 text-accent-500 mb-2" />
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Saved Resources</span>
              <h3 className="text-3xl font-extrabold text-slate-805 mt-1">{bookmarks.length}</h3>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-premium space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Edit Profile Details</h2>
          
          {error && <div className="rounded-xl bg-red-50 p-3.5 text-xs text-red-650 font-semibold">{error}</div>}
          
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Bio Biography</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short tagline about yourself..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">College Campus</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Branch Stream</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="BTech">B.Tech Engineering</option>
                <option value="MCA">MCA Computer Applications</option>
                <option value="Placement">Placement preparation</option>
                <option value="Interview Prep">Interview Preparation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:bg-white"
                >
                  <option value="1">Sem 1</option>
                  <option value="2">Sem 2</option>
                  <option value="3">Sem 3</option>
                  <option value="4">Sem 4</option>
                  <option value="5">Sem 5</option>
                  <option value="6">Sem 6</option>
                  <option value="7">Sem 7</option>
                  <option value="8">Sem 8</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-brand-100 disabled:opacity-40"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Tabs: Uploads vs Bookmarks */}
      <div className="space-y-6">
        
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'uploads'
                ? 'border-brand-600 text-brand-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            My Uploads ({uploads.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'bookmarks'
                ? 'border-brand-600 text-brand-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Saved Bookmarks ({bookmarks.length})
          </button>
        </div>

        {/* Tab Grids */}
        {loadingLists ? (
          <SkeletonLoader count={3} />
        ) : activeTab === 'uploads' ? (
          uploads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-400 text-xs bg-white">
              You haven't uploaded any resources yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onPreviewClick={setPreviewResource}
                  onReportClick={setReportResource}
                />
              ))}
            </div>
          )
        ) : (
          bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-400 text-xs bg-white">
              No saved bookmarks resources.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((res) => (
                <ResourceCard
                  key={res._id}
                  resource={res}
                  onPreviewClick={setPreviewResource}
                  onReportClick={setReportResource}
                />
              ))}
            </div>
          )
        )}

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

export default Profile;
