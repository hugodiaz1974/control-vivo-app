const express = require('express');
const cors = require('cors');
// Render build trigger 1.0
const db = require('./database');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const hashPassword = (pass) => crypto.createHash('sha256').update(pass).digest('hex');

const PORT = 3000;

app.get('/api/processes', (req, res) => {
    db.all("SELECT * FROM processes", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ========== NUEVO: AUTENTICACIÓN SEGURA (CON HASH SHA256) ==========
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT id, email, full_name, role, password as hash FROM users WHERE email = ?", [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Usuario corporativo no encontrado." });
        
        const testHash = hashPassword(password);
        if (user.hash && user.hash !== testHash) {
            return res.status(401).json({ error: "Credenciales inválidas o contraseña alterada." });
        }
        
        db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES (?, ?, ?, ?)", 
             ['Sistema', user.id, 'LOGIN_EXITOSO', `El empleado ${user.full_name} (${user.role}) inició sesión con credenciales validadas.`]);
             
        res.json({ token: 'jwt-super-seguro', user });
    });
});

// ========== NUEVO: GESTIÓN DE EMPLEADOS ==========
app.get('/api/users', (req, res) => {
    db.all("SELECT id, email, full_name, role, created_at FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/users', (req, res) => {
    const { email, full_name, role, password } = req.body;
    const newId = 'USER-' + Math.floor(Math.random() * 10000);
    const pwdHash = hashPassword(password || 'Control2026');
    
    db.run("INSERT INTO users (id, company_id, email, full_name, role, password) VALUES (?, 'COMP-1', ?, ?, ?, ?)",
        [newId, email, full_name, role, pwdHash], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES ('Administrador', ?, 'CREAR_USUARIO', 'Se ha dado de alta a un nuevo empleado: ' || ? || ' (' || ? || ')')", 
                 [newId, full_name, role]);
                 
            res.json({ id: newId, message: "Usuario insertado y credenciales encriptadas exitosamente." });
        }
    );
});

app.put('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const hashed = hashPassword(newPassword);
    
    db.run("UPDATE users SET password = ? WHERE id = ?", [hashed, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES (?, ?, ?, ?)", 
             ['Administrador', id, 'CAMBIO_CLAVE', `Se resetearon oficialmente las credenciales o clave del usuario ID: ${id}.`]);
             
        res.json({ message: "Clave reestablecida de forma encriptada en el sistema." });
    });
});


app.get('/api/risks', (req, res) => {
    const query = `
        SELECT r.id, r.name, r.cause, r.consequence, r.probability as prob, r.impact, 
               r.inherent_risk_level as inherent, p.name as process
        FROM risks r 
        LEFT JOIN processes p ON r.process_id = p.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatData = rows.map(r => ({ ...r, controls: 1 }));
        res.json(formatData);
    });
});

app.post('/api/risks', (req, res) => {
    const { process, name, cause, consequence, prob, impact, inherent } = req.body;
    db.get("SELECT id FROM processes WHERE name LIKE ? LIMIT 1", [`%${process || ''}%`], (err, proc) => {
        const process_id = proc ? proc.id : 'PROC-OPE'; 
        const score = prob * impact;
        db.run(`INSERT INTO risks (process_id, name, cause, consequence, probability, impact, inherent_risk_score, inherent_risk_level, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USER-HA')`, [process_id, name, cause, consequence, prob, impact, score, inherent], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const newId = this.lastID;
            
            // ========== NUEVO: REGISTRAR EL LOG AUTOMÁTICAMENTE ==========
            db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES (?, ?, ?, ?)", 
                 ['Riesgos', newId.toString(), 'CREACIÓN', `Nuevo riesgo: ${name} (Impacto: ${impact})`]);
                 
            res.json({ id: newId, message: "Riesgo guardado de forma permanente" });
        });
    });
});

app.delete('/api/risks/:id', (req, res) => {
    const { id } = req.params;
    
    // Primero obtenemos el nombre para el log
    db.get("SELECT name FROM risks WHERE id = ?", [id], (err, risk) => {
        if (err || !risk) return res.status(404).json({ error: "Riesgo no encontrado" });
        
        db.run("DELETE FROM risks WHERE id = ?", [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // ========== LOG DE AUDITORÍA: ELIMINACIÓN ==========
            db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES (?, ?, ?, ?)", 
                 ['Riesgos', id.toString(), 'ELIMINACIÓN', `Se eliminó el riesgo: ${risk.name}`]);
                 
            res.json({ message: "Riesgo eliminado permanentemente de la BD" });
        });
    });
});

app.get('/api/action_plans', (req, res) => {
    const query = `
        SELECT a.id, a.title as name, r.name as risk, u.full_name as owner, a.due_date as dueDate, a.status, a.progress
        FROM action_plans a
        LEFT JOIN risks r ON a.risk_id = r.id
        LEFT JOIN users u ON a.assigned_to = u.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formattedData = rows.map(a => ({
            id: a.id,
            name: a.name,
            risk: a.risk,
            owner: a.owner || 'Sin Asignar',
            dueDate: a.dueDate,
            status: a.status,
            progress: a.progress
        }));
        res.json(formattedData);
    });
});

app.post('/api/action_plans', (req, res) => {
    const { risk_name, name, dueDate, status, progress } = req.body;
    db.get("SELECT id FROM risks WHERE name LIKE ? LIMIT 1", [`%${risk_name || ''}%`], (err, rsk) => {
        const risk_id = rsk ? rsk.id : 2;
        const assigned_to = 'USER-HA'; 
        
        db.run(`INSERT INTO action_plans (risk_id, title, assigned_to, due_date, status, progress) VALUES (?, ?, ?, ?, ?, ?)`, 
        [risk_id, name, assigned_to, dueDate, status, progress], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const newId = this.lastID;
            
            // ========== NUEVO: REGISTRAR EL LOG DE PLAN DE ACCIÓN ==========
            db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES (?, ?, ?, ?)", 
                 ['Planes de Acción', newId.toString(), 'CREACIÓN', `Plan mitigación: ${name} - Vence: ${dueDate}`]);
                 
            res.json({ id: newId, message: "Plan de Acción creado en la BD." });
        });
    });
});

// ========== NUEVO: ENDPOINTS PARA CONTROLES ==========
app.get('/api/controls', (req, res) => {
    const query = `
        SELECT c.id, c.name, c.description as desc, c.type, c.frequency as freq, 
               r.name as risk_name, u.full_name as owner,
               c.design_score, c.execution_score
        FROM controls c
        LEFT JOIN risks r ON c.risk_id = r.id
        LEFT JOIN users u ON c.owner_id = u.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const formatData = rows.map(c => ({
            id: c.id,
            name: c.name,
            desc: c.desc,
            type: c.type,
            freq: c.freq,
            risk: c.risk_name,
            owner: c.owner || 'Sin Asignar',
            effectiveness: Math.round((c.design_score + c.execution_score) / 2) || 100
        }));
        res.json(formatData);
    });
});

app.post('/api/controls', (req, res) => {
    const { risk_name, name, desc, type, freq, design, execution } = req.body;
    db.get("SELECT id FROM risks WHERE name LIKE ? LIMIT 1", [`%${risk_name || ''}%`], (err, rsk) => {
        const risk_id = rsk ? rsk.id : 2;
        const owner_id = 'USER-HA'; // Todo a nombre del Admin en este demo
        
        db.run(`INSERT INTO controls (risk_id, name, description, type, frequency, owner_id, design_score, execution_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [risk_id, name, desc, type, freq, owner_id, design, execution], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const newId = this.lastID;
            
            // Guardar Auditoría
            db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES (?, ?, ?, ?)", 
                 ['Controles', newId.toString(), 'CREACIÓN', `Nuevo control ${type}: ${name}`]);
                 
            res.json({ id: newId, message: "Control guardado exitosamente." });
        });
    });
});

// ========== NUEVO: ESTADÍSTICAS PARA EL DASHBOARD ==========
app.get('/api/stats', (req, res) => {
    const stats = {
        criticalRisks: 0,
        activeControls: 0,
        expiredPlans: 0,
        complianceRate: 85, // Meta inicial
        matrix: Array(25).fill(0) // Matriz 5x5 para el Heatmap
    };

    // 1. Contar riesgos críticos (Score >= 15)
    db.get("SELECT COUNT(*) as count FROM risks WHERE (probability * impact) >= 15", (err, row) => {
        if (!err) stats.criticalRisks = row.count;

        // 2. Contar planes vencidos
        db.get("SELECT COUNT(*) as count FROM action_plans WHERE status = 'Vencido'", (err, row) => {
            if (!err) stats.expiredPlans = row.count;

            // 2.5 Contar controles activos
            db.get("SELECT COUNT(*) as count FROM controls", (err, row) => {
                if (!err) stats.activeControls = row.count;

                // 3. Obtener distribución para la Matriz RAM
                db.all("SELECT probability, impact FROM risks", (err, rows) => {
                    if (!err && rows) {
                        rows.forEach(r => {
                            const idx = (r.probability - 1) * 5 + (r.impact - 1);
                            if (idx >= 0 && idx < 25) stats.matrix[idx]++;
                        });
                    }
                    res.json(stats);
                });
            });
        });
    });
});

// ========== NUEVO: LECTURA DE LOGS (REST STRICT) ==========
app.get('/api/logs', (req, res) => {
    const query = `
        SELECT l.id, l.entity_name as type, l.action, l.details as detail, l.created_at as date,
               u.full_name as name, 'HA' as user
        FROM audit_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.id DESC LIMIT 50
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🛡️ ControlVivo Server (Back-end) Activo`);
    console.log(`🌐 Base de datos en http://localhost:${PORT}`);
    console.log(`=========================================`);
});
