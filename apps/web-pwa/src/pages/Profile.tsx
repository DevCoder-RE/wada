import { useEffect, useState } from 'react';
import { DatabaseService, AuthService } from '@wada-bmad/api-client';
import type { AthleteProfile } from '@wada-bmad/types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sport: '',
    team: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          const result = await DatabaseService.getAthleteProfile(user.id);
          if (result.data) {
            setProfile(result.data);
            setFormData({
              name: result.data.name || '',
              email: result.data.email || '',
              sport: result.data.sport || '',
              team: result.data.team || '',
              dateOfBirth: result.data.dateOfBirth ? result.data.dateOfBirth.toISOString().split('T')[0] : '',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    // In a real implementation, you would call an API to update the profile
    // For now, we'll just update the local state
    if (profile) {
      const updatedProfile = {
        ...profile,
        name: formData.name,
        email: formData.email,
        sport: formData.sport,
        team: formData.team,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      };
      setProfile(updatedProfile);
    }
    setEditing(false);
  };

  const handleSignOut = async () => {
    const result = await AuthService.signOut();
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your athlete profile and account settings.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Personal Information
            </h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{profile?.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{profile?.email || 'Not set'}</p>
              )}
            </div>

            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700">
                Sport
              </label>
              {editing ? (
                <input
                  type="text"
                  id="sport"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{profile?.sport || 'Not set'}</p>
              )}
            </div>

            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700">
                Team
              </label>
              {editing ? (
                <input
                  type="text"
                  id="team"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{profile?.team || 'Not set'}</p>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              {editing ? (
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Account Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;