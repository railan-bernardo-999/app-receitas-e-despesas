import { useEffect, useState } from 'react';
import { initDatabase } from '../database/storage';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err as Error);
        console.error('Falha na inicialização do banco:', err);
      }
    };

    init();
  }, []);

  return { isReady, error };
}