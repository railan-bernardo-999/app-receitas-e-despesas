import { SQLiteDatabase } from 'expo-sqlite';

export async function initializeDatabase(databese: SQLiteDatabase){
  await databese.execAsync(`
     CREATE TABLE IF NOT EXISTS transactions(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       type TEXT NOT NULL,
       value DECIMAL NOT NULL,
       title TEXT NOT NULL,
       date TEXT NOT NULL
     );
    `)
}
