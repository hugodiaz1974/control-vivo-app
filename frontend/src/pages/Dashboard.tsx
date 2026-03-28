import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    criticalRisks: 0,
    activeControls: 0,
    expiredPlans: 0,
    complianceRate: 0,
    matrix: Array(25).fill(0)
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error cargando estadísticas", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Resumen General (SaaS B2B)</p>
          <h1>ControlVivo | Riesgos & Cumplimiento</h1>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Sincronizando con el servidor central...</div>
      ) : (
        <>
          {/* Quick Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">RIESGOS CRÍTICOS (SIN MITIGAR)</span>
              <span className="metric-value text-danger" style={{color: 'var(--danger)'}}>{stats.criticalRisks}</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">CONTROLES ACTIVOS</span>
              <span className="metric-value">42</span> {/* Placeholder hasta implementar módulo de controles */}
            </div>
            <div className="metric-card">
              <span className="metric-title">PLANES VENCIDOS</span>
              <span className="metric-value text-warning" style={{color: 'var(--warning)'}}>{stats.expiredPlans}</span>
            </div>
            <div className="metric-card">
              <span className="metric-title">ÍNDICE DE CUMPLIMIENTO</span>
              <span className="metric-value text-success" style={{color: 'var(--success)'}}>{stats.complianceRate}%</span>
            </div>
          </div>

          <div className="content-grid">
            {/* Heat Matrix */}
            <div className="card">
              <div className="card-title">Matriz RAM de Calor (Probabilidad vs Impacto)</div>
              <p className="text-muted" style={{fontSize: '0.875rem', marginBottom: '1rem'}}>
                Vulnerabilidades mapeadas: {stats.criticalRisks} Riesgo(s) Extremo(s) detectado(s).
              </p>
              <div className="heat-map">
                {stats.matrix.map((val, i) => {
                  let cellClass = 'bg-success'; // Low Risk
                  if (i % 5 >= 3 || Math.floor(i / 5) >= 3) cellClass = 'bg-warning';
                  if (i % 5 >= 4 || Math.floor(i / 5) >= 4) cellClass = 'bg-danger';
                  if (i < 10 && i % 5 < 2) cellClass = 'bg-success';
                  
                  // Refinamiento de colores según lógica RAM estándar
                  const prob = Math.floor(i / 5) + 1;
                  const impact = (i % 5) + 1;
                  const score = prob * impact;
                  
                  if (score >= 15) cellClass = 'bg-danger';
                  else if (score >= 8) cellClass = 'bg-warning';
                  else if (score >= 4) cellClass = 'bg-info';
                  else cellClass = 'bg-success';

                  return (
                    <div key={i} className={`heat-cell ${cellClass}`}>
                      {val > 0 ? val : ''}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Impacto (1-5) ➔</span>
                <span style={{ transform: 'rotate(-90deg)', position: 'absolute', left: '-10px', top: '50%' }}>Probabilidad (1-5) ➔</span>
              </div>
            </div>

            {/* Urget Tasks */}
            <div className="card">
              <div className="card-title">Planes de Acción Urgentes</div>
              <div className="task-list">
                {stats.expiredPlans > 0 ? (
                  <div className="task-item delayed">
                    <div className="task-info">
                      <span className="task-name">Planes Pendientes Críticos</span>
                      <span className="task-meta">Tienes {stats.expiredPlans} planes vencidos que requieren atención inmediata.</span>
                    </div>
                    <span className="status-badge badge-danger">Vencidos</span>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--success)' }}>
                    ✨ No hay planes vencidos actualmente.
                  </div>
                )}
                
                <div className="task-item warning">
                  <div className="task-info">
                    <span className="task-name">Auditoría Sistemas BD Críticos</span>
                    <span className="task-meta">Vence: Mañana • Responsable: Sistemas</span>
                  </div>
                  <span className="status-badge badge-warning">Urgente</span>
                </div>

                <div className="task-item" style={{borderLeftColor: 'var(--success)'}}>
                  <div className="task-info">
                    <span className="task-name">Actualización Matriz Legal</span>
                    <span className="task-meta">Vence: 15 Ene • Responsable: Legal</span>
                  </div>
                  <span className="status-badge badge-success">En Plazo</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
