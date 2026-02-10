'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Plus, RefreshCw, Settings, FileSpreadsheet, Trash2, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', note: '', category: 'General' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // First, trigger a health check
      await fetch('/checklist/api/check', { method: 'POST' }).catch(e => console.error('Check failed', e));

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
        setShowAddModal(false);
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
    }
  };

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1 className="title">System Checklist</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitoring and URL management console</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setIsAdmin(!isAdmin)}>
            <Settings size={18} />
            {isAdmin ? 'Exit Admin' : 'Admin Panel'}
          </button>
          <button className="btn btn-primary" onClick={fetchItems}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {isAdmin && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Import from Excel</h3>
            <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', borderStyle: 'dashed' }}>
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="excel-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <FileSpreadsheet size={40} color="var(--primary)" />
                <span>Click to upload Excel file</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>(Columns: Title, URL, Note, Category)</span>
              </label>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add New Link</h3>
            <form onSubmit={handleAddItem}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  placeholder="Title"
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
                placeholder="Note / Description"
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                style={{ marginTop: '1rem', height: '60px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                <Plus size={18} /> Add Item
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Loading checklist items...</div>
      ) : (
        <div className="checklist-grid">
          {items.map((item) => (
            <div key={item.id} className="glass card glass-hover">
              <div className={`status-indicator status-${item.status}`}></div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.5, fontWeight: 'bold' }}>
                  {item.category || 'General'}
                </span>
                <h3 className="card-title">{item.title}</h3>
              </div>
              <div className="card-url">{item.url}</div>
              {item.note && <div className="card-note">{item.note}</div>}

              <div className="card-actions">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <ExternalLink size={16} /> Open
                </a>
                {isAdmin && (
                  <button className="btn btn-outline" onClick={() => deleteItem(item.id)} style={{ color: 'var(--error)' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem' }}>
                Last checked: {item.lastChecked ? new Date(item.lastChecked).toLocaleString() : 'Never'}
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
              No items found. Use Admin Panel to add links or upload Excel.
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </main>
  );
}
