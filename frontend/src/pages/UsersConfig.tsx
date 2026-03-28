import React, { useState, useEffect } from 'react';

const UsersConfig = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Ejecutor',
    password: ''
  });

  const [passwordData, setPasswordData] = useState({
      newPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error conectando BD", err);
        setIsLoading(false);
      });
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(result => {
      fetchUsers(); // Recargar lista
      setIsModalOpen(false);
      setFormData({ full_name: '', email: '', role: 'Ejecutor', password: '' });
      alert('✅ Usuario creado y contraseñas encriptadas correctamente.');
    })
    .catch(err => alert("Error al guardar usuario."));
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/users/${currentUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData)
      })
      .then(res => res.json())
      .then(result => {
          setIsPassModalOpen(false);
          setPasswordData({newPassword: ''});
          alert('🔐 Contraseña reestablecida y re-encriptada con éxito.');
      })
      .catch(err => alert("Error al cambiar contraseña."));
  };

  const getRoleColor = (role: string) => {
      if (role.toLowerCase().includes('admin')) return 'var(--accent-primary)';
      if (role.toLowerCase().includes('auditor')) return 'var(--warning)';
      return 'var(--success)';
  }

  return (
    <div className="dashboard">
      <div className="header-section">
        <div>
          <p className="text-muted">Ajustes & Seguridad de la Plataforma</p>
          <h1>Administración de Empleados y Permisos</h1>
        </div>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          Dar de Alta Usuario
        </button>
      </div>

      <div className="card" style={{ padding: '1rem 0' }}>
        {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Verificando credenciales corporativas...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Empleado</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Correo Electrónico</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nivel de Acceso</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Acciones de Seguridad</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-bg-tertiary">
                  <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar" style={{width:'32px', height:'32px', fontSize: '0.8rem'}}>{u.full_name?u.full_name.substring(0,2).toUpperCase():'US'}</div>
                        {u.full_name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="status-badge" style={{ backgroundColor: getRoleColor(u.role)+'22', color: getRoleColor(u.role) }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setCurrentUser(u); setIsPassModalOpen(true); }}>
                        Cambiar Contraseña🔑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Alta Usuario */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nuevo Empleado Corporativo</h2>
              <button className="btn-secondary" style={{ background: 'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" className="form-control" required placeholder="Ej: Diana Pérez" 
                    value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label>Correo Institucional</label>
                  <input type="email" className="form-control" required placeholder="correo@controlvivo.com" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Rol y Permisos</label>
                  <select className="form-control" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Admin Riesgos">Administrador de Riesgos (Total)</option>
                    <option value="Ejecutor">Dueño de Proceso / Ejecutor</option>
                    <option value="Auditor Externo">Auditor de Cumplimiento (Solo Lectura)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contraseña Temporal Estándar</label>
                  <input type="text" className="form-control" required placeholder="clave provisional..." 
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>La contraseña será encriptada en la base de datos de manera irreversible mediante SHA-256.</span>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Descartar</button>
                <button type="submit" className="btn">Dar de Alta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {isPassModalOpen && currentUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px'}}>
            <div className="modal-header">
              <h2>Cambiar Clave: {currentUser.full_name}</h2>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Nueva Contraseña de Acceso</label>
                  <input type="text" className="form-control" required placeholder="escribe la nueva clave secreta..." 
                    value={passwordData.newPassword} onChange={(e) => setPasswordData({newPassword: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPassModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn" style={{backgroundColor:'var(--warning)', color: '#000'}}>Aplicar Reseteo Seguridad</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersConfig;
