// src/modules/admin/pages/DashboardPage.tsx
import AdminKPIs from '../components/AdminKPIs';
import SalesChart from '../components/SalesChart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Monitor your store's performance and key metrics</p>
      </div>

      {/* KPIs Section */}
      <AdminKPIs />

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Analytics</h2>
        <SalesChart />
      </div>
    </div>
  );
}