const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'controlvivo.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error abriendo base de datos', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS companies ( id TEXT PRIMARY KEY, name TEXT NOT NULL, industry TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
            db.run(`CREATE TABLE IF NOT EXISTS users ( id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), email TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, role TEXT DEFAULT 'ejecutor', created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
            db.run(`CREATE TABLE IF NOT EXISTS processes ( id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL, description TEXT, owner_id TEXT REFERENCES users(id), created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
            db.run(`CREATE TABLE IF NOT EXISTS risks ( id INTEGER PRIMARY KEY AUTOINCREMENT, process_id TEXT NOT NULL REFERENCES processes(id), name TEXT NOT NULL, cause TEXT, consequence TEXT, probability INTEGER CHECK (probability BETWEEN 1 AND 5), impact INTEGER CHECK (impact BETWEEN 1 AND 5), inherent_risk_score INTEGER, inherent_risk_level TEXT, created_by TEXT REFERENCES users(id), created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
            db.run(`CREATE TABLE IF NOT EXISTS action_plans ( id INTEGER PRIMARY KEY AUTOINCREMENT, risk_id INTEGER NOT NULL REFERENCES risks(id), title TEXT NOT NULL, assigned_to TEXT REFERENCES users(id), due_date DATE NOT NULL, status TEXT DEFAULT 'Planificado', progress INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
            
            // ========== NUEVA TABLA: CONTROLES ==========
            db.run(`CREATE TABLE IF NOT EXISTS controls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                risk_id INTEGER NOT NULL REFERENCES risks(id),
                name TEXT NOT NULL,
                description TEXT,
                type TEXT DEFAULT 'Preventivo',
                frequency TEXT,
                owner_id TEXT REFERENCES users(id),
                design_score INTEGER DEFAULT 100,
                execution_score INTEGER DEFAULT 100,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // ========== NUEVA TABLA: AUDIT LOGS ==========
            db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_id TEXT DEFAULT 'COMP-1',
                user_id TEXT DEFAULT 'USER-HA',
                entity_name TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Seed inicial si está vacío
            db.get("SELECT COUNT(*) as count FROM companies", (err, row) => {
                if (row && row.count === 0) {
                    console.log("⚙️  Inicializando Datos Semilla (Usuarios y Procesos)...");
                    db.run("INSERT INTO companies (id, name) VALUES ('COMP-1', 'ControlVivo Empresa')");
                    db.run("INSERT INTO users (id, company_id, email, full_name, role) VALUES ('USER-HA', 'COMP-1', 'hugo@controlvivo.com', 'Hugo Diaz', 'Admin Riesgos')");
                    db.run("INSERT INTO processes (id, company_id, name) VALUES ('PROC-1', 'COMP-1', 'Gestión de Tecnología')");
                    db.run("INSERT INTO audit_logs (entity_name, entity_id, action, details) VALUES ('Sistema', 'APP', 'INICIO_NUEVO', 'Base de datos creada. Usuario Administrador registrado.')");
                }
            });
        });
    }
});

module.exports = db;
