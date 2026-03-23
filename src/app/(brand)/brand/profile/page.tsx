'use client';

import { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Lock, Bell, Camera, Eye, EyeOff, Check,
  Clock, Monitor, Smartphone, Globe, Loader2
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { brandChangePassword, updateBrandProfile } from '@/services/auth.service';
import { uploadImage } from '@/services/brand-product.service';

type ProfileTab = 'personal' | 'security' | 'notifications' | 'sessions';

interface BrandProfile {
  brand_id: string;
  brand_name: string;
  brand_logo?: string | null;
  brand_category: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture?: string | null;
  email: string;
  phone_number: string;
  job_title: string;
  language: string;
  timezone: string;
  currency: string;
  notification_preferences: Record<string, boolean>;
  email_notification: Record<string, boolean>;
  push_notification: Record<string, boolean>;
  devices: Array<{
    device_type?: string;
    device_name?: string;
    browse_type?: string;
    location?: string;
    last_active_time?: string;
    is_current?: boolean;
    is_active?: boolean;
  }>;
  is_2fa_enabled: boolean;
}

async function fetchBrandProfile(): Promise<BrandProfile> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
  const res = await fetch('/api/v1/brand/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export default function UserProfilePage() {
  const { partner } = useBrand();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    language: 'english',
    timezone: 'America/New_York',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailOrders: false,
    emailAlerts: false,
    emailReports: false,
    pushOrders: false,
    pushAlerts: false,
    pushReports: false,
  });

  // Load real profile from API
  useEffect(() => {
    fetchBrandProfile()
      .then(data => {
        setProfile(data);
        setFormData(prev => ({
          ...prev,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone_number || '',
          jobTitle: data.job_title || '',
          language: data.language || 'english',
          timezone: data.timezone || 'America/New_York',
        }));
        setNotifications({
          emailOrders: data.email_notification?.order_updates ?? false,
          emailAlerts: data.email_notification?.inventory_alerts ?? false,
          emailReports: data.email_notification?.weekly_reports ?? false,
          pushOrders: data.push_notification?.order_updates ?? false,
          pushAlerts: data.push_notification?.urgent_alerts ?? false,
          pushReports: data.push_notification?.daily_digest ?? false,
        });
      })
      .catch(() => {})
      .finally(() => setIsLoadingProfile(false));
  }, []);

  const showSuccess = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(null), 3000);
  };
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploadingAvatar(true);
    try {
      const url = await uploadImage(file);
      await updateBrandProfile({ profile_picture: url });
      setProfile(prev => prev ? { ...prev, profile_picture: url } : prev);
      showSuccess('Profile picture updated');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to upload picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateBrandProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        job_title: formData.jobTitle,
        language: formData.language,
        timezone: formData.timezone,
      });
      setProfile(prev => prev ? { ...prev, ...(updated as Partial<BrandProfile>) } : prev);
      showSuccess('Changes saved successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await updateBrandProfile({
        email_notification: {
          order_updates: notifications.emailOrders,
          inventory_alerts: notifications.emailAlerts,
          weekly_reports: notifications.emailReports,
        },
        push_notification: {
          order_updates: notifications.pushOrders,
          urgent_alerts: notifications.pushAlerts,
          daily_digest: notifications.pushReports,
        },
      });
      showSuccess('Notification preferences saved');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await brandChangePassword({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_new_password: formData.confirmPassword,
      });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      showSuccess('Password updated successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : partner?.teamMembers[0]?.name || '';

  const displayEmail = profile?.email || partner?.teamMembers[0]?.email || '';
  const displayRole = profile?.role || partner?.teamMembers[0]?.role || 'admin';
  const displayAvatar = profile?.profile_picture || partner?.teamMembers[0]?.avatar;

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sessions', label: 'Sessions', icon: Monitor },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gold-soft/20 text-gold-deep';
      case 'manager': return 'bg-info/10 text-info';
      case 'analyst': return 'bg-success/10 text-success';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-stone" />
      </div>
    );
  }

  return (
    <div>
      <BrandPageHeader title="My Profile" subtitle="Manage your personal account settings" />

      <div className="p-8">
        {savedMessage && (
          <div className="mb-6 px-4 py-3 bg-success/10 text-success text-sm flex items-center gap-2">
            <Check size={16} />{savedMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white border border-sand/50 p-6 mb-6">
              <div className="text-center">
                <div className={`relative inline-block ${isUploadingAvatar ? 'opacity-50' : ''}`}>
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={displayName} className="w-24 h-24 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-24 h-24 bg-parchment rounded-full flex items-center justify-center text-2xl text-stone mx-auto">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-charcoal-deep text-ivory-cream rounded-full flex items-center justify-center hover:bg-noir transition-colors disabled:opacity-50"
                  >
                    <Camera size={14} />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                </div>
                <h3 className="font-medium text-charcoal-deep mt-4">{displayName}</h3>
                <p className="text-sm text-taupe">{displayEmail}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getRoleBadge(displayRole)}`}>
                  {displayRole}
                </span>
                {profile?.is_2fa_enabled && (
                  <p className="text-[10px] text-success mt-2 tracking-[0.1em] uppercase">2FA Enabled</p>
                )}
              </div>
            </div>

            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      activeTab === tab.id ? 'bg-parchment text-charcoal-deep' : 'text-stone hover:text-charcoal-deep hover:bg-parchment/50'
                    }`}
                  >
                    <Icon size={18} />{tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-2xl">

            {/* Personal Info */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">Personal Information</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">First Name</label>
                        <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Last Name</label>
                        <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
                        <input type="email" value={formData.email} disabled
                          className="w-full pl-11 pr-4 py-3 border border-sand text-stone bg-parchment/30 cursor-not-allowed" />
                      </div>
                      <p className="text-xs text-taupe mt-1">Contact support to change your email address</p>
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Phone Number</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors" />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Job Title</label>
                      <input type="text" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Language</label>
                        <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white">
                          <option value="english">English</option>
                          <option value="french">French</option>
                          <option value="german">German</option>
                          <option value="italian">Italian</option>
                          <option value="spanish">Spanish</option>
                          <option value="arabic">Arabic</option>
                          <option value="japanese">Japanese</option>
                          <option value="chinese">Chinese</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">Timezone</label>
                        <select value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors bg-white">
                          <option value="America/New_York">New York (EST)</option>
                          <option value="America/Los_Angeles">Los Angeles (PST)</option>
                          <option value="America/Chicago">Chicago (CST)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Europe/Berlin">Berlin (CET)</option>
                          <option value="Asia/Dubai">Dubai (GST)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Asia/Shanghai">Shanghai (CST)</option>
                          <option value="Asia/Kolkata">Mumbai (IST)</option>
                          <option value="Australia/Sydney">Sydney (AEST)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">Change Password</h2>
                  <div className="space-y-6">
                    {[
                      { key: 'currentPassword', label: 'Current Password', show: showCurrentPassword, toggle: () => setShowCurrentPassword(v => !v), placeholder: 'Enter current password' },
                      { key: 'newPassword', label: 'New Password', show: showNewPassword, toggle: () => setShowNewPassword(v => !v), placeholder: 'Enter new password' },
                      { key: 'confirmPassword', label: 'Confirm New Password', show: showConfirmPassword, toggle: () => setShowConfirmPassword(v => !v), placeholder: 'Confirm new password' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-2">{field.label}</label>
                        <div className="relative">
                          <input
                            type={field.show ? 'text' : 'password'}
                            value={formData[field.key as keyof typeof formData]}
                            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 pr-12 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                          />
                          <button type="button" onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-taupe hover:text-charcoal-deep transition-colors">
                            {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {field.key === 'newPassword' && <p className="text-xs text-taupe mt-2">At least 8 characters with a mix of letters and numbers</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">Two-Factor Authentication</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-deep">Protect your account with 2FA</p>
                      <p className="text-xs text-taupe mt-1">
                        {profile?.is_2fa_enabled ? 'Two-factor authentication is currently enabled.' : 'Add an extra layer of security to your account'}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 text-xs border ${profile?.is_2fa_enabled ? 'border-success/30 text-success bg-success/5' : 'border-sand text-stone'}`}>
                      {profile?.is_2fa_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton
                    onClick={handlePasswordChange}
                    disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || isChangingPassword}
                  >
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">Email Notifications</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'emailOrders', label: 'Order Updates', description: 'Get notified about new orders and status changes' },
                      { key: 'emailAlerts', label: 'Inventory Alerts', description: 'Receive alerts for low stock and restocks' },
                      { key: 'emailReports', label: 'Weekly Reports', description: 'Receive weekly performance summaries' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-sand/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                          <p className="text-xs text-taupe">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-sand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-charcoal-deep" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">Push Notifications</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'pushOrders', label: 'Order Updates', description: 'Real-time notifications for new orders' },
                      { key: 'pushAlerts', label: 'Urgent Alerts', description: 'Critical inventory and system alerts' },
                      { key: 'pushReports', label: 'Daily Digest', description: 'Daily summary of key metrics' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-sand/30 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-charcoal-deep">{item.label}</p>
                          <p className="text-xs text-taupe">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-sand rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-charcoal-deep" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <PrimaryButton onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {/* Sessions */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 p-6">
                  <h2 className="font-medium text-charcoal-deep border-b border-sand/50 pb-4 mb-6">Active Sessions</h2>
                  <p className="text-sm text-stone mb-6">
                    Devices currently logged into your account. Contact support to revoke a session you don't recognize.
                  </p>

                  {profile?.devices && profile.devices.length > 0 ? (
                    <div className="space-y-4">
                      {profile.devices.filter(d => d.is_active !== false).map((device, idx) => {
                        const isCurrent = device.is_current ?? false;
                        const Icon = device.device_type === 'phone' ? Smartphone : Monitor;
                        return (
                          <div key={idx} className={`p-4 border ${isCurrent ? 'border-success/30 bg-success/5' : 'border-sand/50'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${isCurrent ? 'bg-success/10 text-success' : 'bg-parchment text-stone'}`}>
                                <Icon size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-charcoal-deep">{device.device_name || device.device_type || 'Unknown Device'}</p>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase bg-success/10 text-success">Current</span>
                                  )}
                                </div>
                                {device.browse_type && <p className="text-xs text-stone mt-1 capitalize">{device.browse_type}</p>}
                                <div className="flex items-center gap-4 mt-2 text-xs text-taupe flex-wrap">
                                  {device.location && (
                                    <span className="flex items-center gap-1">
                                      <Globe size={12} />{device.location}
                                    </span>
                                  )}
                                  {device.last_active_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />{device.last_active_time}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-stone text-sm">No active sessions found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
