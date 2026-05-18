import { useContext, useEffect, useState } from 'react';
import { getUserCoinOrders, type CoinOrder } from '../lib/supabase';
import { Loader } from 'lucide-react';
import { UserContext } from '../context/UserContext';

interface BillingOrdersProps {
  refreshTrigger?: number;
}

export function BillingOrders({ refreshTrigger }: BillingOrdersProps) {
  const user = useContext(UserContext);
  const [orders, setOrders] = useState<CoinOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await getUserCoinOrders(user.id);
        if (res.error) throw res.error;
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, refreshTrigger]);

  if (loading) {
    return (
      <section className="py-section px-lg flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-ink" />
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="py-section px-lg">
        <h2 className="text-headline font-semibold text-ink mb-lg">Your Orders</h2>
        <p className="text-body text-ink/60">No orders yet. Purchase a package above to get started.</p>
      </section>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="py-section px-lg">
      <h2 className="text-headline font-semibold text-ink mb-lg">Your Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-body text-ink">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left py-md px-lg font-semibold">Date</th>
              <th className="text-left py-md px-lg font-semibold">Package</th>
              <th className="text-left py-md px-lg font-semibold">Coins</th>
              <th className="text-left py-md px-lg font-semibold">Amount</th>
              <th className="text-left py-md px-lg font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-hairline hover:bg-canvas/50 transition-colors">
                <td className="py-md px-lg">{formatDate(order.created_at)}</td>
                <td className="py-md px-lg capitalize text-ink/70">{order.package_id}</td>
                <td className="py-md px-lg font-medium">{order.coins}</td>
                <td className="py-md px-lg">${formatPrice(order.price_cents)}</td>
                <td className="py-md px-lg">
                  <span className={`px-xs py-xs rounded-full text-button font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
