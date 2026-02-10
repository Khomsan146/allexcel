'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Plus, RefreshCw, Settings, FileSpreadsheet, Trash2, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  url: string;
  note: string | null;
  category: string | null;
  status: string;
  lastChecked: string | null;
}

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', url: '', note: '', category: 'General' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Health check
      await fetch('/checklist/api/check', { method: 'POST' }).catch(e => console.error(e));

      const res = await fetch('/checklist/api/items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/checklist/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: '', url: '', note: '', category: 'General' });
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`/checklist/api/items/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('/checklist/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchItems();
        alert('Items imported successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1 className="title">System URL Monitor</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Checklist monitoring and management console</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={`btn ${isAdmin ? 'btn-primary' : 'btn-outline'}`} onClick={() => setIsAdmin(!isAdmin)}>
            <Settings size={18} />
            {isAdmin ? 'Admin Mode' : 'View Mode'}
          </button>
          <button className="btn btn-primary" onClick={fetchItems} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Check Now
          </button>
        </div>
      </header>

      {isAdmin && (
        <div className="admin-panel">
          <div className="admin-section">
            <h3>Add New Link</h3>
            <form onSubmit={handleAddItem}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  placeholder="Website Name"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <input
                  placeholder="URL (https://...)"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>
              <textarea
                placeholder="Notes / Description..."
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                rows={2}
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={18} /> Add to List
              </button>
            </form>
          </div>
          <div className="admin-section">
            <h3>Import From Excel</h3>
            <div className="upload-box">
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="excel-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FileSpreadsheet size={32} style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: '500' }}>Upload .xlsx File</span>
                <span style={{ fontSize: '0.8rem' }}>Columns: Title, URL, Note</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          style={{ paddingLeft: '3rem', margin: 0 }}
          placeholder="Search links or categories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>System Name</th>
              <th>Status</th>
              <th>URL</th>
              <th>Notes</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category || 'General'}</div>
                </td>
                <td>
                  <span className={`badge badge-${item.status}`}>
                    {item.status === 'OK' && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                    {item.status === 'Error' && <XCircle size={12} style={{ marginRight: '4px' }} />}
                    {item.status === 'Unknown' && <AlertCircle size={12} style={{ marginRight: '4px' }} />}
                    {item.status}
                  </span>
                </td>
                <td>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }} className="truncate">
                    {item.url}
                  </a>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.note || '-'}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.4rem' }}>
                      <ExternalLink size={16} />
                    </a>
                    {isAdmin && (
                      <button className="btn btn-outline" onClick={() => deleteItem(item.id)} style={{ padding: '0.4rem', color: '#dc2626' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  No items found. {isAdmin ? 'Add some links above!' : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        Last sync: {new Date().toLocaleString()}
      </div>
    </main >
  );
}
