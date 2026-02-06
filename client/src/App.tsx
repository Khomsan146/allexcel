import { useState, useEffect } from 'react';
import { Plus, X, Trash2, ExternalLink } from 'lucide-react';
import './index.css';

interface Link {
  id: number;
  url: string;
  title: string;
}

function App() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ url: '', title: '' });
  const [loading, setLoading] = useState(false);

  // Use environment variable for API URL in production
  // In development, we can rely on proxy (setup in vite.config.ts) or hardcode
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/links';

  const fetchLinks = async () => {
    try {
      const res = await fetch(API_URL);
      const result = await res.json();
      if (result.message === 'success') {
        setLinks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      setIsModalOpen(false);
      setNewItem({ url: '', title: '' });
      fetchLinks();
    } catch (error) {
      console.error('Error adding link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      await fetch(`${API_URL.replace('/api/links', '/api/links')}/${id}`, { method: 'DELETE' });
      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return '';
    }
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }} className="title-gradient">All Check List</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Excel Checklist Dashboard</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={20} /> Add Link
        </button>
      </header>

      <div className="card-grid">
        {links.map((link) => (
          <div
            key={link.id}
            className="glass link-card"
            onClick={() => window.open(link.url, '_blank')}
          >
            <button className="delete-btn" onClick={(e) => handleDelete(e, link.id)}>
              <Trash2 size={16} />
            </button>
            <div className="link-icon-container">
              <img
                src={getFavicon(link.url)}
                alt="icon"
                className="link-icon"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <h3 className="link-title">{link.title || link.url}</h3>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <ExternalLink size={14} />
              {(() => {
                try { return new URL(link.url).hostname.replace('www.', '') } catch { return link.url }
              })()}
            </div>
          </div>
        ))}

        <div className="glass link-card add-card" onClick={() => setIsModalOpen(true)}>
          <div className="link-icon-container" style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
            <Plus size={32} color="var(--accent)" />
          </div>
          <h3 className="link-title" style={{ color: 'var(--accent)' }}>Add New</h3>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="glass modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>Add New Link</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Title (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="My Dashboard"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
