import React, { useState, useEffect } from 'react';
import { Mail, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EmailSettingsData {
  id: string;
  sendgrid_api_key: string;
  from_email: string;
  from_name: string;
  recipient_email: string;
  enabled: boolean;
}

export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettingsData>({
    id: '00000000-0000-0000-0000-000000000001',
    sendgrid_api_key: '',
    from_email: '',
    from_name: '',
    recipient_email: '',
    enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
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
          sendgrid_api_key: settings.sendgrid_api_key,
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
                Konfigurer SendGrid til at sende emails fra kontaktformularen
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">SendGrid Opsætning</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Opret en konto på <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a></li>
                  <li>Opret en API-nøgle under Settings → API Keys</li>
                  <li>Verificer din afsender email under Settings → Sender Authentication</li>
                  <li>Indtast dine oplysninger nedenfor</li>
                </ol>
              </div>
            </div>
          </div>

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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                SendGrid API-nøgle *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.sendgrid_api_key}
                  onChange={(e) => setSettings({ ...settings, sendgrid_api_key: e.target.value })}
                  placeholder="SG.xxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Din SendGrid API-nøgle starter typisk med "SG."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Afsender email *
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
                  Skal være verificeret i SendGrid
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Afsender navn *
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
                Modtager email *
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

          <div className="flex justify-end pt-4 border-t border-slate-200">
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
