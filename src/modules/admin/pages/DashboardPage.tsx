// src/modules/admin/pages/DashboardPage.tsx
import AdminKPIs from '../components/AdminKPIs';
import SalesChart from '../components/SalesChart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">Monitor your store's performance and key metrics</p>
      </div>

      {/* KPIs Section */}
      <AdminKPIs />

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
          <CardDescription>Track your sales performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesChart />
        </CardContent>
      </Card>
    </div>
  );
}
