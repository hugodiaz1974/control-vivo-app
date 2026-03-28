import React, { useState, useEffect } from 'react';

const Calendar = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/action_plans`)
      .then(res => res.json())
      .then(data => {
        // Ordenar por fecha más próxima
        const sorted = data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setTasks(sorted);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error cargando calendario", err);
        setIsLoading(false);
      });
  }, []);

  // Función para determinar severidad del vencimiento
  const getSeverity = (dateString: string, status: string) => {
    if (status === 'Completado') return { color: 'var(--success)', label: 'Completado', bg: 'rgba(34, 197, 94, 0.1)' };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateString);
    due.setHours(0,0,0,0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'var(--danger)', label: 'Vencido', bg: 'rgba(239, 68, 68, 0.1)' };
    if (diffDays <= 7) return { color: 'var(--warning)', label: `Crítico (${diffDays} días)`, bg: 'rgba(234, 179, 8, 0.1)' };
    return { color: 'var(--info)', label: `A tiempo (${diffDays} días)`, bg: 'rgba(59, 130, 246, 0.1)' };
  };

  const overdue = tasks.filter(t => t.status !== 'Completado' && new Date(t.dueDate) < new Date());
  const upcoming = tasks.filter(t => t.status !== 'Completado' && new Date(t.dueDate) >= new Date()).slice(0, 5);

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Cumplimiento y Vencimientos</p>
          <h1>Calendario Regulatorio & Tareas</h1>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <div className="metric-card" style={{ padding: '1.5rem', borderBottom: '4px solid var(--danger)' }}>
          <span className="metric-title">VENCIDOS / INCUMPLIMIENTOS</span>
          <span className="metric-value text-danger">{overdue.length}</span>
        </div>
        <div className="metric-card" style={{ padding: '1.5rem', borderBottom: '4px solid var(--warning)' }}>
          <span className="metric-title">PRÓXIMOS 7 DÍAS</span>
          <span className="metric-value text-warning">{tasks.filter(t => t.status !== 'Completado' && getSeverity(t.dueDate, t.status).label.includes('Crítico')).length}</span>
        </div>
        <div className="metric-card" style={{ padding: '1.5rem', borderBottom: '4px solid var(--success)' }}>
          <span className="metric-title">MITIGACIONES COMPLETADAS</span>
          <span className="metric-value text-success">{tasks.filter(t => t.status === 'Completado').length}</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-title">Línea de Tiempo Regulatoria (Timeline)</div>
          <p className="text-muted" style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>
            Visor temporal de todos los planes de acción asociados a riesgos corporativos o requerimientos legales.
          </p>

          <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)', marginLeft: '1rem' }}>
            {isLoading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Cargando línea de tiempo...</div>
            ) : tasks.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No hay eventos regulatorios registrados.</div>
            ) : (
                tasks.map(task => {
                  const severity = getSeverity(task.dueDate, task.status);
                  return (
                    <div key={task.id} style={{ position: 'relative', marginBottom: '2rem' }}>
                      {/* Nodo de fecha */}
                      <div style={{ 
                        position: 'absolute', left: '-2.5rem', top: '0', width: '1rem', height: '1rem',
                        borderRadius: '50%', backgroundColor: severity.color, border: '3px solid var(--bg-primary)',
                        boxShadow: `0 0 0 2px ${severity.bg}` 
                      }}></div>
                      
                      {/* Tarjeta del Evento */}
                      <div style={{
                        backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '12px',
                        border: '1px solid var(--border-color)', position: 'relative'
                      }} className="hover:bg-bg-secondary">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{task.name}</h3>
                              <span style={{ 
                                  backgroundColor: severity.bg, color: severity.color, 
                                  padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${severity.color}44`
                              }}>
                                  {severity.label}
                              </span>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                              <div>
                                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Riesgo Asociado o Ley</span>
                                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{task.risk || 'Cumplimiento Normativo'}</span>
                              </div>
                              <div>
                                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha Límite Evaluada</span>
                                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                      {new Date(task.dueDate + "T00:00:00").toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                              </div>
                              <div>
                                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Responsable Legal</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                      <div className="avatar" style={{width:'20px', height:'20px', fontSize: '0.6rem', backgroundColor: 'var(--bg-primary)'}}>
                                          {task.owner ? task.owner.substring(0,2).toUpperCase() : 'US'}
                                      </div>
                                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{task.owner}</span>
                                  </div>
                              </div>
                          </div>

                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
