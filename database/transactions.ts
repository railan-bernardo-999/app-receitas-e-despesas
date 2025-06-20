import { getDatabase } from './db';

interface Transaction {
    id?: number;
    type: string;
    value: number;
    date: string;
}

interface MonthlyTotals {
  receitas: number;
  despesas: number;
}

export async function addTransaction(type: string, value: number, date: string): Promise<void> {
    const db = await getDatabase();
    try {
        await db.runAsync(
            `INSERT INTO transactions (type, value, date) VALUES (?, ?, ?)`,
            [type, value, date]
        );
    } catch (error) {
        console.error('Erro ao inserir transação:', error);
        throw error;
    }
}

export async function getTransactions(): Promise<Transaction[]> {
    const db = await getDatabase();
    try {
        const result = await db.getAllAsync<Transaction>(
            `SELECT * FROM transactions ORDER BY date DESC`
        );
        return result;
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
    }
}

export async function getMonthlyTotals(): Promise<MonthlyTotals> {
  const db = await getDatabase();
  
  // Obtém o primeiro e último dia do mês atual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  try {
    // Busca receitas do mês
    const receitasResult = await db.getFirstSync<{ total: number }>(
      `SELECT SUM(value) as total FROM transactions 
       WHERE type = 'Receita' AND date BETWEEN ? AND ?`,
      [firstDay, lastDay]
    );

    // Busca despesas do mês
    const despesasResult = await db.getFirstSync<{ total: number }>(
      `SELECT SUM(value) as total FROM transactions 
       WHERE type = 'Despesa' AND date BETWEEN ? AND ?`,
      [firstDay, lastDay]
    );

    return {
      receitas: receitasResult?.total || 0,
      despesas: despesasResult?.total || 0
    };
  } catch (error) {
    console.error('Erro ao calcular totais mensais:', error);
    throw error;
  }
}