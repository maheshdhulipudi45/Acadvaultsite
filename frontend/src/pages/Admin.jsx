import { useState, useEffect } from 'react';
import { adminService, resourceService } from '../services/api';
import { Shield, CheckCircle, Trash2 } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalUploads: 0, totalDownloads: 0, pendingReports: 0 });
  const [activeTab, setActiveTab] = useState('resources'); // 'resources', 'reports', 'users'
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resStats, resReports, resUsers] = await Promise.all([
        adminService.getStats(),
        adminService.getReports(),
        adminService.getUsers(),
      ]);

      setStats(resStats.data.stats);
      setReports(resReports.data || []);
      setUsersList(resUsers.data || []);

      // Get resources by querying base resources using client API service
      const clientResourcesResponse = await resourceService.getResources({ limit: 50 });
      setResources(clientResourcesResponse.data.resources || []);

    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleVerify = async (id) => {
    setSubmittingId(id);
    try {
      await adminService.verifyResource(id);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to verify resource.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource permanently?')) return;
    setSubmittingId(id);
    try {
      await adminService.deleteResource(id);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete resource.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleResolveReport = async (id) => {
    setSubmittingId(id);
    try {
      await adminService.resolveReport(id);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve report.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user? This will also remove all their uploaded resources.')) return;
    setSubmittingId(id);
    try {
      await adminService.deleteUser(id);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left space-y-8">
      
      {/* 1. Header Banner */}
      <div className="rounded-3xl border border-slate-100 bg-slate-900 text-white p-6 md:p-8 flex items-center gap-4 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-md">
          <Shield className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold md:text-3xl">Admin Moderator Panel</h1>
          <p className="text-xs text-slate-400">
            Handle user uploads verification, review spams/duplicate complaints, and manage platform safety settings.
          </p>
        </div>
      </div>

      {/* 2. Analytical stats tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium text-center">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Users</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalUsers}</h3>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium text-center">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Total Uploads</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalUploads}</h3>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium text-center">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Downloads Recorded</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{stats.totalDownloads}</h3>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-premium text-center">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Pending Reports</span>
          <h3 className="text-2xl font-extrabold text-red-600 mt-1">{stats.pendingReports}</h3>
        </div>
      </div>

      {/* 3. Navigation Moderation Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'resources'
                ? 'border-brand-600 text-brand-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Verify Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reports'
                ? 'border-brand-600 text-brand-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Active Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'users'
                ? 'border-brand-600 text-brand-650'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Manage Users ({usersList.length})
          </button>
        </div>

        {/* Tab contents */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : activeTab === 'resources' ? (
          /* Verification table */
          <div className="rounded-3xl border border-slate-100 bg-white shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  <tr>
                    <th className="px-6 py-4 text-left">Resource Title</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Uploader</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No uploads found.</td>
                    </tr>
                  ) : (
                    resources.map((res) => (
                      <tr key={res._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <div className="flex flex-col">
                            <span className="line-clamp-1">{res.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Sem {res.semester}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 uppercase text-xs font-bold text-slate-500">{res.resourceType}</td>
                        <td className="px-6 py-4">{res.branch}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{res.uploader?.name || 'System'}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                          <button
                            disabled={submittingId === res._id}
                            onClick={() => handleToggleVerify(res._id)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                              res.isVerified
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-250 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {res.isVerified ? 'Verified' : 'Verify'}
                          </button>
                          <button
                            disabled={submittingId === res._id}
                            onClick={() => handleDeleteResource(res._id)}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete Resource"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'reports' ? (
          /* Reports table */
          <div className="rounded-3xl border border-slate-100 bg-white shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  <tr>
                    <th className="px-6 py-4 text-left">Flagged Item</th>
                    <th className="px-6 py-4 text-left">Reporter</th>
                    <th className="px-6 py-4 text-left">Reason Type</th>
                    <th className="px-6 py-4 text-left">Details</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No active reports. All clear!</td>
                    </tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep._id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {rep.resource ? (
                            <div className="flex flex-col">
                              <span className="line-clamp-1">{rep.resource.title}</span>
                              <span className="text-[10px] text-brand-600 font-bold uppercase">{rep.resource.resourceType}</span>
                            </div>
                          ) : (
                            <span className="text-red-500 font-normal italic">Deleted Resource</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">{rep.reporter?.name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-red-50 border border-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 uppercase">
                            {rep.reportType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-500" title={rep.description}>
                          {rep.description}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                          {rep.status === 'pending' ? (
                            <button
                              disabled={submittingId === rep._id}
                              onClick={() => handleResolveReport(rep._id)}
                              className="rounded-lg bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-100"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold px-3">Resolved</span>
                          )}
                          
                          {rep.resource && (
                            <button
                              disabled={submittingId === rep._id}
                              onClick={() => handleDeleteResource(rep.resource._id)}
                              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Flagged Resource"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Users list table */
          <div className="rounded-3xl border border-slate-100 bg-white shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  <tr>
                    <th className="px-6 py-4 text-left">Username</th>
                    <th className="px-6 py-4 text-left">Email Address</th>
                    <th className="px-6 py-4 text-left">Badge Level</th>
                    <th className="px-6 py-4 text-left">Points</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-50 text-brand-700 text-xs font-bold">
                            {usr.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{usr.name}</span>
                          {usr.role === 'admin' && (
                            <span className="rounded bg-amber-50 border border-amber-200 px-1 py-0.5 text-[9px] font-bold text-amber-700">Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{usr.email}</td>
                      <td className="px-6 py-4 text-xs font-bold text-brand-650">{usr.badge}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{usr.points} pts</td>
                      <td className="px-6 py-4 text-right">
                        {usr.role !== 'admin' && (
                          <button
                            disabled={submittingId === usr._id}
                            onClick={() => handleDeleteUser(usr._id)}
                            className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Ban User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Admin;
