const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'controlvivo.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error abriendo base de datos', err.message);
    } else {
        db.serialize(() => {
            db.run("INSERT OR IGNORE INTO companies (id, name) VALUES ('COMP-1', 'ControlVivo Empresa')", (err) => {
                if(err) console.error("Err comp:", err.message);
                db.run("INSERT OR IGNORE INTO users (id, company_id, email, full_name, role) VALUES ('USER-HA', 'COMP-1', 'hugo@controlvivo.com', 'Hugo Alvarez', 'Admin Riesgos')", (err2) => {
                    if(err2) console.error("Err us:", err2.message);
                    else console.log("Usuario Hugo Alvarez reinsertado correctamente en la BD.");
                });
            });
        });
    }
});
