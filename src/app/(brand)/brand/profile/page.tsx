'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Bell,
  Camera,
  Eye,
  EyeOff,
  Check,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  X,
  Shield,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';

type ProfileTab = 'personal' | 'security' | 'notifications' | 'sessions';

export default function UserProfilePage() {
  const router = useRouter();
  const { partner } = useBrand();

  // Get current user (first team member in mock data)
  const currentUser = partner?.teamMembers[0];

  // ============================================
  // ALL HOOKS MUST BE BEFORE ANY EARLY RETURN
  // ============================================

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: '+33 6 12 34 56 78',
    jobTitle: 'Brand Director',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailAlerts: true,
    emailReports: false,
    pushOrders: true,
    pushAlerts: true,
    pushReports: false
  });

  const twoFAModalRef = useModalAccessibility(show2FAModal, () => setShow2FAModal(false));

  // Early return AFTER all hooks
  if (!partner || !currentUser) return null;

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sessions', label: 'Sessions', icon: Monitor }
  ];

  const activeSessions = [
    {
      id: 'session-1',
      device: 'MacBook Pro',
      browser: 'Chrome 121',
      location: 'Paris, France',
      ip: '192.168.1.xxx',
      lastActive: 'Active now',
      current: true,
      icon: Monitor
    },
    {
      id: 'session-2',
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      location: 'Paris, France',
      ip: '192.168.1.xxx',
      lastActive: '2 hours ago',
      current: false,
      icon: Smartphone
    },
    {
      id: 'session-3',
      device: 'Windows PC',
      browser: 'Firefox 122',
      location: 'Milan, Italy',
      ip: '10.0.0.xxx',
      lastActive: 'Yesterday',
      current: false,
      icon: Monitor
    }
  ];

  // ============================================
  // PASSWORD VALIDATION
  // ============================================

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 8) return { label: 'Too short', color: 'bg-error', width: '20%' };
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const score = (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0) + (password.length >= 12 ? 1 : 0);
    if (score <= 1) return { label: 'Weak', color: 'bg-error', width: '33%' };
    if (score <= 2) return { label: 'Fair', color: 'bg-warning', width: '50%' };
    if (score <= 3) return { label: 'Good', color: 'bg-info', width: '75%' };
    return { label: 'Strong', color: 'bg-success', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setSavedMessage('Changes saved successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handlePasswordChange = () => {
    setPasswordError(null);

    const strengthError = validatePassword(formData.newPassword);
    if (strengthError) {
      setPasswordError(strengthError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    console.log('Changing password');
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError(null);
    setSavedMessage('Password updated successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleLogoutSession = (sessionId: string) => {
    console.log('Logging out session:', sessionId);
    setSavedMessage('Session terminated successfully');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleLogoutAll = () => {
    try {
      localStorage.clear();
    } catch { /* no-op */ }
    router.push('/auth/login');
  };

  const handleLogoutSingle = () => {
    try {
      localStorage.clear();
    } catch { /* no-op */ }
    router.push('/auth/login');
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setShowAvatarInput(false);
  };

  const handleAvatarUrlSubmit = () => {
    if (!avatarUrl.trim()) return;
    setAvatarPreview(avatarUrl.trim());
    setAvatarUrl('');
    setShowAvatarInput(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'manager':
        return 'bg-info/10 text-info';
      case 'analyst':
        return 'bg-success/10 text-success';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  return (
    <div>
      <BrandPageHeader
        title="My Profile"
        subtitle="Manage your personal account settings"
      />

      <div className="p-8">
        {/* Success Message */}
        {savedMessage && (
          <div className="mb-6 px-4 py-3 bg-success/10 text-success text-sm flex items-center gap-2">
            <Check size={16} />
            {savedMessage}
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar with Avatar */}
          <div className="w-64 flex-shrink-0">
            {/* User Card */}
            <div className="bg-white border border-sand/50 p-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block">
                  {avatarPreview || currentUser.avatar ? (
                    <img
                      src={avatarPreview || currentUser.avatar}
                      alt={currentUser.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-parchment rounded-full flex items-center justify-center text-2xl text-stone mx-auto">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <button
                    onClick={() => setShowAvatarInput(!showAvatarInput)}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-charcoal-deep text-ivory-cream rounded-full flex items-center justify-center hover:bg-noir transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>

                {/* Avatar input dropdown */}
                {showAvatarInput && (
                  <div className="mt-3 space-y-2 text-left">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-3 py-2 text-xs text-charcoal-deep border border-sand hover:bg-parchment transition-colors text-left"
                    >
                      Upload from file...
                    </button>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Or paste image URL"
                        className="flex-1 px-3 py-2 text-xs border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAvatarUrlSubmit(); }}
                      />
                      <button
                        onClick={handleAvatarUrlSubmit}
                        disabled={!avatarUrl.trim()}
                        className="px-3 py-2 bg-charcoal-deep text-ivory-cream text-xs hover:bg-noir transition-colors disabled:opacity-40"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <h3 className="font-medium text-charcoal-deep mt-4">{currentUser.name}</h3>
                <p className="text-sm text-taupe">{currentUser.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getRoleBadge(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-parchment text-charcoal-deep'
                        : 'text-stone hover:text-charcoal-deep hover:bg-parchment/50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Personal Information
                  </h2>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSave}>
                    Save Changes
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Change Password
                  </h2>

                  {/* Inline password error */}
                  {passwordError && (
                    <div className="mb-6 px-4 py-3 bg-error/10 text-error text-sm flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal-deep transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, newPassword: e.target.value });
                            setPasswordError(null);
                          }}
                          className="w-full px-4 py-3 pr-12 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal-deep transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {/* Password strength indicator */}
                      {formData.newPassword && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-sand overflow-hidden">
                            <div
                              className={`h-full transition-all ${passwordStrength.color}`}
                              style={{ width: passwordStrength.width }}
                            />
                          </div>
                          <p className={`text-xs mt-1 ${
                            passwordStrength.label === 'Strong' ? 'text-success' :
                            passwordStrength.label === 'Good' ? 'text-info' :
                            passwordStrength.label === 'Fair' ? 'text-warning' :
                            'text-error'
                          }`}>
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-taupe mt-2">At least 8 characters with a mix of letters and numbers</p>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData({ ...formData, confirmPassword: e.target.value });
                            setPasswordError(null);
                          }}
                          className="w-full px-4 py-3 pr-12 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal-deep transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <p className="text-xs text-error mt-1">Passwords do not match</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Two-Factor Authentication
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-deep">Protect your account with 2FA</p>
                      <p className="text-xs text-taupe mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setShow2FAModal(true)}
                      className="px-4 py-2 border border-sand text-sm text-charcoal-deep hover:bg-parchment transition-colors"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton
                    onClick={handlePasswordChange}
                    disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                  >
                    Update Password
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Email Notifications
                  </h2>

                  <div className="space-y-4">
                    {[
                      { key: 'emailOrders', label: 'Order Updates', description: 'Get notified about new orders and status changes' },
                      { key: 'emailAlerts', label: 'Inventory Alerts', description: 'Receive alerts for low stock and restocks' },
                      { key: 'emailReports', label: 'Weekly Reports', description: 'Receive weekly performance summaries' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-sand/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                          <p className="text-xs text-taupe">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-sand peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-charcoal-deep" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Push Notifications
                  </h2>

                  <div className="space-y-4">
                    {[
                      { key: 'pushOrders', label: 'Order Updates', description: 'Real-time notifications for new orders' },
                      { key: 'pushAlerts', label: 'Urgent Alerts', description: 'Critical inventory and system alerts' },
                      { key: 'pushReports', label: 'Daily Digest', description: 'Daily summary of key metrics' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-sand/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                          <p className="text-xs text-taupe">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-sand peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-charcoal-deep" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSave}>
                    Save Preferences
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">
                    Active Sessions
                  </h2>
                  <p className="text-sm text-stone mb-6">
                    These are the devices currently logged into your account. You can log out of any session you don&apos;t recognize.
                  </p>

                  <div className="space-y-4">
                    {activeSessions.map(session => {
                      const Icon = session.icon;
                      return (
                        <div key={session.id} className={`p-4 border ${session.current ? 'border-success/30 bg-success/5' : 'border-sand/50'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 flex items-center justify-center ${session.current ? 'bg-success/10 text-success' : 'bg-parchment text-stone'}`}>
                                <Icon size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-charcoal-deep">{session.device}</p>
                                  {session.current && (
                                    <span className="px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase bg-success/10 text-success">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-stone mt-1">{session.browser}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-taupe">
                                  <span className="flex items-center gap-1">
                                    <Globe size={12} />
                                    {session.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {session.lastActive}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {!session.current && (
                              <button
                                onClick={() => handleLogoutSession(session.id)}
                                className="text-xs text-error hover:text-error/80 transition-colors flex items-center gap-1"
                              >
                                <LogOut size={12} />
                                Log out
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal-deep">Log out of all other sessions</p>
                      <p className="text-xs text-taupe mt-1">This will log you out of all devices except this one</p>
                    </div>
                    <button
                      onClick={handleLogoutAll}
                      className="px-4 py-2 border border-error/30 text-sm text-error hover:bg-error/5 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Log out all
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-deep/40 backdrop-blur-sm"
            onClick={() => setShow2FAModal(false)}
          />
          <div
            ref={twoFAModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="2fa-modal-title"
            className="relative bg-white w-full max-w-md shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
              <h2 id="2fa-modal-title" className="font-display text-lg text-charcoal-deep">Set Up Two-Factor Authentication</h2>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-stone hover:text-charcoal-deep transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-48 h-48 bg-parchment border border-sand/50 flex items-center justify-center mx-auto">
                  <div className="text-center">
                    <Shield size={40} className="text-taupe mx-auto mb-2" />
                    <p className="text-xs text-stone">QR Code Placeholder</p>
                    <p className="text-[10px] text-taupe mt-1">Scan with your authenticator app</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Manual Entry Code
                </label>
                <div className="px-4 py-3 bg-parchment/50 border border-sand font-mono text-sm text-charcoal-deep text-center tracking-widest">
                  XXXX-XXXX-XXXX-XXXX
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-sand text-charcoal-deep text-center tracking-[0.5em] placeholder:tracking-normal focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setSavedMessage('Two-factor authentication enabled (placeholder)');
                    setTimeout(() => setSavedMessage(null), 3000);
                  }}
                  className="px-6 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
