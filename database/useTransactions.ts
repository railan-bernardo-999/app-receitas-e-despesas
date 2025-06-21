import { useSQLiteContext } from 'expo-sqlite';

export type TransactionProps = {
    id: number;
    type: string;
    value: number;
    title: string;
    date: string;
}

interface MonthlyTotals {
  receitas: number;
  despesas: number;
}

export function useTransactions(){
  const database = useSQLiteContext();

  async function store(data: Omit<TransactionProps, "id">) {
     const statement = await database.prepareAsync(
      "INSERT INTO transactions (type, value, title, date) VALUES ($type, $value, $title, $date)"
    )

     try {
       const result = await statement.executeAsync({
         $type: data.type,
         $value: data.value,
         $title: data.title,
         $date: data.date
       })

       const insertRowId = result.lastInsertRowId.toString()

       return { insertRowId }
     } catch (error) {
         console.error('Erro ao inserir transação:', error);
         throw error;
     } finally{
        await statement.finalizeAsync()
     }
  }
  
  async function list() {
    
     try {
         const result = await database.getAllAsync(
             `SELECT * FROM transactions ORDER BY date DESC`
         );
         return result;
     } catch (error) {
         console.error('Erro ao buscar transações:', error);
         throw error;
     }
  }
  
  async function getMonthlyTotals() {
   
   // Obtém o primeiro e último dia do mês atual
   const now = new Date();
   const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
   const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  
   try {
     // Busca receitas do mês
     const receitasResult = await database.getFirstSync<{ total: number }>(
       `SELECT SUM(value) as total FROM transactions 
        WHERE type = 'Receita' AND date BETWEEN ? AND ?`,
       [firstDay, lastDay]
     );
  
     // Busca despesas do mês
     const despesasResult = await database.getFirstSync<{ total: number }>(
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

  return { store, list, getMonthlyTotals }
}
