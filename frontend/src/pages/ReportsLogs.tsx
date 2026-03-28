import { useState, useEffect } from 'react';

const ReportsLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ========== NUEVO: CARGAR LOGS DESDE EL SERVIDOR (INMUTABLES) ==========
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/logs`)
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error conectando a los registros de auditoría", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Centro de Auditoría y Exportación</p>
          <h1>Reportes Ejecutivos y Log de Trazabilidad</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => alert("🎁 Función Premium: La exportación corporativa PPTX estará habilitada en tu versión de producción 1.1.")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exportar PPT Junta
          </button>
          <button className="btn" onClick={() => window.print()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Generar PDF Informe
          </button>
        </div>
      </div>

      <div className="content-grid">
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Log de Auditoría (Inmutable)</span>
            <input type="date" className="search-bar" style={{ width: 'auto' }} />
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            La trazabilidad que tanto piden las superintendencias. "Todo lo que sucede en la aplicación queda registrado real y permanentemente."
          </p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fecha/Hora (UTC)</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Operador / Usuario</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Entidad Afectada</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Acción Estricta y Detalle</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{textAlign:'center', padding: '2rem'}}>Cargando auditoría desde la base de datos...</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="hover:bg-bg-tertiary">
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{log.date}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>{log.user}</div>
                      <span>{log.name || 'Hugo Diaz'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="status-badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)', textTransform: 'none' }}>
                      {log.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 500 }}>{log.action}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.detail}</div>
                  </td>
                </tr>
              ))}
              {!isLoading && logs.length === 0 && (
                 <tr><td colSpan={4} style={{textAlign:'center', padding: '2rem'}}>No hay actividad reciente en el log de auditoría.</td></tr>
              )}
            </tbody>
          </table>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" style={{ display: 'inline-flex' }}>Cargar más registros antiguos</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsLogs;
