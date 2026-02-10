import { UserInfo } from '@/components/UserInfo';
import { FeedCard } from '@/components/FeedCard';
import { StatsCard } from '@/components/StatsCard';
import { DailyChallengeCard } from '@/components/DailyChallengeCard';

const quickLinks = [
  { href: '/groups', label: 'Groups', icon: '👥', description: 'Join communities' },
  { href: '/friends', label: 'Friends', icon: '🤝', description: 'Your connections' },
  { href: '/messages', label: 'Messages', icon: '💬', description: 'Conversations' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-brand-blue/5 to-brand-cyan/5">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Campus Crew 🎓
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Connect with classmates, get help, share wins, level up together
          </p>
          
          {/* Primary CTA - Featured Discover */}
          <a
            href="/discover"
            className="inline-block px-8 py-4 bg-white text-brand-blue rounded-xl font-semibold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Discover Classmates →
          </a>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* User Progress Dashboard */}
        <section>
          <UserInfo />
        </section>

        {/* Daily Challenge */}
        <section>
          <DailyChallengeCard streak={0} />
        </section>

        {/* Featured: Feed Preview */}
        <section>
          <FeedCard />
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-medium mb-3 text-gray-900">Quick Access</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-blue hover:shadow-md transition-all"
              >
                <span className="text-3xl mb-2">{link.icon}</span>
                <span className="text-sm font-medium text-gray-900">{link.label}</span>
                <span className="text-xs text-gray-500 hidden sm:block mt-1">{link.description}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Community Stats */}
        <section>
          <h2 className="text-lg font-medium mb-3 text-gray-900">Community</h2>
          <StatsCard />
        </section>
      </div>
    </main>
  );
}
