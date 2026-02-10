'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, X, Search, User, Mail, Phone, Calendar, ExternalLink, Grid, List as ListIcon, Edit2 } from 'lucide-react';

type Tab = 'monitoring' | 'checklist' | 'contract';
type ViewMode = 'list' | 'grid';

interface Item {
  id: string;
  title: string;
  url: string;
  note: string | null;
  category: string | null;
  color: string | null;
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

const COLORS = [
  '#1e293b', // Default Slate
  '#1e3a8a', // Dark Blue
  '#064e3b', // Dark Green
  '#7f1d1d', // Dark Red
  '#581c87', // Dark Purple
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('monitoring');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default per user request/flow? Let's default to list as it's cleaner for many items
  const [items, setItems] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [itemForm, setItemForm] = useState({ title: '', url: '', note: '', color: COLORS[0] });
  const [vendorForm, setVendorForm] = useState({
    vendorName: '', contactName: '', email: '', phone: '',
    contractType: '', expiryDate: '', note: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'contract') {
        const res = await fetch('/checklist/api/vendors');
        setVendors(await res.json());
      } else {
        const res = await fetch('/checklist/api/items');
        const data: Item[] = await res.json();
        const category = activeTab === 'monitoring' ? 'Monitor' : 'Checklist';
        setItems(data.filter(i => i.category === category || (activeTab === 'monitoring' && !i.category)));
      }
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this item?')) return;
    try {
      await fetch(`/checklist/api/items/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteVendor = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Permanently delete this contract?')) return;
    try {
      await fetch(`/checklist/api/vendors/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (e: React.MouseEvent, data: any, type: 'item' | 'vendor') => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(data.id);
    if (type === 'vendor') {
      const v = data as Vendor;
      setVendorForm({
        vendorName: v.vendorName,
        contactName: v.contactName || '',
        email: v.email || '',
        phone: v.phone || '',
        contractType: v.contractType || '',
        expiryDate: v.expiryDate ? new Date(v.expiryDate).toISOString().split('T')[0] : '', // Format for date input
        note: v.note || ''
      });
    } else {
      const i = data as Item;
      setItemForm({
        title: i.title,
        url: i.url,
        note: i.note || '',
        color: i.color || COLORS[0]
      });
    }
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setItemForm({ title: '', url: '', note: '', color: COLORS[0] });
    setVendorForm({ vendorName: '', contactName: '', email: '', phone: '', contractType: '', expiryDate: '', note: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = activeTab === 'contract'
        ? `/checklist/api/vendors${editingId ? `/${editingId}` : ''}`
        : `/checklist/api/items${editingId ? `/${editingId}` : ''}`;

      const body = activeTab === 'contract' ? vendorForm : {
        ...itemForm,
        category: activeTab === 'monitoring' ? 'Monitor' : 'Checklist'
      };

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setShowModal(false);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredItems = items.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredVendors = vendors.filter(v => v.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render Table Row
  const renderItemRow = (item: Item) => (
    <tr key={item.id} style={{ borderLeft: `4px solid ${item.color || COLORS[0]}` }}>
      <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.title}</td>
      <td>
        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {item.url} <ExternalLink size={14} />
        </a>
      </td>
      <td style={{ color: '#94a3b8' }}>{item.note || '-'}</td>
      <td>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="icon-btn" onClick={(e) => handleEdit(e, item, 'item')} style={{ color: '#fbbf24' }}>
            <Edit2 size={18} />
          </button>
          <button className="icon-btn" onClick={(e) => deleteItem(e, item.id)} style={{ color: '#ef4444' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderVendorRow = (v: Vendor) => (
    <tr key={v.id}>
      <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{v.vendorName}</td>
      <td>
        <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
          {v.contractType || '-'}
        </span>
      </td>
      <td style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
        {v.contactName && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><User size={14} /> {v.contactName}</div>}
        {v.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}><Mail size={14} /> {v.email}</div>}
        {v.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {v.phone}</div>}
      </td>
      <td style={{ color: v.expiryDate ? '#fff' : '#94a3b8' }}>
        {v.expiryDate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} /> {new Date(v.expiryDate).toLocaleDateString()}
          </div>
        ) : 'No Expiry'}
      </td>
      <td style={{ color: '#94a3b8', fontStyle: 'italic' }}>{v.note || '-'}</td>
      <td>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="icon-btn" onClick={(e) => handleEdit(e, v, 'vendor')} style={{ color: '#fbbf24' }}>
            <Edit2 size={18} />
          </button>
          <button className="icon-btn" onClick={(e) => deleteVendor(e, v.id)} style={{ color: '#ef4444' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  // Render Card Grid
  const renderItemCard = (item: Item) => (
    <a
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      style={{ background: item.color || undefined }}
    >
      <div className="card-actions">
        <button className="icon-btn" onClick={(e) => handleEdit(e, item, 'item')}><Edit2 size={16} /></button>
        <button className="icon-btn" onClick={(e) => deleteItem(e, item.id)}><Trash2 size={16} /></button>
      </div>
      <h3 className="card-title">{item.title}</h3>
      {item.note && <p className="card-note">{item.note}</p>}
    </a>
  );

  const renderVendorCard = (v: Vendor) => (
    <div key={v.id} className="card" style={{ cursor: 'default' }}>
      <div className="card-actions">
        <button className="icon-btn" onClick={(e) => handleEdit(e, v, 'vendor')}><Edit2 size={16} /></button>
        <button className="icon-btn" onClick={(e) => deleteVendor(e, v.id)}><Trash2 size={16} /></button>
      </div>
      <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{v.vendorName}</h3>
      <div style={{ width: '100%', textAlign: 'left', padding: '0 1rem' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#60a5fa' }}><strong>Type:</strong> {v.contractType || '-'}</p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Contact:</strong> {v.contactName || '-'}</p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><strong>Exp:</strong> {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : 'None'}</p>
        {v.note && <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.85rem', color: '#94a3b8' }}>{v.note}</p>}
      </div>
    </div>
  );

  return (
    <main className="container">
      <header className="header">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {activeTab === 'monitoring' ? 'System Monitor' : activeTab === 'checklist' ? 'All Check list' : 'Vendor Contracts'}
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#3b82f6' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <ListIcon size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                color: 'white',
                border: 'none',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Grid size={20} />
            </button>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add New
          </button>
        </div>
      </header>

      <div className="tabs">
        <div className={`tab ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>Monitoring</div>
        <div className={`tab ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>Check List</div>
        <div className={`tab ${activeTab === 'contract' ? 'active' : ''}`} onClick={() => setActiveTab('contract')}>Vendor Contract</div>
      </div>

      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#64748b' }} />
        <input
          className="search-input"
          placeholder="Search..."
          style={{ paddingLeft: '3rem', marginBottom: 0 }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'list' ? (
        <div className="table-container">
          <table>
            <thead>
              {activeTab === 'contract' ? (
                <tr>
                  <th style={{ width: '20%' }}>Vendor Name</th>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '25%' }}>Contact Info</th>
                  <th style={{ width: '15%' }}>Expiry Date</th>
                  <th style={{ width: '15%' }}>Note</th>
                  <th style={{ width: '10%' }}>Action</th>
                </tr>
              ) : (
                <tr>
                  <th style={{ width: '30%' }}>System Name</th>
                  <th style={{ width: '40%' }}>URL</th>
                  <th style={{ width: '20%' }}>Note</th>
                  <th style={{ width: '10%' }}>Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'contract'
                ? filteredVendors.map(renderVendorRow)
                : filteredItems.map(renderItemRow)
              }
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid">
          {activeTab === 'contract'
            ? filteredVendors.map(renderVendorCard)
            : filteredItems.map(renderItemCard)
          }
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{editingId ? 'Edit' : 'Add New'} {activeTab === 'contract' ? 'Vendor' : 'Link'}</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X /></button>
            </div>

            {activeTab === 'contract' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Vendor Name *</label>
                  <input value={vendorForm.vendorName} onChange={e => setVendorForm({ ...vendorForm, vendorName: e.target.value })} />
                </div>
                <div>
                  <label>Service / Contract Type</label>
                  <input placeholder="e.g. MA, License" value={vendorForm.contractType} onChange={e => setVendorForm({ ...vendorForm, contractType: e.target.value })} />
                </div>
                <div>
                  <label>Expiry Date</label>
                  <input type="date" value={vendorForm.expiryDate} onChange={e => setVendorForm({ ...vendorForm, expiryDate: e.target.value })} />
                </div>
                <div>
                  <label>Contact Person</label>
                  <input value={vendorForm.contactName} onChange={e => setVendorForm({ ...vendorForm, contactName: e.target.value })} />
                </div>
                <div>
                  <label>Phone</label>
                  <input value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Email</label>
                  <input type="email" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Note / Description</label>
                  <textarea rows={3} value={vendorForm.note} onChange={e => setVendorForm({ ...vendorForm, note: e.target.value })} />
                </div>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Title *</label>
                  <input autoFocus value={itemForm.title} onChange={e => setItemForm({ ...itemForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>URL *</label>
                  <input placeholder="https://..." value={itemForm.url} onChange={e => setItemForm({ ...itemForm, url: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Description / Note</label>
                  <textarea rows={3} value={itemForm.note} onChange={e => setItemForm({ ...itemForm, note: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Background Color</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {COLORS.map(color => (
                      <div
                        key={color}
                        onClick={() => setItemForm({ ...itemForm, color })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: itemForm.color === color ? '3px solid white' : '2px solid transparent',
                          boxShadow: itemForm.color === color ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleSave}>
              Save Data
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
