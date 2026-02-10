// src/modules/admin/pages/UsersPage.tsx
import { Card, CardContent } from '@/components/ui';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Users</h1>
        <p className="text-neutral-600 mt-2">Manage system users and permissions</p>
      </div>
      <Card padding="lg">
        <CardContent>
          <p className="text-neutral-600">Users Table Placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}