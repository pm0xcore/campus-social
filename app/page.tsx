import { UserInfo } from '@/components/UserInfo';
import { FeedCard } from '@/components/FeedCard';
import { StatsCard } from '@/components/StatsCard';

const quickLinks = [
  { href: '/groups', label: 'Groups', icon: '👥', description: 'Join communities' },
  { href: '/friends', label: 'Friends', icon: '🤝', description: 'Your connections' },
  { href: '/messages', label: 'Messages', icon: '💬', description: 'Conversations' },
];

export default function Home() {
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Campus Social</h1>
      <p className="text-gray-600 mb-6">
        Connect with your university community on Open Campus.
      </p>

      {/* Featured: Discover - Prominent CTA */}
      <section className="mb-6">
        <a
          href="/discover"
          className="block p-6 bg-gradient-to-r from-brand-blue to-brand-cyan rounded-xl text-white hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Discover Classmates</h2>
              <p className="text-white/80 text-sm">
                Find and connect with people at your university
              </p>
            </div>
            <span className="text-4xl">🔍</span>
          </div>
        </a>
      </section>

      {/* Featured: Feed */}
      <section className="mb-6">
        <FeedCard />
      </section>

      {/* Quick Links */}
      <section className="mb-6">
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-brand-blue hover:shadow-sm transition-all"
            >
              <span className="text-2xl mb-1">{link.icon}</span>
              <span className="text-sm font-medium text-gray-900">{link.label}</span>
              <span className="text-xs text-gray-500 hidden sm:block">{link.description}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-6">
        <h2 className="text-lg font-medium mb-3">Community</h2>
        <StatsCard />
      </section>

      {/* User Info */}
      <section className="mb-6">
        <h2 className="text-lg font-medium mb-3">Your Profile</h2>
        <UserInfo />
      </section>
    </main>
  );
}
