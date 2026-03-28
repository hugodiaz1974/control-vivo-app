import { useState, useEffect } from 'react';

const Controls = () => {
  const [controls, setControls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    risk_name: '',
    desc: '',
    type: 'Preventivo',
    freq: 'Diario',
    design: 100,
    execution: 100
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/controls`)
      .then(res => res.json())
      .then(data => {
        setControls(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error conectando BD", err);
        setIsLoading(false);
      });
  }, []);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Preventivo': return '#3b82f6'; // blue
      case 'Detectivo': return '#f59e0b';  // yellow
      case 'Correctivo': return '#ef4444'; // red
      default: return '#10b981';
    }
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--warning)';
    return 'var(--danger)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/controls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(result => {
      const newControl = {
        id: result.id,
        name: formData.name,
        desc: formData.desc,
        type: formData.type,
        freq: formData.freq,
        risk: formData.risk_name || 'Riesgo Asociado',
        owner: 'Hugo Diaz',
        effectiveness: Math.round((Number(formData.design) + Number(formData.execution)) / 2)
      };
      setControls([...controls, newControl]);
      setIsModalOpen(false);
      setFormData({ name: '', risk_name: '', desc: '', type: 'Preventivo', freq: 'Diario', design: 100, execution: 100 });
    })
    .catch(err => alert("Error al guardar control"));
  };

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Desarrollo y Mitigación</p>
          <h1>Catálogo de Controles</h1>
        </div>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Diseñar Nuevo Control
        </button>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '1rem' }}>
        <div className="metric-card" style={{ padding: '1rem' }}>
          <span className="metric-title">CONTROLES EVALUADOS</span>
          <span className="metric-value">{controls.length}</span>
        </div>
        <div className="metric-card" style={{ padding: '1rem', borderLeft: `4px solid ${getTypeColor('Preventivo')}` }}>
          <span className="metric-title">PREVENTIVOS</span>
          <span className="metric-value">{controls.filter(c => c.type === 'Preventivo').length}</span>
        </div>
        <div className="metric-card" style={{ padding: '1rem', borderLeft: `4px solid ${getTypeColor('Detectivo')}` }}>
          <span className="metric-title">DETECTIVOS / CORRECTIVOS</span>
          <span className="metric-value">{controls.filter(c => c.type !== 'Preventivo').length}</span>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem 0' }}>
        {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando catálogo...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Tipo</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nombre de Control</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Riesgo que Mitiga</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Frecuencia</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Eficiencia Promedio</th>
              </tr>
            </thead>
            <tbody>
              {controls.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-bg-tertiary">
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: getTypeColor(c.type) + '22', color: getTypeColor(c.type)
                    }}>
                      {c.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {c.name}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{c.desc}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.risk}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.freq}</td>
                  <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: getEffectivenessColor(c.effectiveness)}}>
                          {c.effectiveness}%
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && controls.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay controles registrados.</div>
        )}
      </div>

      {/* Modal Mágico */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Diseñar y Evaluar Control</h2>
              <button className="btn-secondary" style={{ background: 'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nombre del Control</label>
                  <input type="text" className="form-control" required placeholder="Ej: Doble firma en transferencias" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Descripción y Mecanismo</label>
                  <input type="text" className="form-control" required placeholder="Cómo funciona la mitigación..." 
                    value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Tipo de Control</label>
                  <select className="form-control" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="Preventivo">Preventivo (Antes)</option>
                    <option value="Detectivo">Detectivo (Durante)</option>
                    <option value="Correctivo">Correctivo (Después)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Frecuencia</label>
                  <select className="form-control" value={formData.freq} onChange={(e) => setFormData({...formData, freq: e.target.value})}>
                    <option value="Diario">Diario</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Mensual">Mensual</option>
                    <option value="Anual">Anual</option>
                    <option value="Por Transacción">Por Transacción</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Riesgo Específico a Mitigar</label>
                  <input type="text" className="form-control" required placeholder="Ingresa el nombre de un riesgo activo..." 
                    value={formData.risk_name} onChange={(e) => setFormData({...formData, risk_name: e.target.value})} />
                </div>

                {/* Evaluadores de Efectividad */}
                <div style={{ gridColumn: '1 / -1', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', marginTop: '0.5rem' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Calificación de Efectividad</h4>
                    
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score de Diseño (Documentación/Lógica): {formData.design}%</label>
                    <input type="range" min="0" max="100" style={{ width: '100%', marginBottom: '1rem' }} value={formData.design} onChange={(e) => setFormData({...formData, design: Number(e.target.value)})} />
                    
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score de Ejecución (Cumplimiento real): {formData.execution}%</label>
                    <input type="range" min="0" max="100" style={{ width: '100%' }} value={formData.execution} onChange={(e) => setFormData({...formData, execution: Number(e.target.value)})} />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn">Inyectar en Base de Datos</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
