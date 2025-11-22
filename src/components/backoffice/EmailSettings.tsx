import React, { useState, useEffect } from 'react';
import { Mail, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailSettingsData {
  id: string;
  provider: 'sendgrid' | 'gmail';
  sendgrid_api_key: string;
  gmail_smtp_host: string;
  gmail_smtp_port: number;
  gmail_smtp_username: string;
  gmail_smtp_password: string;
  gmail_smtp_secure: boolean;
  from_email: string;
  from_name: string;
  recipient_email: string;
  enabled: boolean;
}

export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettingsData>({
    id: '00000000-0000-0000-0000-000000000001',
    provider: 'sendgrid',
    sendgrid_api_key: '',
    gmail_smtp_host: 'smtp.gmail.com',
    gmail_smtp_port: 587,
    gmail_smtp_username: '',
    gmail_smtp_password: '',
    gmail_smtp_secure: true,
    from_email: '',
    from_name: '',
    recipient_email: '',
    enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSendGridKey, setShowSendGridKey] = useState(false);
  const [showGmailPassword, setShowGmailPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
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
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('email_settings')
        .update({
          provider: settings.provider,
          sendgrid_api_key: settings.sendgrid_api_key,
          gmail_smtp_host: settings.gmail_smtp_host,
          gmail_smtp_port: settings.gmail_smtp_port,
          gmail_smtp_username: settings.gmail_smtp_username,
          gmail_smtp_password: settings.gmail_smtp_password,
          gmail_smtp_secure: settings.gmail_smtp_secure,
          from_email: settings.from_email,
          from_name: settings.from_name,
          recipient_email: settings.recipient_email,
          enabled: settings.enabled,
          updated_at: new Date().toISOString(),
          updated_by: userData.user?.id,
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

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

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Vælg Email Provider *
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  settings.provider === 'sendgrid'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}>
                  <input
                    type="radio"
                    value="sendgrid"
                    checked={settings.provider === 'sendgrid'}
                    onChange={(e) => setSettings({ ...settings, provider: e.target.value as 'sendgrid' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={`font-medium ${
                    settings.provider === 'sendgrid' ? 'text-blue-900' : 'text-slate-700'
                  }`}>
                    SendGrid
                  </span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 rounded-lg cursor-not-allowed transition-all opacity-50 ${
                  settings.provider === 'gmail'
                    ? 'border-red-600 bg-red-50'
                    : 'border-slate-300 bg-white'
                }`}>
                  <input
                    type="radio"
                    value="gmail"
                    checked={settings.provider === 'gmail'}
                    onChange={(e) => setSettings({ ...settings, provider: e.target.value as 'gmail' })}
                    className="w-4 h-4 text-red-600"
                    disabled
                  />
                  <span className={`font-medium ${
                    settings.provider === 'gmail' ? 'text-red-900' : 'text-slate-700'
                  }`}>
                    Gmail SMTP (Ikke understøttet)
                  </span>
                </label>
              </div>
            </div>

            {settings.provider === 'sendgrid' && (
              <div className="space-y-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start gap-2 pb-3 border-b border-blue-200">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">SendGrid Opsætning</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Opret en konto på <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a></li>
                      <li>Opret en API-nøgle under Settings → API Keys</li>
                      <li>Verificer din afsender email under Settings → Sender Authentication</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    SendGrid API-nøgle *
                  </label>
                  <div className="relative">
                    <input
                      type={showSendGridKey ? 'text' : 'password'}
                      value={settings.sendgrid_api_key}
                      onChange={(e) => setSettings({ ...settings, sendgrid_api_key: e.target.value })}
                      placeholder="SG.xxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={settings.provider === 'sendgrid'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSendGridKey(!showSendGridKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showSendGridKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Din SendGrid API-nøgle starter typisk med "SG."
                  </p>
                </div>
              </div>
            )}

            {settings.provider === 'gmail' && (
              <div className="space-y-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-2 pb-3 border-b border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-2">ADVARSEL: Gmail SMTP er ikke understøttet</p>
                    <p className="mb-2 text-red-700">
                      Gmail SMTP via raw sockets er ikke understøttet i Supabase Edge Functions på grund af tekniske begrænsninger.
                    </p>
                    <p className="font-medium text-red-900">
                      Brug venligst SendGrid i stedet, eller implementer Gmail API med OAuth (avanceret).
                    </p>
                    <p className="mt-2 text-red-700">
                      Beskeder vil stadig blive gemt i databasen, men emails sendes ikke.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      value={settings.gmail_smtp_host}
                      onChange={(e) => setSettings({ ...settings, gmail_smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={settings.provider === 'gmail'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      SMTP Port *
                    </label>
                    <input
                      type="number"
                      value={settings.gmail_smtp_port}
                      onChange={(e) => setSettings({ ...settings, gmail_smtp_port: parseInt(e.target.value) })}
                      placeholder="587"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={settings.provider === 'gmail'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Gmail Email Adresse *
                  </label>
                  <input
                    type="email"
                    value={settings.gmail_smtp_username}
                    onChange={(e) => setSettings({ ...settings, gmail_smtp_username: e.target.value })}
                    placeholder="din.email@gmail.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={settings.provider === 'gmail'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Gmail App Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showGmailPassword ? 'text' : 'password'}
                      value={settings.gmail_smtp_password}
                      onChange={(e) => setSettings({ ...settings, gmail_smtp_password: e.target.value })}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={settings.provider === 'gmail'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowGmailPassword(!showGmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showGmailPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Brug en App Password, ikke din almindelige Gmail adgangskode
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <input
                      type="checkbox"
                      checked={settings.gmail_smtp_secure}
                      onChange={(e) => setSettings({ ...settings, gmail_smtp_secure: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    Brug sikker forbindelse (TLS/SSL)
                  </label>
                  <p className="text-xs text-slate-600 mt-1 ml-6">
                    Anbefalet: Lad dette være aktiveret
                  </p>
                </div>
              </div>
            )}

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
                      {settings.provider === 'sendgrid'
                        ? 'Skal være verificeret i SendGrid'
                        : 'For Gmail, brug samme som Gmail Email Adresse'}
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

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Aktiv provider:</span>{' '}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                settings.provider === 'sendgrid'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {settings.provider === 'sendgrid' ? 'SendGrid' : 'Gmail SMTP'}
              </span>
            </div>
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
