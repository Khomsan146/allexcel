'use client';

import { useEffect, useState } from 'react';
import { Trash2, Plus, X, Search } from 'lucide-react';

type Tab = 'monitoring' | 'checklist' | 'contract';

interface Item {
  id: string;
  title: string;
  url: string;
  note: string | null;
  category: string | null;
}

export default function SimpleDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('monitoring');
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', note: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const res = await fetch('/checklist/api/items');
      const data: Item[] = await res.json();
      const category = activeTab === 'monitoring' ? 'Monitor' : 'Checklist';
      setItems(data.filter(i => i.category === category || (activeTab === 'monitoring' && !i.category)));
    } catch (err) { console.error(err); }
  };

  const addItem = async () => {
    try {
      await fetch('/checklist/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: activeTab === 'monitoring' ? 'Monitor' : 'Checklist'
        }),
      });
      setShowModal(false);
      setFormData({ title: '', url: '', note: '' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this?')) return;
    try {
      await fetch(`/checklist/api/items/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredItems = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container">
      <header className="header">
        <h1 style={{ fontSize: '1.5rem' }}>URL Monitor</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add New
        </button>
      </header>

      <nav className="tabs">
        <div className={`tab ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>Monitoring</div>
        <div className={`tab ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>Check List</div>
        <div className={`tab ${activeTab === 'contract' ? 'active' : ''}`} onClick={() => setActiveTab('contract')}>Vendor Contract</div>
      </nav>

      <input
        className="search-input"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <div className="grid">
        {filteredItems.map(item => (
          <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="card">
            <button className="delete-btn" onClick={(e) => deleteItem(e, item.id)}>
              <Trash2 size={16} />
            </button>
            <div className="card-title">{item.title}</div>
            {item.note && <div className="card-note">{item.note}</div>}
          </a>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Add New Link</h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X /></button>
            </div>
            <label>Name</label>
            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <label>URL</label>
            <input value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} />
            <label>Note</label>
            <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={addItem}>Save</button>
          </div>
        </div>
      )}
    </main>
  );
}
