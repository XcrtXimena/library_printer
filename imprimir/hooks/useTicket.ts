//hooks/useTicket.ts
import { useEffect, useState } from 'react';
import { fetchTicketInfraction, TicketResponse } from '../services/ticket';

export function useTicket() {
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    fetchTicketInfraction()
      .then(setTicket)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  }, []);

  return { ticket, loading, error };
}