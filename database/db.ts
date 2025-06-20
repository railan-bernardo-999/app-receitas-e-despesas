import * as SQLite from 'expo-sqlite';

export async function getDatabase() {
    try {
        const db = await SQLite.openDatabaseAsync('gastos.db');
        return db;
    } catch (error) {
        console.error('Erro ao abrir o banco de dados:', error);
        throw error;
    }
}
