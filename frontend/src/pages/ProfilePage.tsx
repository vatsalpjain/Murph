/**
 * Profile Page - User settings and account management
 * Allows users to view/edit profile, change password, and manage preferences
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Handle profile update (mock - connect to backend later)
  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Connect to backend API
      // await apiClient.put('/auth/profile', { name, email });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change (mock - connect to backend later)
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Connect to backend API
      // await apiClient.post('/auth/change-password', { currentPassword, newPassword });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-slate-400 text-sm">Manage your account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-400">Changes saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Profile Information */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <User className="h-5 w-5 text-emerald-500" />
            Profile Information
          </h2>

          <div className="grid gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Role Badge */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Account Type
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  user?.role === 'teacher' 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {user?.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save Changes
            </button>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-emerald-500" />
            Change Password
          </h2>

          <div className="grid gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword || !confirmPassword}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              Update Password
            </button>
          </div>
        </section>

        {/* Notification Preferences */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-emerald-500" />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {/* Email Notifications */}
            <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-slate-400">Receive updates about your courses</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>

            {/* Session Reminders */}
            <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
              <div>
                <p className="text-white font-medium">Session Reminders</p>
                <p className="text-sm text-slate-400">Get reminded about scheduled sessions</p>
              </div>
              <input
                type="checkbox"
                checked={sessionReminders}
                onChange={(e) => setSessionReminders(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>

            {/* Marketing Emails */}
            <label className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
              <div>
                <p className="text-white font-medium">Marketing Emails</p>
                <p className="text-sm text-slate-400">Receive offers and promotions</p>
              </div>
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-800"
              />
            </label>
          </div>
        </section>

        {/* Payment History Link */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
          <button
            onClick={() => navigate('/payment')}
            className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              <div className="text-left">
                <p className="text-white font-medium">Payment & Wallet</p>
                <p className="text-sm text-slate-400">Manage your balance and transactions</p>
              </div>
            </div>
            <ArrowLeft className="h-5 w-5 text-slate-400 rotate-180" />
          </button>
        </section>

        {/* Logout */}
        <section className="bg-slate-800 border border-red-500/30 rounded-xl p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
