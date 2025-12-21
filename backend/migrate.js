const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gt3_championship.db');
const db = new sqlite3.Database(dbPath);

console.log('Migration de la base de données...');

db.serialize(() => {
  // Vérifier si la colonne status existe déjà
  db.all("PRAGMA table_info(results)", [], (err, columns) => {
    if (err) {
      console.error('Erreur:', err);
      return;
    }
    
    const hasStatusColumn = columns.some(col => col.name === 'status');
    
    if (!hasStatusColumn) {
      console.log('Ajout de la colonne status...');
      
      // Ajouter la colonne status
      db.run('ALTER TABLE results ADD COLUMN status TEXT', (err) => {
        if (err) {
          console.error('Erreur lors de l\'ajout de la colonne:', err);
        } else {
          console.log('✓ Colonne status ajoutée avec succès');
        }
      });
      
      // Rendre la colonne position nullable (on doit recréer la table)
      console.log('Modification de la structure de la table results...');
      
      db.run(`
        CREATE TABLE results_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          pilot_id INTEGER NOT NULL,
          position INTEGER,
          points INTEGER NOT NULL DEFAULT 0,
          status TEXT,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          FOREIGN KEY (pilot_id) REFERENCES pilots(id) ON DELETE CASCADE,
          UNIQUE(event_id, pilot_id)
        )
      `, (err) => {
        if (err) {
          console.error('Erreur création nouvelle table:', err);
          return;
        }
        
        // Copier les données
        db.run(`
          INSERT INTO results_new (id, event_id, pilot_id, position, points)
          SELECT id, event_id, pilot_id, position, points FROM results
        `, (err) => {
          if (err) {
            console.error('Erreur copie données:', err);
            return;
          }
          
          // Supprimer l'ancienne table
          db.run('DROP TABLE results', (err) => {
            if (err) {
              console.error('Erreur suppression ancienne table:', err);
              return;
            }
            
            // Renommer la nouvelle table
            db.run('ALTER TABLE results_new RENAME TO results', (err) => {
              if (err) {
                console.error('Erreur renommage table:', err);
              } else {
                console.log('✓ Table results mise à jour avec succès');
                console.log('✓ Migration terminée !');
              }
              
              db.close();
            });
          });
        });
      });
    } else {
      console.log('La colonne status existe déjà, aucune migration nécessaire');
      db.close();
    }
  });
});
