import type { IRiderDashboardStats } from "../types";

interface Props {
  stats: IRiderDashboardStats | null;
  loading?: boolean;
}

const StatCard = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-gray-950">
      {value}
    </p>
    {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
  </div>
);

const RiderStatsOverview = ({ stats, loading }: Props) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-md" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Today"
          value={`₹${stats.todayEarnings}`}
          sub="Earnings"
        />
        <StatCard
          label="This week"
          value={`₹${stats.weekEarnings}`}
          sub="Earnings"
        />
        <StatCard
          label="This month"
          value={`₹${stats.monthEarnings}`}
          sub="Earnings"
        />
        <StatCard
          label="All time"
          value={`₹${stats.totalEarnings}`}
          sub={`${stats.totalDelivered} deliveries`}
        />
        <StatCard
          label="Active"
          value={String(stats.activeDeliveries)}
          sub="In progress"
        />
        <StatCard
          label="Distance"
          value={`${stats.totalDistanceKm} km`}
          sub="Delivered total"
        />
      </div>
      <p className="text-xs text-gray-500">
        Rider pay: ₹17 per km (rounded up). Shown amounts are from completed,
        paid deliveries only.
      </p>
    </div>
  );
};

export default RiderStatsOverview;
