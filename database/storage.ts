import { getDatabase } from "./db";

export async function initDatabase() {
  const db = await getDatabase();
  
  try {
    // Verifica se a tabela existe (nova API)
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'"
    );

    if (tables.length === 0) {
      await db.execAsync(`
        CREATE TABLE transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK (type IN ('Receita', 'Despesa')),
          value REAL NOT NULL,
          text TEXT NOT NULL,
          date TEXT NOT NULL
        );
      `);
      console.log('Tabela criada com sucesso');
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
    throw error;
  }
}

export async function dropTransactionsTable() {
  const db = await getDatabase();
  
  try {
    await db.execAsync("DROP TABLE IF EXISTS transactions;");
    console.log("Tabela removida com sucesso.");
  } catch (error) {
    console.error("Erro ao remover a tabela:", error);
    throw error;
  }
}