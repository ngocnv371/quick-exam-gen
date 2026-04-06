/** Shape of a row from the coin_packages table. */
export interface CoinPackage {
  id: string;
  label: string;
  coins: number;
  price_cents: number;
  currency: string;
  sort_order: number;
}

/** Format price_cents as a locale currency string, e.g. 199 → "$1.99" */
export function formatPackagePrice(pkg: CoinPackage): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: pkg.currency,
  }).format(pkg.price_cents / 100);
}
