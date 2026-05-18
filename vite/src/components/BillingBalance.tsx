import { useContext, useEffect, useState } from 'react';
import { getUserCoinBalance, type CoinsBalance } from '../lib/supabase';
import { Zap, Loader } from 'lucide-react';
import { UserContext } from '../context/UserContext';

export function BillingBalance() {
  const user = useContext(UserContext);  
  const [balance, setBalance] = useState<CoinsBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await getUserCoinBalance(user.id);
        if (res.error) throw res.error;
        setBalance(res.data || null);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  if (loading) {
    return (
      <div className="py-md px-lg mx-lg bg-block-cream rounded-lg flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-ink" />
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <section className="py-md px-lg mx-lg bg-block-cream rounded-lg mb-lg flex items-center gap-md">
      <Zap className="w-6 h-6 text-yellow-500" />
      <div>
        <p className="text-body-sm text-ink/70">Current Balance</p>
        <p className="text-headline font-semibold text-ink">{balance.balance} coins</p>
      </div>
    </section>
  );
}
