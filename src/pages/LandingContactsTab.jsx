import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Settings,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  User,
  Phone,
  Inbox,
  Check,
  X,
  Plus,
  ShieldCheck,
  Server,
  Key,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const LandingContactsTab = () => {
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'config'
  
  // API URL Helper
  const getApiUrl = () => {
    return (import.meta.env.VITE_API_URL || 'http://localhost:3011')
      .replace(/\/api\/superadmin\/?$/, '')
      .replace(/\/$/, '');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  // ==========================================
  // SUBMISSIONS STATE
  // ==========================================
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, responded: 0, archived: 0, today: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // ==========================================
  // MAIL CONFIG STATE
  // ==========================================
  const [config, setConfig] = useState({
    isEnabled: false,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    secure: false,
    smtpUser: '',
    smtpPass: '',
    hasPassword: false,
    fromName: 'GaliBrand Contact System',
    fromEmail: '',
    receiverEmails: [],
    subjectPrefix: 'New Contact Inquiry',
    lastTestedAt: null,
    lastTestStatus: '',
  });
  const [newEmailTag, setNewEmailTag] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Test Mail State
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testingMail, setTestingMail] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: bool, message: string }

  // ==========================================
  // FETCH SUBMISSIONS
  // ==========================================
  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const envUrl = getApiUrl();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        status: statusFilter,
        search,
      });

      const res = await fetch(`${envUrl}/api/landing-contact/submissions?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissions(data.submissions || []);
        if (data.stats) setStats(data.stats);
        if (data.pagination) setTotalPages(data.pagination.pages || 1);
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to load submissions' });
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setActionMessage({ type: 'error', text: 'Network error while fetching submissions' });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ==========================================
  // FETCH MAIL CONFIG
  // ==========================================
  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const envUrl = getApiUrl();
      const res = await fetch(`${envUrl}/api/landing-contact/config`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.config) {
        setConfig((prev) => ({
          ...prev,
          ...data.config,
          receiverEmails: Array.isArray(data.config.receiverEmails) ? data.config.receiverEmails : [],
          hasPassword: Boolean(data.config.smtpPass || data.config.hasPassword),
        }));
      }
    } catch (err) {
      console.error('Error fetching email config:', err);
      setActionMessage({ type: 'error', text: 'Failed to load mail configuration' });
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter]);

  useEffect(() => {
    if (activeTab === 'config') {
      fetchConfig();
    }
  }, [activeTab]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubmissions();
  };

  // ==========================================
  // SAVE MAIL CONFIG
  // ==========================================
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setActionMessage({ type: '', text: '' });
    try {
      const envUrl = getApiUrl();
      const payload = {
        isEnabled: config.isEnabled,
        smtpHost: config.smtpHost,
        smtpPort: Number(config.smtpPort),
        secure: config.secure,
        smtpUser: config.smtpUser,
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        receiverEmails: config.receiverEmails,
        subjectPrefix: config.subjectPrefix,
      };

      // Only send password if updated or set
      if (config.smtpPass) {
        payload.smtpPass = config.smtpPass;
      }

      const res = await fetch(`${envUrl}/api/landing-contact/config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionMessage({ type: 'success', text: 'Email alert settings saved successfully!' });
        setConfig((prev) => ({
          ...prev,
          ...data.config,
          hasPassword: Boolean(data.config.hasPassword || config.smtpPass),
          smtpPass: '', // clear plain password from input after saving
        }));
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to save configuration' });
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setActionMessage({ type: 'error', text: 'Network error saving configuration' });
    } finally {
      setSavingConfig(false);
    }
  };

  // ==========================================
  // TEST SMTP CONNECTION
  // ==========================================
  const handleTestMail = async () => {
    if (!testEmailTo || !testEmailTo.includes('@')) {
      setTestResult({ success: false, message: 'Please enter a valid test recipient email address.' });
      return;
    }

    setTestingMail(true);
    setTestResult(null);

    try {
      const envUrl = getApiUrl();
      const payload = {
        smtpHost: config.smtpHost,
        smtpPort: Number(config.smtpPort),
        secure: config.secure,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass, // If blank, backend falls back to stored password
        fromName: config.fromName,
        fromEmail: config.fromEmail,
        testEmailTo: testEmailTo.trim(),
      };

      const res = await fetch(`${envUrl}/api/landing-contact/config/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({ success: true, message: data.message || 'Test email sent successfully! Check your inbox.' });
      } else {
        setTestResult({ success: false, message: data.message || 'SMTP Connection Test Failed.' });
      }
    } catch (err) {
      setTestResult({ success: false, message: `Network error: ${err.message}` });
    } finally {
      setTestingMail(false);
    }
  };

  // ==========================================
  // RECEIVER EMAIL TAGS MANAGEMENT
  // ==========================================
  const handleAddReceiverEmail = (e) => {
    e?.preventDefault();
    if (!newEmailTag.trim()) return;

    // Support comma or space separated input
    const newEmails = newEmailTag
      .split(/[\n,;]+/)
      .map((em) => em.trim().toLowerCase())
      .filter((em) => em.includes('@') && !config.receiverEmails.includes(em));

    if (newEmails.length > 0) {
      setConfig((prev) => ({
        ...prev,
        receiverEmails: [...prev.receiverEmails, ...newEmails],
      }));
      setNewEmailTag('');
    }
  };

  const handleRemoveReceiverEmail = (indexToRemove) => {
    setConfig((prev) => ({
      ...prev,
      receiverEmails: prev.receiverEmails.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // ==========================================
  // SUBMISSION ACTIONS
  // ==========================================
  const handleViewSubmission = (sub) => {
    setSelectedSubmission(sub);
    setAdminNoteInput(sub.adminNotes || '');
    // Automatically update status to read locally if it was new
    if (sub.status === 'new') {
      handleUpdateStatus(sub._id, 'read', false);
    }
  };

  const handleUpdateStatus = async (id, newStatus, showBanner = true) => {
    try {
      const envUrl = getApiUrl();
      const res = await fetch(`${envUrl}/api/landing-contact/submissions/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
        );
        if (selectedSubmission?._id === id) {
          setSelectedSubmission((prev) => ({ ...prev, status: newStatus }));
        }
        if (showBanner) {
          setActionMessage({ type: 'success', text: `Status updated to ${newStatus}` });
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedSubmission) return;
    try {
      const envUrl = getApiUrl();
      const res = await fetch(`${envUrl}/api/landing-contact/submissions/${selectedSubmission._id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminNotes: adminNoteInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedSubmission((prev) => ({ ...prev, adminNotes: adminNoteInput }));
        setSubmissions((prev) =>
          prev.map((s) => (s._id === selectedSubmission._id ? { ...s, adminNotes: adminNoteInput } : s))
        );
        setActionMessage({ type: 'success', text: 'Internal notes saved.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to save notes.' });
    }
  };

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      const envUrl = getApiUrl();
      const res = await fetch(`${envUrl}/api/landing-contact/submissions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
        if (selectedSubmission?._id === id) setSelectedSubmission(null);
        setActionMessage({ type: 'success', text: 'Submission deleted successfully' });
      } else {
        setActionMessage({ type: 'error', text: 'Failed to delete submission' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Network error deleting submission' });
    }
  };

  const handleResendAlert = async (id) => {
    try {
      const envUrl = getApiUrl();
      const res = await fetch(`${envUrl}/api/landing-contact/submissions/${id}/resend`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: 'success', text: data.message || 'Alert email sent successfully!' });
        setSubmissions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, emailSent: true, emailError: '' } : s))
        );
        if (selectedSubmission?._id === id) {
          setSelectedSubmission((prev) => ({ ...prev, emailSent: true, emailError: '' }));
        }
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Failed to dispatch alert email.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Network error resending email' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Mail size={22} />
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Landing Page Contact & Email Alerts</h1>
          </div>
          <p className="text-sm text-slate-500">
            Manage contact form inquiries submitted on the GaliBrand landing page and configure real-time email alerts.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'submissions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox size={17} />
            <span>Inquiries</span>
            {stats.new > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                {stats.new}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'config'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings size={17} />
            <span>Email Alert Settings</span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {actionMessage.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            actionMessage.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SUBMISSIONS & RECEIVED FORMS */}
      {/* ======================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Inquiries</span>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Inbox size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">New / Unread</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-amber-600">{stats.new}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Responded</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">{stats.responded}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Today's Leads</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar size={18} />
                </span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-600">{stats.today}</div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filters & Search Toolbar */}
            <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-md">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-24 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
                >
                  Search
                </button>
              </form>

              {/* Status Filter & Refresh */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Inquiries</option>
                    <option value="new">New ({stats.new})</option>
                    <option value="read">Read ({stats.read})</option>
                    <option value="responded">Responded ({stats.responded})</option>
                    <option value="archived">Archived ({stats.archived})</option>
                  </select>
                </div>

                <button
                  onClick={fetchSubmissions}
                  disabled={loadingSubmissions}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                  title="Refresh inquiries"
                >
                  <RefreshCw size={17} className={loadingSubmissions ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              {loadingSubmissions ? (
                <div className="p-16 text-center text-slate-500 font-medium">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading contact submissions...
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-16 text-center text-slate-400">
                  <Inbox size={42} className="mx-auto mb-3 opacity-40" />
                  <p className="font-semibold text-slate-600 mb-1">No contact submissions found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When visitors submit the contact form on your landing page website, inquiries will appear here and email alerts will trigger.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Contact Info</th>
                      <th className="py-3.5 px-4">Shop Name</th>
                      <th className="py-3.5 px-4">Message Snippet</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Alert Status</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      const formattedDate = new Date(sub.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                      const formattedTime = new Date(sub.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <tr
                          key={sub._id}
                          className={`hover:bg-slate-50/80 transition cursor-pointer ${
                            sub.status === 'new' ? 'bg-blue-50/30 font-medium' : ''
                          }`}
                          onClick={() => handleViewSubmission(sub)}
                        >
                          {/* Contact Info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  sub.status === 'new'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                               Empty}`}
                              >
                                {sub.name ? sub.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span>{sub.name}</span>
                                  {sub.status === 'new' && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600" title="New Inquiry" />
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                  <a
                                    href={`mailto:${sub.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="hover:text-blue-600 hover:underline"
                                  >
                                    {sub.email}
                                  </a>
                                  {sub.phone && (
                                    <>
                                      <span>•</span>
                                      <a
                                        href={`tel:${sub.phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="hover:text-blue-600"
                                      >
                                        {sub.phone}
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Shop Name */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {sub.shopName ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-semibold">
                                🏪 {sub.shopName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">—</span>
                            )}
                          </td>

                          {/* Message Snippet */}
                          <td className="py-4 px-4 max-w-xs">
                            {sub.subject && (
                              <div className="font-semibold text-xs text-slate-800 truncate mb-0.5">
                                {sub.subject}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 truncate">{sub.message}</div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                            <div>{formattedDate}</div>
                            <div className="text-[11px] text-slate-400">{formattedTime}</div>
                          </td>

                          {/* Alert Email Status */}
                          <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {sub.emailSent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                                <Check size={13} />
                                Sent
                              </span>
                            ) : sub.emailError ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200 cursor-pointer"
                                title={sub.emailError}
                              >
                                <AlertCircle size={13} />
                                Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                Not Sent
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={sub.status}
                              onChange={(e) => handleUpdateStatus(sub._id, e.target.value)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                                sub.status === 'new'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : sub.status === 'read'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : sub.status === 'responded'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="read">Read</option>
                              <option value="responded">Responded</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td
                            className="py-4 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleViewSubmission(sub)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View details"
                              >
                                <Eye size={17} />
                              </button>
                              <button
                                onClick={() => handleResendAlert(sub._id)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Resend email alert"
                              >
                                <Send size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(sub._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete submission"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>

                          {/* Shop Name */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {sub.shopName ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-semibold">
                                🏪 {sub.shopName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
                <div>
                  Page <span className="font-bold">{page}</span> of{' '}
                  <span className="font-bold">{totalPages}</span> ({stats.total} total)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-100 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-100 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EMAIL ALERTS & SMTP CONFIGURATION */}
      {/* ======================================================== */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            {/* Master Toggle Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={20} className={config.isEnabled ? 'text-emerald-600' : 'text-slate-400'} />
                  Enable Email Alerts for Contact Form
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  When enabled, whenever a visitor completes the contact form on the GaliBrand landing page, an email alert with their name, email, phone, and message will be dispatched to your receiver emails.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={config.isEnabled}
                  onChange={(e) => setConfig({ ...config, isEmailEnabled: e.target.checked, isEnabled: e.target.checked })}
                />
                <div className={`w-14 h-8 rounded-full transition-colors ${config.isEnabled ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      config.isEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </label>
            </div>

            {/* SMTP Server Configuration Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Server size={20} className="text-blue-600" />
                  SMTP Mail Server Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your outgoing mail server credentials (e.g. Gmail, Zoho, Hostinger, SendGrid, Amazon SES, or custom cPanel mail).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* SMTP Host */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    SMTP Host / Server
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. smtp.gmail.com or mail.yourdomain.com"
                    value={config.smtpHost}
                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default for Gmail: smtp.gmail.com</p>
                </div>

                {/* SMTP Port */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="587 or 465"
                    value={config.smtpPort}
                    onChange={(e) => {
                      const port = Number(e.target.value);
                      setConfig({
                        ...config,
                        smtpPort: port,
                        secure: port === 465, // auto toggle SSL if 465
                      });
                    }}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Typically 587 (TLS) or 465 (SSL)</p>
                </div>
              </div>

              {/* Secure SSL Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-800">Use SSL/TLS Connection</span>
                  <p className="text-xs text-slate-500">Enable this if you use port 465. Leave unchecked for port 587 (STARTTLS).</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.secure}
                  onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMTP User */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. alerts@galibrand.com or user@gmail.com"
                    value={config.smtpUser}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* SMTP Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      SMTP Password / App Password
                    </label>
                    {config.hasPassword && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check size={12} /> Password Saved
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={config.hasPassword ? '••••••••  (Leave blank to keep current)' : 'Enter SMTP password'}
                      value={config.smtpPass}
                      onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                      className="w-full pl-4 pr-16 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    For Gmail, generate an <strong>App Password</strong> in Google Account &gt; Security &gt; 2-Step Verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Sender Branding & Multiple Receiver Emails */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  Sender Branding & Multiple Receiver Emails
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize the sender appearance and specify one or multiple email addresses to receive every new inquiry alert.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Sender Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GaliBrand Contact Alerts"
                    value={config.fromName}
                    onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sender Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Sender "From" Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="Leave blank to use SMTP Username"
                    value={config.fromEmail}
                    onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Subject Prefix */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Alert Email Subject Prefix
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Contact Inquiry from Landing Page"
                  value={config.subjectPrefix}
                  onChange={(e) => setConfig({ ...config, subjectPrefix: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Multiple Receiver Emails Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Receiver Emails (Multiple Recipients Supported)
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  {/* Email Input & Add Button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add recipient email (e.g. admin@galibrand.com) and press Enter or comma"
                      value={newEmailTag}
                      onChange={(e) => setNewEmailTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddReceiverEmail();
                        }
                      }}
                      className="flex-1 px-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddReceiverEmail}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  {/* Pills List */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {config.receiverEmails.length === 0 ? (
                      <p className="text-xs text-amber-600 font-medium">
                        ⚠️ No receiver emails added yet. Please add at least one email address to receive inquiry alerts!
                      </p>
                    ) : (
                      config.receiverEmails.map((email, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-semibold rounded-full shadow-xs"
                        >
                          <Mail size={12} className="text-blue-500" />
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReceiverEmail(index)}
                            className="text-slate-400 hover:text-red-600 ml-0.5 rounded-full p-0.5 transition"
                            title="Remove email"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    You can add multiple emails. An alert will be sent simultaneously to all addresses whenever a visitor fills out the contact form.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {config.lastTestedAt && (
                    <span>
                      Last tested: {new Date(config.lastTestedAt).toLocaleString('en-IN')} (
                      <span
                        className={
                          config.lastTestStatus?.toLowerCase().includes('success')
                            ? 'text-emerald-600 font-semibold'
                            : 'text-red-500 font-semibold'
                        }
                      >
                        {config.lastTestStatus}
                      </span>
                      )
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingConfig ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick SMTP Test Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-2xl shadow-md space-y-4">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Send size={20} className="text-emerald-400" />
                Test SMTP Connection & Dispatch Sample Email
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Verify your credentials and network reachability by sending a test alert to any email address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter test receiver email address (e.g. your personal email)"
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="button"
                onClick={handleTestMail}
                disabled={testingMail}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                {testingMail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Test Email
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-xl text-xs font-semibold border flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-red-950/60 text-red-300 border-red-800'
                }`}
              >
                {testResult.success ? <CheckCircle size={18} className="shrink-0 text-emerald-400" /> : <AlertCircle size={18} className="shrink-0 text-red-400" />}
                <div className="flex-1 break-words">{testResult.message}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DETAIL MODAL: VIEW & MANAGE CONTACT SUBMISSION */}
      {/* ======================================================== */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <User size={22} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedSubmission.name}</h2>
                  <p className="text-xs text-slate-500">
                    Submitted on{' '}
                    {new Date(selectedSubmission.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Info Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Email Address:</span>
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Mail size={14} />
                    {selectedSubmission.email}
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Phone Number:</span>
                  {selectedSubmission.phone ? (
                    <a
                      href={`tel:${selectedSubmission.phone}`}
                      className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5"
                    >
                      <Phone size={14} />
                      {selectedSubmission.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Subject:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSubmission.subject || 'General Inquiry'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Shop Name:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSubmission.shopName ? `🏪 ${selectedSubmission.shopName}` : <span className="text-slate-400 italic font-normal">Not provided</span>}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Email Alert Status:</span>
                  <span
                    className={`font-semibold inline-flex items-center gap-1 ${
                      selectedSubmission.emailSent
                        ? 'text-emerald-600'
                        : selectedSubmission.emailError
                        ? 'text-red-500'
                        : 'text-slate-500'
                    }`}
                  >
                    {selectedSubmission.emailSent
                      ? '✓ Sent to receivers'
                      : selectedSubmission.emailError
                      ? `✕ Error: ${selectedSubmission.emailError}`
                      : 'Not dispatched'}
                  </span>
                </div>
              </div>

              {/* Message Box */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Inquiry Message:
                </label>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedSubmission.message}
                </div>
              </div>

              {/* Status Selector & Resend */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Change Status:</span>
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => handleUpdateStatus(selectedSubmission._id, e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="responded">Responded</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleResendAlert(selectedSubmission._id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    Resend Alert Email
                  </button>

                  <a
                    href={`mailto:${selectedSubmission.email}?subject=${encodeURIComponent(
                      selectedSubmission.subject ? `Re: ${selectedSubmission.subject}` : 'Re: Your inquiry on GaliBrand'
                    )}`}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    Reply via Email
                  </a>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Internal Notes (Sysadmin Only):
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder="Add an internal note about this inquiry (e.g. called client on phone, interested in Pro plan)..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="flex-1 p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition self-end"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>
                {selectedSubmission.ipAddress && `IP: ${selectedSubmission.ipAddress}`}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteSubmission(selectedSubmission._id)}
                  className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingContactsTab;
