import React, { useState, useEffect } from 'react';
import { Mail, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { getBackofficeSessionToken } from '../../lib/backofficeSession';

interface EmailSettingsData {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  recipient_email: string;
  enabled: boolean;
}

export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettingsData>({
    id: '00000000-0000-0000-0000-000000000001',
    smtp_host: 'smtp.simply.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_secure: false,
    from_email: '',
    from_name: '',
    recipient_email: '',
    enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = getBackofficeSessionToken();
      if (!token) {
        setMessage({ type: 'error', text: 'Session udløbet. Log ind igen.' });
        return;
      }

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      const response = await fetch('/api/email-settings', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      window.clearTimeout(timeout);

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Ukendt fejl ved indlæsning');
      }

      if (result.settings) setSettings(result.settings);
    } catch (error) {
      console.error('Error loading email settings:', error);
      setMessage({ type: 'error', text: 'Kunne ikke indlæse email indstillinger' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = getBackofficeSessionToken();
      if (!token) {
        throw new Error('Session udløbet');
      }

      const response = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smtp_host: settings.smtp_host,
          smtp_port: settings.smtp_port,
          smtp_username: settings.smtp_username,
          smtp_password: settings.smtp_password,
          smtp_secure: settings.smtp_secure,
          from_email: settings.from_email,
          from_name: settings.from_name,
          recipient_email: settings.recipient_email,
          enabled: settings.enabled,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Ukendt fejl ved gem');
      }

      setMessage({ type: 'success', text: 'Email indstillinger gemt' });
    } catch (error) {
      console.error('Error saving email settings:', error);
      setMessage({ type: 'error', text: 'Kunne ikke gemme email indstillinger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-slate-700" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Email Indstillinger</h2>
              <p className="text-sm text-slate-600 mt-1">
                Konfigurer email udsendelse fra kontaktformularen
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Aktiver email udsendelse
              </label>
              <p className="text-xs text-slate-500 ml-6">
                Når aktiveret, sendes der en email for hver kontaktformular besked
              </p>
            </div>

            <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    smtp_host: 'smtp-relay.brevo.com',
                    smtp_port: 587,
                    smtp_secure: false,
                  }))}
                  className="text-xs px-3 py-1.5 rounded border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  Forudfyld Brevo SMTP
                </button>
              </div>
              <div className="flex items-start gap-2 pb-3 border-b border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">SMTP Server Opsætning</p>
                  <p className="text-blue-700">
                    Indtast dine SMTP server oplysninger. Dette fungerer med alle standard SMTP servere som Simply, One.com, Gmail, etc.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Udgående mailserver *
                  </label>
                  <input
                    type="text"
                    value={settings.smtp_host}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    placeholder="smtp.simply.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    F.eks. smtp.simply.com, smtp.gmail.com
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                    placeholder="587"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Standard: 587 (STARTTLS) eller 465 (SSL)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Udgående brugernavn *
                </label>
                <input
                  type="text"
                  value={settings.smtp_username}
                  onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                  placeholder="brugernavn eller email"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-slate-600 mt-1">
                  SMTP brugernavn (kan være email adresse eller andet format)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Udgående adgangskode *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.smtp_password}
                    onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Adgangskoden til din email konto
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <input
                    type="checkbox"
                    checked={settings.smtp_secure}
                    onChange={(e) => setSettings({ ...settings, smtp_secure: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  Brug SSL (kun til port 465)
                </label>
                <p className="text-xs text-slate-600 mt-1 ml-6">
                  Marker kun hvis du bruger port 465. Port 587 bruger STARTTLS automatisk.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Generelle Indstillinger</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Afsender Email *
                    </label>
                    <input
                      type="email"
                      value={settings.from_email}
                      onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                      placeholder="noreply@ditdomæne.dk"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Skal ofte være samme som brugernavn
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Afsender Navn *
                    </label>
                    <input
                      type="text"
                      value={settings.from_name}
                      onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                      placeholder="Dit Firma"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modtager Email *
                  </label>
                  <input
                    type="email"
                    value={settings.recipient_email}
                    onChange={(e) => setSettings({ ...settings, recipient_email: e.target.value })}
                    placeholder="kontakt@ditdomæne.dk"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Kontaktformular beskeder sendes til denne email
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Gemmer...' : 'Gem indstillinger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
