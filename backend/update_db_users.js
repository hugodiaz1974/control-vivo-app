const crypto = require('crypto');
const db = new (require('sqlite3').verbose()).Database('controlvivo.sqlite');

db.run("ALTER TABLE users ADD COLUMN password TEXT", (err) => {
    if (err) console.log('El esquema de base de datos ya tenía la columna password, o hubo un error:', err.message);
    
    const hash = crypto.createHash('sha256').update('admin123').digest('hex');
    db.run("UPDATE users SET password = ? WHERE id = 'USER-HA'", [hash], (e) => {
        if (e) console.error('Error inyectando hash de Hugo:', e);
        else console.log('🔐 Contraseña del usuario Administrador encriptada y reseteada a admin123 con éxito.');
        
        // Finalizar y salir script
        process.exit();
    });
});
