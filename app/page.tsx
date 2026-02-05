import { UserInfo } from '@/components/UserInfo';
import { TrackEventButton } from '@/components/TrackEventButton';
import { ApiTest } from '@/components/ApiTest';

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-2">Open Campus Mini-App</h1>
      <p className="text-gray-600 mb-8">
        A minimal template with authentication and analytics.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">User</h2>
        <UserInfo />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">Analytics</h2>
        <TrackEventButton />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-medium mb-4">API Test</h2>
        <ApiTest />
      </section>

      <section className="text-sm text-gray-500">
        <h2 className="text-lg font-medium mb-4 text-gray-900">
          Getting Started
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Edit <code className="bg-gray-100 px-1 rounded">app/page.tsx</code>{' '}
            to modify this page
          </li>
          <li>
            Add new pages in{' '}
            <code className="bg-gray-100 px-1 rounded">app/</code> folder
          </li>
          <li>
            Create API routes in{' '}
            <code className="bg-gray-100 px-1 rounded">app/api/</code>
          </li>
          <li>Check README.md for detailed documentation</li>
        </ul>
      </section>
    </main>
  );
}
