import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getCoinPackages,
  createCoinOrder,
  type CoinPackage,
} from '../lib/supabase';
import { Zap, Loader } from 'lucide-react';

interface BillingPackagesProps {
  onPurchaseSuccess?: () => void;
}

export function BillingPackages({ onPurchaseSuccess }: BillingPackagesProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setError(null);
        const res = await getCoinPackages();
        if (res.error) throw res.error;
        setPackages(res.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load packages';
        setError(message);
        console.error('Packages error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      setError('You must be logged in to purchase');
      return;
    }

    try {
      setPurchasingPackageId(packageId);
      setError(null);
      const result = await createCoinOrder(packageId);

      if (result.error) throw result.error;

      // Notify parent that purchase was successful
      onPurchaseSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      setError(message);
      console.error('Purchase error:', err);
    } finally {
      setPurchasingPackageId(null);
    }
  };

  if (loading) {
    return (
      <section className="py-section px-lg flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-ink" />
      </section>
    );
  }

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <section className="py-section px-lg">
      <h2 className="text-headline font-semibold text-ink mb-lg">Available Packages</h2>

      {error && (
        <div className="mb-lg p-lg bg-red-50 border border-red-200 rounded-lg">
          <p className="text-body text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {packages.map((pkg) => (
          <article
            key={pkg.id}
            className="p-lg bg-surface-soft rounded-lg flex flex-col gap-md border border-hairline hover:border-ink/30 transition-colors"
          >
            <div>
              <h3 className="text-card-title font-bold text-ink">{pkg.label}</h3>
              <p className="text-body-sm text-ink/70">{pkg.coins} coins</p>
            </div>

            <div className="flex-grow">
              <p className="text-display-sm font-semibold text-ink">
                ${formatPrice(pkg.price_cents)}
              </p>
              <p className="text-body-sm text-ink/60">USD per order</p>
            </div>

            <button
              onClick={() => handlePurchase(pkg.id)}
              disabled={purchasingPackageId === pkg.id}
              className="px-lg py-xs bg-ink text-white rounded-pill text-button font-medium hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-xs"
              type="button"
            >
              {purchasingPackageId === pkg.id ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Purchase
                </>
              )}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
