import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService, AuthService } from '@wada-bmad/api-client';
import type { LogbookEntry, AthleteProfile } from '@wada-bmad/types';
import { formatDateTime } from '@wada-bmad/utils';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [recentEntries, setRecentEntries] = useState<LogbookEntry[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisWeek: 0,
    verifiedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          const [profileResult, entriesResult] = await Promise.all([
            DatabaseService.getAthleteProfile(user.id),
            DatabaseService.getLogbookEntries(user.id),
          ]);

          if (profileResult.data) {
            setProfile(profileResult.data);
          }

          if (entriesResult.data) {
            setRecentEntries(entriesResult.data.slice(0, 5));
            setStats({
              totalEntries: entriesResult.data.length,
              thisWeek: entriesResult.data.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return entryDate >= weekAgo;
              }).length,
              verifiedCount: entriesResult.data.filter(entry => entry.verified).length,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'Athlete'}!
          </h1>
          <p className="text-gray-600">
            Track your supplement intake and maintain WADA compliance.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Entries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalEntries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Week
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.thisWeek}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Verified
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.verifiedCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/scanner"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <span className="mr-2">📱</span>
              Scan Supplement
            </Link>
            <Link
              to="/logbook"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <span className="mr-2">📓</span>
              View Logbook
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          {recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Supplement logged
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(entry.timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      entry.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No recent activity. Start by scanning a supplement!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;