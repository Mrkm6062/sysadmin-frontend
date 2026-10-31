import React, { useState, useEffect, useRef } from 'react';
import { formatPolicyHtml } from '../utils/policyFormatter';
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  Sparkles, 
  Check, 
  BookOpen, 
  HelpCircle 
} from 'lucide-react';

const STANDARD_PLATFORM_TEMPLATES = {
  privacy: {
    title: "Platform Privacy Policy",
    content: `<h2>1. Introduction & Scope</h2>
<p>Welcome to <strong>GaliBrand</strong> ("we", "our", or "the Platform"). This Privacy Policy outlines how we collect, store, safeguard, and process information when store owners and visitors access our cloud e-commerce services.</p>

<h2>2. Information We Collect</h2>
<p>We collect essential operational data to maintain and secure the platform:</p>
<ul>
  <li><strong>Account Credentials:</strong> Store owner full name, email address, contact phone, and store branding assets.</li>
  <li><strong>Storefront Configuration:</strong> Product catalogs, inventory counts, store policies, custom domain records, and staff accounts.</li>
  <li><strong>Transaction Metadata:</strong> Order IDs, amounts, shipment tracking numbers, and delivery timestamps processed across stores.</li>
</ul>

<h2>3. Payment Security & RBI Standards</h2>
<p>GaliBrand <strong>does not store</strong> credit/debit card numbers, CVVs, or banking PINs. All payment transactions are securely encrypted and routed through authorized, RBI-compliant payment gateway partners (such as Razorpay, Cashfree, or Stripe).</p>

<h2>4. Data Retention & Safeguards</h2>
<p>We deploy SSL/TLS encryption, automated backups, and access-controlled server environments to guard your business data against unauthorized access or breaches.</p>

<blockquote>Note: Each store owner acts as an independent merchant regarding their own customer relations and must publish their own store-specific policies.</blockquote>

<h2>5. Inquiries & Data Rights</h2>
<p>For questions or data deletion inquiries regarding platform accounts, reach out to our platform support team at <strong>support@galibrand.cloud</strong>.</p>`
  },
  terms: {
    title: "Platform Terms of Service",
    content: `<h2>1. Acceptance of Terms</h2>
<p>By creating a store account on <strong>GaliBrand</strong>, you agree to comply with and be bound by these <strong>Terms of Service</strong> and all platform operating guidelines.</p>

<h2>2. Merchant Responsibilities</h2>
<ul>
  <li>You are solely responsible for all products, customer support, legal compliance, and order fulfillment offered on your store.</li>
  <li>You must not sell or display counterfeit, illegal, defamatory, or restricted merchandise.</li>
  <li>You agree to keep your dashboard login credentials and staff access tokens confidential and secure.</li>
</ul>

<h2>3. SaaS Subscriptions & Billing</h2>
<p>Access to advanced platform features, custom domain routing, and tiered staff quotas are provided under monthly or annual subscription plans. Subscriptions renew automatically unless cancelled prior to the renewal date.</p>

<h2>4. Limitation of Liability</h2>
<p>GaliBrand provides SaaS software on an "as is" and "as available" basis. We are not liable for direct, indirect, or consequential damages resulting from courier delivery disruptions, merchant disputes, or payment gateway outages.</p>`
  },
  refund: {
    title: "Platform Subscription & Refund Policy",
    content: `<h2>1. Platform Subscription Refunds</h2>
<p>At <strong>GaliBrand</strong>, our goal is to empower entrepreneurs with robust e-commerce tools. This policy governs platform plan subscriptions and service fees.</p>

<h2>2. 7-Day Money-Back Guarantee</h2>
<p>If you subscribe to a paid platform plan and find that GaliBrand does not meet your operational requirements, you may submit a refund request within <strong>7 days</strong> of your initial upgrade.</p>

<h2>3. Non-Refundable Platform Fees</h2>
<ul>
  <li>Third-party domain purchase and DNS registry costs once registered.</li>
  <li>Payment gateway processing charges incurred during transactions.</li>
  <li>Subscription renewal cycles following the initial 7-day evaluation window.</li>
</ul>

<h2>4. Storefront Customer Refunds</h2>
<blockquote>Important Notice: Customer refunds for orders placed on individual merchant storefronts are handled directly by each store owner according to their own Store Return Policy.</blockquote>`
  },
  cookies: {
    title: "Platform Cookies Policy",
    content: `<h2>1. Cookie Usage Overview</h2>
<p>We use cookies and browser local storage to maintain authenticated dashboard sessions, remember preferences, and improve page load speeds.</p>

<h2>2. Types of Cookies Used</h2>
<ul>
  <li><strong>Essential Authentication Cookies:</strong> Required to keep store owners, managers, and staff securely logged in.</li>
  <li><strong>Storefront Shopping Cookies:</strong> Used to temporarily store customer carts and checkout session preferences.</li>
  <li><strong>Performance & Telemetry:</strong> Anonymized metrics to identify server bottlenecks and optimize platform speed.</li>
</ul>

<h2>3. Managing Cookie Preferences</h2>
<p>You can clear or configure cookies through your browser settings. However, disabling essential session cookies may prevent you from logging into your dashboard terminal.</p>`
  },
  acceptable_use: {
    title: "Acceptable Use Policy",
    content: `<h2>1. Acceptable Use Standards</h2>
<p>All stores hosted on the <strong>GaliBrand</strong> SaaS infrastructure must adhere to ethical commerce practices and applicable laws.</p>

<h2>2. Strictly Prohibited Activities</h2>
<ul>
  <li>Selling counterfeit goods, stolen assets, or trademark-infringing items.</li>
  <li>Listing weapons, toxic chemicals, or hazardous contraband.</li>
  <li>Running deceptive pyramid schemes, fake sweepstakes, or phishing websites.</li>
  <li>Distributing malware, spam, or interfering with platform server infrastructure.</li>
</ul>

<h2>3. Violations & Termination</h2>
<p>GaliBrand reserves the right to immediately suspend or permanently terminate stores that violate this Acceptable Use Policy without prior notice.</p>`
  },
  disclaimer: {
    title: "Platform Disclaimer",
    content: `<h2>1. General Disclaimer</h2>
<p>All information, features, and tools provided across <strong>GaliBrand</strong> are provided "as is" without warranty of any kind, either express or implied.</p>

<h2>2. Third-Party Integrations</h2>
<p>GaliBrand connects with external courier APIs, payment gateways, and communication services (WhatsApp, SMS, SMTP). We are not responsible for downtimes or delays caused by third-party infrastructure providers.</p>`
  }
};

const PoliciesTab = () => {
  const [policies, setPolicies] = useState([]);
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({ 
    type: 'privacy', 
    title: 'Platform Privacy Policy', 
    content: STANDARD_PLATFORM_TEMPLATES.privacy.content, 
    version: '1.0', 
    isActive: true 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState('write'); // 'write' | 'preview'
  const [viewingPolicy, setViewingPolicy] = useState(null);

  const textareaRef = useRef(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/policies`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter(p => !p.type.toLowerCase().startsWith('salary') && !p.type.toLowerCase().startsWith('commission'));
        setPolicies(filtered);
      }
    } catch (err) {
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  // Text selection formatting helper
  const applyFormat = (openTag, closeTag, placeholder = 'Text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = policyForm.content;
    const selected = text.substring(start, end);

    let replacement = '';
    if (selected.length > 0) {
      if (openTag === '<ul>' || openTag === '<ol>') {
        const lines = selected.split(/\r?\n/).filter(l => l.trim().length > 0);
        const listItems = lines.map(line => `  <li>${line.replace(/^[•*\-]\s*/, '')}</li>`).join('\n');
        replacement = `\n${openTag}\n${listItems}\n${closeTag}\n`;
      } else {
        replacement = `${openTag}${selected}${closeTag}`;
      }
    } else {
      if (openTag === '<ul>') {
        replacement = `\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>\n`;
      } else if (openTag === '<ol>') {
        replacement = `\n<ol>\n  <li>Step 1</li>\n  <li>Step 2</li>\n</ol>\n`;
      } else {
        replacement = `${openTag}${placeholder}${closeTag}`;
      }
    }

    const nextVal = text.substring(0, start) + replacement + text.substring(end);
    setPolicyForm(prev => ({ ...prev, content: nextVal }));

    setTimeout(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const handleTypeChange = (newType) => {
    const tpl = STANDARD_PLATFORM_TEMPLATES[newType];
    const shouldLoadTemplate = !policyForm.content || policyForm.content === STANDARD_PLATFORM_TEMPLATES[policyForm.type]?.content;

    setPolicyForm(prev => ({
      ...prev,
      type: newType,
      title: shouldLoadTemplate && tpl ? tpl.title : prev.title,
      content: shouldLoadTemplate && tpl ? tpl.content : prev.content
    }));
  };

  const handleLoadTemplate = (templateKey) => {
    const tpl = STANDARD_PLATFORM_TEMPLATES[templateKey];
    if (!tpl) return;
    if (policyForm.content.trim() && !window.confirm(`Load standard "${tpl.title}" template? Current content will be replaced.`)) {
      return;
    }
    setPolicyForm(prev => ({
      ...prev,
      type: templateKey,
      title: tpl.title,
      content: tpl.content
    }));
    setEditorMode('write');
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/policies`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(policyForm) 
      });
      if (response.ok) {
        const savedPolicy = await response.json();
        setPolicies(prev => {
          const exists = prev.find(p => p.type === savedPolicy.type);
          if (exists) return prev.map(p => p.type === savedPolicy.type ? savedPolicy : p);
          return [...prev, savedPolicy];
        });
        setSuccess('✅ Platform policy saved successfully!');
        setIsPolicyFormOpen(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save policy');
      }
    } catch (err) { 
      setError('Network error while saving policy'); 
    }
  };

  const editPolicy = (policy) => {
    setPolicyForm({ 
      type: policy.type, 
      title: policy.title, 
      content: policy.content, 
      version: policy.version || '1.0', 
      isActive: policy.isActive !== undefined ? policy.isActive : true 
    });
    setIsPolicyFormOpen(true);
    setEditorMode('write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("Are you sure you want to delete this platform policy?")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/policies/${policyId}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (response.ok) {
        setPolicies(policies.filter(p => p._id !== policyId));
        setSuccess('✅ Platform policy deleted successfully');
      }
    } catch (err) { 
      setError('Network error while deleting policy'); 
    }
  };

  const startCreatePolicy = () => {
    setPolicyForm({ 
      type: 'privacy', 
      title: STANDARD_PLATFORM_TEMPLATES.privacy.title, 
      content: STANDARD_PLATFORM_TEMPLATES.privacy.content, 
      version: '1.0', 
      isActive: true 
    });
    setIsPolicyFormOpen(true);
    setEditorMode('write');
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading Policies...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" />
            Platform Legal Policies
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage terms, privacy, and refund policies displayed across the platform footer and store owner dashboard.
          </p>
        </div>
        <button 
          onClick={() => {
            if (isPolicyFormOpen) {
              setIsPolicyFormOpen(false);
            } else {
              startCreatePolicy();
            }
          }} 
          className={`px-5 py-2.5 font-bold rounded-xl transition flex items-center gap-1.5 text-sm shadow-md ${isPolicyFormOpen ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
        >
          {isPolicyFormOpen ? 'Cancel' : '+ Add / Edit Policy'}
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-medium text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 font-medium text-sm">{success}</div>}

      {/* Policy Form */}
      {isPolicyFormOpen && (
        <form onSubmit={handleSavePolicy} className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 mb-8 space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Edit3 size={18} className="text-blue-600" />
              Configure Policy Details
            </h3>

            {/* Quick Templates Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Sparkles size={14} className="text-blue-600" /> Load Template:
              </span>
              <select 
                onChange={(e) => { if (e.target.value) handleLoadTemplate(e.target.value); e.target.value = ''; }}
                className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 transition cursor-pointer shadow-sm"
                defaultValue=""
              >
                <option value="" disabled>Choose Platform Policy Template...</option>
                <option value="privacy">Privacy Policy</option>
                <option value="terms">Terms of Service</option>
                <option value="refund">Subscription Refund Policy</option>
                <option value="cookies">Cookies Policy</option>
                <option value="acceptable_use">Acceptable Use Policy</option>
                <option value="disclaimer">Platform Disclaimer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Policy Type</label>
              <select 
                value={policyForm.type} 
                onChange={e => handleTypeChange(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
              >
                <option value="privacy">Privacy Policy</option>
                <option value="terms">Terms of Service</option>
                <option value="refund">Refund Policy</option>
                <option value="cookies">Cookies Policy</option>
                <option value="acceptable_use">Acceptable Use</option>
                <option value="disclaimer">Disclaimer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
              <input 
                type="text" 
                value={policyForm.title} 
                onChange={e => setPolicyForm({...policyForm, title: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" 
                required 
                placeholder="e.g. Platform Privacy Policy" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Version</label>
              <input 
                type="text" 
                value={policyForm.version} 
                onChange={e => setPolicyForm({...policyForm, version: e.target.value})} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" 
                required 
                placeholder="e.g. 1.0" 
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                Policy Content (HTML / Markdown Supported)
              </label>

              {/* Write vs Preview Mode Toggle */}
              <div className="flex items-center p-0.5 bg-slate-200 rounded-lg">
                <button 
                  type="button" 
                  onClick={() => setEditorMode('write')} 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${editorMode === 'write' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Edit3 size={12} /> Write
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditorMode('preview')} 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${editorMode === 'preview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Eye size={12} /> Live Preview
                </button>
              </div>
            </div>

            {editorMode === 'write' ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition bg-white">
                {/* Rich Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100/70 border-b border-slate-200 text-slate-700">
                  {/* Bold */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('<strong>', '</strong>', 'Bold text')} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-700" 
                    title="Bold Text (<strong>...</strong>)"
                  >
                    <Bold size={16} />
                  </button>

                  {/* Italic */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('<em>', '</em>', 'Italic text')} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-700" 
                    title="Italic (<em>...</em>)"
                  >
                    <Italic size={16} />
                  </button>

                  {/* Underline */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('<u>', '</u>', 'Underlined text')} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-700" 
                    title="Underline (<u>...</u>)"
                  >
                    <Underline size={16} />
                  </button>

                  <span className="w-px h-5 bg-slate-300 mx-1"></span>

                  {/* Heading 2 */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('\n<h2>', '</h2>\n', 'Section Heading')} 
                    className="px-2 py-1 hover:bg-slate-200 rounded-lg transition font-extrabold text-xs text-slate-700 flex items-center gap-0.5" 
                    title="Main Heading (<h2>...</h2>)"
                  >
                    <Heading2 size={16} />
                  </button>

                  {/* Heading 3 */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('\n<h3>', '</h3>\n', 'Sub Heading')} 
                    className="px-2 py-1 hover:bg-slate-200 rounded-lg transition font-extrabold text-xs text-slate-700 flex items-center gap-0.5" 
                    title="Sub Heading (<h3>...</h3>)"
                  >
                    <Heading3 size={16} />
                  </button>

                  <span className="w-px h-5 bg-slate-300 mx-1"></span>

                  {/* Bullet List */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('<ul>', '</ul>', '')} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-700" 
                    title="Bullet List (<ul><li>...</li></ul>)"
                  >
                    <List size={16} />
                  </button>

                  {/* Numbered List */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('<ol>', '</ol>', '')} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-700" 
                    title="Numbered List (<ol><li>...</li></ol>)"
                  >
                    <ListOrdered size={16} />
                  </button>

                  {/* Quote */}
                  <button 
                    type="button" 
                    onClick={() => applyFormat('\n<blockquote>', '</blockquote>\n', 'Important note or terms callout')} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-700" 
                    title="Callout Box (<blockquote>...</blockquote>)"
                  >
                    <Quote size={16} />
                  </button>

                  <span className="text-[11px] text-slate-400 ml-auto hidden sm:inline-block">
                    Highlight text and click buttons to format
                  </span>
                </div>

                {/* Textarea */}
                <textarea 
                  ref={textareaRef}
                  value={policyForm.content} 
                  onChange={e => setPolicyForm({...policyForm, content: e.target.value})} 
                  className="w-full p-4 outline-none text-sm font-mono leading-relaxed h-72 resize-y bg-white" 
                  required 
                  placeholder="Enter policy text or HTML tags..." 
                />
              </div>
            ) : (
              /* Live Storefront / Dashboard Preview */
              <div className="border border-slate-200 rounded-2xl p-6 bg-white min-h-[300px] max-h-[500px] overflow-y-auto shadow-sm">
                <div className="mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Rendered Preview
                  </span>
                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Check size={14} /> Headings, Bold & Lists Formatted
                  </span>
                </div>
                {policyForm.content.trim() ? (
                  <div 
                    className="policy-rendered-content text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatPolicyHtml(policyForm.content) }} 
                  />
                ) : (
                  <p className="text-slate-400 italic text-center py-10">
                    Policy content is empty. Type in Write mode or load a template to preview.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
              <input 
                type="checkbox" 
                checked={policyForm.isActive} 
                onChange={e => setPolicyForm({...policyForm, isActive: e.target.checked})} 
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" 
              />
              Active (Visible in Platform Footer & Dashboard)
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm"
            >
              Save Platform Policy
            </button>
            <button 
              type="button" 
              onClick={() => setIsPolicyFormOpen(false)}
              className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Policies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map(policy => (
          <div key={policy._id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition bg-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  {policy.type.replace('_', ' ')}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${policy.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                  {policy.isActive ? 'Active' : 'Draft'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{policy.title}</h3>
              
              {/* Formatted snippet */}
              <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-36 overflow-hidden relative">
                <div 
                  className="policy-rendered-content text-xs text-slate-600 leading-relaxed pointer-events-none select-none opacity-80"
                  dangerouslySetInnerHTML={{ __html: formatPolicyHtml(policy.content) }}
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-4 mt-2">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold text-slate-600">
                v{policy.version}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewingPolicy(policy)} 
                  className="text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-bold transition text-xs flex items-center gap-1"
                >
                  <Eye size={12} /> View
                </button>
                <button 
                  onClick={() => editPolicy(policy)} 
                  className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition text-xs flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button 
                  onClick={() => handleDeletePolicy(policy._id)} 
                  className="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 font-bold transition text-xs flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {policies.length === 0 && !isPolicyFormOpen && (
          <div className="col-span-2 text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-700 text-base mb-1">No platform policies created yet</p>
            <p className="text-xs text-slate-400 mb-4">Click below to initialize standard Privacy, Terms, and Refund policies.</p>
            <button 
              onClick={startCreatePolicy} 
              className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm shadow-md"
            >
              + Create First Platform Policy
            </button>
          </div>
        )}
      </div>

      {/* View Full Policy Modal */}
      {viewingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{viewingPolicy.title}</h3>
                  <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                    {viewingPolicy.type.replace('_', ' ')} • Version {viewingPolicy.version}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setViewingPolicy(null)} 
                className="text-slate-400 hover:text-red-500 transition text-3xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <div 
                className="policy-rendered-content text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatPolicyHtml(viewingPolicy.content) }} 
              />
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center sticky bottom-0">
              <button 
                onClick={() => {
                  const p = viewingPolicy;
                  setViewingPolicy(null);
                  editPolicy(p);
                }} 
                className="px-4 py-2 font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition text-xs flex items-center gap-1"
              >
                <Edit3 size={13} /> Edit Policy
              </button>
              <button 
                onClick={() => setViewingPolicy(null)} 
                className="px-5 py-2 font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliciesTab;
