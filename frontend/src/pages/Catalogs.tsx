import React, { useState, useEffect } from 'react';

interface CatalogItem {
  id?: string | number;
  name: string;
  description?: string;
  number_code?: string;
  parent_id?: string | number;
  level?: number;
  objective?: string;
  is_subcategory?: boolean;
}

const Catalogs = () => {
  const [activeTab, setActiveTab] = useState('areas');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<CatalogItem>>({
    name: '',
    description: '',
    number_code: '',
    parent_id: '',
    level: 0,
    objective: '',
    is_subcategory: false
  });

  const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

  const tabs = [
    { id: 'areas', label: 'Áreas' },
    { id: 'processes', label: 'Procesos' },
    { id: 'strategic_objectives', label: 'Obj. Estratégicos' },
    { id: 'causes', label: 'Causas' },
    { id: 'consequences', label: 'Consecuencias' },
    { id: 'risk_categories', label: 'Categorías' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${apiUrl}/api/${activeTab}`);
      const data = await resp.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${apiUrl}/api/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (resp.ok) {
        setShowModal(false);
        setFormData({ name: '', description: '', number_code: '', parent_id: '', level: 0, objective: '', is_subcategory: false });
        fetchData();
      }
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('¿Está seguro de eliminar este ítem?')) return;
    try {
      await fetch(`${apiUrl}/api/${activeTab}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  return (
    <div className="dashboard animate-fade-in">
      <header className="header-section">
        <div>
          <h1 className="header-title">Parametrización de Catálogos</h1>
          <p className="text-secondary">Gestione los elementos base para la matriz de riesgos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Ítem
        </button>
      </header>

      <div className="tabs-container" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando catálogo...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Cod/Nivel</th>
                <th style={{ padding: '1rem' }}>Nombre</th>
                <th style={{ padding: '1rem' }}>Descripción / Detalle</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay registros en este catálogo.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <span className="status-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                        {item.number_code || (item.level !== undefined ? `Niv ${item.level}` : '-')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{item.description || item.objective || '-'}</div>
                      {item.parent_id && <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Subelemento de: {item.parent_id}</div>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleDelete(item.id!)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo ítem: {tabs.find(t=>t.id===activeTab)?.label}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" className="form-control" placeholder="Ej: Gestión de Talento" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {(activeTab === 'causes' || activeTab === 'consequences') && (
                <div className="form-group">
                  <label>Número / Código</label>
                  <input 
                    type="text" className="form-control" placeholder="Ej: C-01"
                    value={formData.number_code} onChange={e => setFormData({...formData, number_code: e.target.value})}
                  />
                </div>
              )}

              {(activeTab === 'processes' || activeTab === 'risk_categories') && (
                <div className="form-group">
                  <label>Pertenece a (Padre ID)</label>
                  <select 
                    className="form-control" 
                    value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})}
                  >
                    <option value="">Ninguno (Raíz)</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'processes' && (
                <>
                  <div className="form-group">
                    <label>Nivel (0-5)</label>
                    <input 
                      type="number" min="0" max="5" className="form-control"
                      value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Propósito / Objetivo</label>
                    <textarea 
                      className="form-control" rows={2}
                      value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Descripción General</label>
                <textarea 
                  className="form-control" rows={3}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Ítem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogs;
