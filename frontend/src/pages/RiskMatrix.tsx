import React, { useState, useEffect } from 'react';

const RiskMatrix = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    process: '',
    name: '',
    cause: '',
    consequence: '',
    prob: 1,
    impact: 1,
  });

  // ========== NUEVO: CARGAR DESDE LA BASE DE DATOS REAL ==========
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/risks`)
      .then(res => res.json())
      .then(data => {
        setRisks(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error conectando a la base de datos", err);
        setIsLoading(false);
      });
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Crítico': return 'var(--danger)';
      case 'Alto': return 'var(--warning)';
      case 'Medio': return 'var(--accent-primary)';
      case 'Bajo': return 'var(--success)';
      default: return 'var(--success)';
    }
  };

  const calculateInherentRisk = (prob: number, impact: number) => {
    const score = prob * impact;
    if (score >= 15) return 'Crítico';
    if (score >= 8) return 'Alto';
    if (score >= 4) return 'Medio';
    return 'Bajo';
  };

  // ========== NUEVO: GUARDAR EN LA BASE DE DATOS REAL ==========
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const inherentLevel = calculateInherentRisk(Number(formData.prob), Number(formData.impact));
    const payload = {
      process: formData.process,
      name: formData.name,
      cause: formData.cause,
      consequence: formData.consequence,
      prob: Number(formData.prob),
      impact: Number(formData.impact),
      inherent: inherentLevel
    };

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(result => {
      // Se agregó a la base de datos exitosamente. 
      // Mostramos en la tabla sin necesidad de recargarla (Optimistic UI)
      const newRiskWithId = { ...payload, id: result.id, controls: 0 };
      setRisks([...risks, newRiskWithId]);
      setIsModalOpen(false);
      setFormData({ process: '', name: '', cause: '', consequence: '', prob: 1, impact: 1 });
    })
    .catch(err => {
      console.error(err);
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar este riesgo permanentemente para efectos de auditoría?")) return;
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/risks/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setRisks(risks.filter(r => r.id !== id));
      })
      .catch(err => alert("Error al eliminar de la BD"));
  };

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Módulo Core</p>
          <h1>Matriz de Riesgos y Controles</h1>
        </div>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Registrar Nuevo Riesgo
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: '1rem 0' }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Cargando datos desde el servidor central...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Proceso</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Riesgo / Evento</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Causa & Consecuencia</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Prob. / Imp.</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Riesgo Inherente</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Controles</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {risks.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="hover:bg-bg-tertiary">
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{r.process}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{r.name}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>C: {r.cause}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>E: {r.consequence}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>P:{r.prob} / I:{r.impact}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="status-badge" style={{ backgroundColor: getRiskColor(r.inherent) + '33', color: getRiskColor(r.inherent) }}>
                      {r.inherent}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: r.controls === 0 ? 'var(--warning)' : 'inherit' }}>
                    {r.controls} doc.
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Editar</button>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}
                        onClick={() => handleDelete(r.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && risks.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay riesgos registrados en la base de datos de ControlVivo.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Registrar Nuevo Riesgo en la BD</h2>
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
                <div className="form-group">
                  <label>Proceso Asociado (Texto)</label>
                  <input type="text" className="form-control" required placeholder="Ej: Operaciones" 
                    value={formData.process} onChange={(e) => setFormData({...formData, process: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Nombre del Riesgo (Evento)</label>
                  <input type="text" className="form-control" required placeholder="Ej: Falla de Servidores" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Causa Raíz</label>
                  <input type="text" className="form-control" required placeholder="¿Por qué sucedería?" 
                    value={formData.cause} onChange={(e) => setFormData({...formData, cause: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Consecuencia / Impacto</label>
                  <input type="text" className="form-control" required placeholder="¿Qué pasa si sucede?" 
                    value={formData.consequence} onChange={(e) => setFormData({...formData, consequence: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Probabilidad (1-5)</label>
                  <select className="form-control" value={formData.prob} onChange={(e) => setFormData({...formData, prob: Number(e.target.value)})}>
                    <option value={1}>1 - Muy Baja</option>
                    <option value={2}>2 - Baja</option>
                    <option value={3}>3 - Media</option>
                    <option value={4}>4 - Alta</option>
                    <option value={5}>5 - Muy Alta</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Impacto (1-5)</label>
                  <select className="form-control" value={formData.impact} onChange={(e) => setFormData({...formData, impact: Number(e.target.value)})}>
                    <option value={1}>1 - Insignificante</option>
                    <option value={2}>2 - Menor</option>
                    <option value={3}>3 - Moderado</option>
                    <option value={4}>4 - Mayor</option>
                    <option value={5}>5 - Catastrófico</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn">Guardar Permanentemente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMatrix;
