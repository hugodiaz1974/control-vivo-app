import React, { useState, useEffect } from 'react';

const ActionPlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    risk_name: '',
    dueDate: '',
    status: 'Planificado',
    progress: 0
  });

  // ========== NUEVO: CARGAR PLANES DESDE LA BASE DE DATOS ==========
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/action_plans`)
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error conectando a la BD", err);
        setIsLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Vencido': return <span className="status-badge badge-danger">Vencido</span>;
      case 'En Progreso': return <span className="status-badge badge-warning">En Progreso</span>;
      case 'Planificado': return <span className="status-badge badge-success">Planificado</span>;
      default: return <span className="status-badge badge-info">{status}</span>;
    }
  };

  // ========== NUEVO: GUARDAR PLAN EN SQL ==========
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/action_plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(result => {
      // Optimistic UI update
      const newPlan = { 
        id: result.id, 
        name: formData.name, 
        risk: formData.risk_name || 'Riesgo Asociado', 
        owner: 'Hugo Diaz', 
        dueDate: formData.dueDate, 
        status: formData.status, 
        progress: Number(formData.progress) 
      };
      setPlans([...plans, newPlan]);
      setIsModalOpen(false);
      setFormData({ name: '', risk_name: '', dueDate: '', status: 'Planificado', progress: 0 });
    })
    .catch(err => alert("Error al guardar el plan de acción en la Base de Datos"));
  };

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Desarrollo Preventivo</p>
          <h1>Gestor de Planes de Acción</h1>
        </div>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Nuevo Plan
        </button>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '1rem' }}>
        <div className="metric-card" style={{ padding: '1rem' }}>
          <span className="metric-title">TOTAL PLANES REALES</span>
          <span className="metric-value">{plans.length}</span>
        </div>
        <div className="metric-card" style={{ padding: '1rem', borderLeft: '4px solid var(--warning)' }}>
          <span className="metric-title">EN PROGRESO</span>
          <span className="metric-value">{plans.filter(p => p.status === 'En Progreso').length}</span>
        </div>
        <div className="metric-card" style={{ padding: '1rem', borderLeft: '4px solid var(--danger)' }}>
          <span className="metric-title">VENCIDOS / RETRASADOS</span>
          <span className="metric-value text-danger" style={{color: 'var(--danger)'}}>{plans.filter(p => p.status === 'Vencido').length}</span>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '1rem 0' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <input type="text" className="search-bar" placeholder="Buscar un plan de acción..." style={{ width: '100%', maxWidth: '400px' }} />
          <button className="btn btn-secondary">Filtrar Base de Datos</button>
        </div>
        
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando planes de acción desde SQLite...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Plan de Acción</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Riesgo Asociado</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Responsable</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Vencimiento</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Avance</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s', cursor: 'pointer' }} className="hover:bg-bg-tertiary">
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.risk}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>{p.owner.substring(0, 2).toUpperCase()}</div>
                      <span>{p.owner}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: p.status === 'Vencido' ? 'var(--danger)' : 'var(--text-primary)' }}>{p.dueDate}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem' }}>{p.progress}%</span>
                      <div style={{ flex: 1, minWidth: '80px', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: p.progress + '%', height: '100%', backgroundColor: p.progress > 50 ? 'var(--success)' : 'var(--warning)', borderRadius: '3px' }}></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && plans.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay planes de acción actualmente en la base de datos.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Añadir Plan de Acción a Base de Datos</h2>
              <button 
                className="btn-secondary" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--text-secondary)' }}
                onClick={() => setIsModalOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Título de la Tarea / Acción</label>
                  <input type="text" className="form-control" required placeholder="Ej: Renovación de póliza" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Buscar Riesgo Asociado a Mitigar</label>
                  <input type="text" className="form-control" required placeholder="Ingresa nombre de tu Riesgo existente" 
                    value={formData.risk_name} onChange={(e) => setFormData({...formData, risk_name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fecha Límite</label>
                  <input type="date" className="form-control" required 
                    value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Estado Inicial</label>
                  <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Planificado">Planificado</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Porcentaje de Avance (%)</label>
                  <input type="range" min="0" max="100" style={{ marginTop: '0.5rem', width: '100%' }}
                    value={formData.progress} onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})} />
                  <div style={{ textAlign: 'right', fontSize: '0.875rem', marginTop: '0.25rem' }}>{formData.progress}%</div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn">Guardar Plan Permanentemente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlans;
