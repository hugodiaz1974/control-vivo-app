const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'controlvivo.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err);
    
    db.run("UPDATE users SET full_name = 'Hugo Diaz' WHERE id = 'USER-HA'", function(err) {
        if (err) console.error("Error updating name:", err);
        else console.log("¡Nombre de usuario corporativo actualizado correctamente a Hugo Diaz!");
    });
});
