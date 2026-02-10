'use client';

import { useEffect, useState } from 'react';
import {
  ExternalLink, Plus, RefreshCw, Search,
  ShieldCheck, FileCheck, Users, Trash2,
  X, Mail, Phone, Calendar, Info
} from 'lucide-react';

type Tab = 'monitoring' | 'checklist' | 'contract';

interface Item {
  id: string;
  title: string;
  url: string;
  note: string | null;
  category: string | null;
  status: string;
  lastChecked: string | null;
}

interface Vendor {
  id: string;
  vendorName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  contractType: string | null;
  expiryDate: string | null;
  note: string | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('monitoring');
  const [items, setItems] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Forms data
  const [linkForm, setLinkForm] = useState({ title: '', url: '', note: '' });
  const [vendorForm, setVendorForm] = useState({
    vendorName: '', contactName: '', email: '', phone: '',
    contractType: '', expiryDate: '', note: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contract') {
        const res = await fetch('/checklist/api/vendors');
        setVendors(await res.json());
      } else {
        const category = activeTab === 'monitoring' ? 'Monitor' : 'Checklist';
        const res = await fetch('/checklist/api/items');
        const data: Item[] = await res.json();
        setItems(data.filter(i => i.category === category || (activeTab === 'monitoring' && !i.category)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    try {
      await fetch('/checklist/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...linkForm,
          category: activeTab === 'monitoring' ? 'Monitor' : 'Checklist'
        }),
      });
      setShowModal(false);
      setLinkForm({ title: '', url: '', note: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleAddVendor = async () => {
    try {
      await fetch('/checklist/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm),
      });
      setShowModal(false);
      setVendorForm({
        vendorName: '', contactName: '', email: '', phone: '',
        contractType: '', expiryDate: '', note: ''
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.note && i.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredVendors = vendors.filter(v =>
    v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.contactName && v.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="container">
      {/* Header */}
      <header className="header">
        <div className="title-group">
          <h1>All Check List</h1>
          <p style={{ color: 'var(--text-muted)' }}>Excel Checklist Dashboard</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add {activeTab === 'contract' ? 'Vendor' : 'Link'}
        </button>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        <div className={`tab ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
          <ShieldCheck size={18} style={{ marginInlineEnd: '8px' }} /> Monitoring
        </div>
        <div className={`tab ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>
          <FileCheck size={18} style={{ marginInlineEnd: '8px' }} /> Check List
        </div>
        <div className={`tab ${activeTab === 'contract' ? 'active' : ''}`} onClick={() => setActiveTab('contract')}>
          <Users size={18} style={{ marginInlineEnd: '8px' }} /> Contract Vendor
        </div>
      </nav>

      {/* Search */}
      <div className="search-container">
        <Search className="search-icon" style={{ position: 'absolute', left: '1.25rem', top: '1.1rem', color: 'var(--text-muted)' }} />
        <input
          className="search-input"
          placeholder={`Search ${activeTab === 'contract' ? 'vendors' : 'links'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading...</div>
      ) : activeTab === 'contract' ? (
        /* VENDOR CONTRACT TABLE */
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Contact Name</th>
                <th>Email / Phone</th>
                <th>Type</th>
                <th>Expiry Date</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700 }}>{v.vendorName}</td>
                  <td>{v.contactName || '-'}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {v.email || '-'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {v.phone || '-'}</div>
                    </div>
                  </td>
                  <td><span className="status-pill status-OK">{v.contractType || 'N/A'}</span></td>
                  <td>{v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : 'No Limit'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* MONITORING & CHECKLIST GRID */
        <div className="grid">
          <div className="card card-add" onClick={() => setShowModal(true)}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}>
              <Plus size={32} />
            </div>
            <p style={{ fontWeight: 700 }}>Add New</p>
          </div>
          {filteredItems.map(item => (
            <div key={item.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.title}</h3>
                <span className={`status-pill status-${item.status}`}>{item.status}</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{item.url}</p>
              {item.note && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Info size={14} style={{ display: 'inline', marginInlineEnd: '4px' }} /> {item.note}
                </div>
              )}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <ExternalLink size={16} /> Open Link
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2>Add New {activeTab === 'contract' ? 'Vendor' : 'Link'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X /></button>
            </div>

            {activeTab === 'contract' ? (
              <>
                <div className="form-group">
                  <label>Vendor Name</label>
                  <input value={vendorForm.vendorName} onChange={e => setVendorForm({ ...vendorForm, vendorName: e.target.value })} />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Contact Person</label>
                    <input value={vendorForm.contactName} onChange={e => setVendorForm({ ...vendorForm, contactName: e.target.value })} />
                  </div>
                  <div>
                    <label>Contract Type</label>
                    <input value={vendorForm.contractType} onChange={e => setVendorForm({ ...vendorForm, contractType: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Email</label>
                    <input type="email" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={vendorForm.expiryDate} onChange={e => setVendorForm({ ...vendorForm, expiryDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <textarea value={vendorForm.note} onChange={e => setVendorForm({ ...vendorForm, note: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddVendor}>Save Contract</button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Title</label>
                  <input value={linkForm.title} onChange={e => setLinkForm({ ...linkForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>URL</label>
                  <input value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Note</label>
                  <textarea value={linkForm.note} onChange={e => setLinkForm({ ...linkForm, note: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddLink}>Save Link</button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
