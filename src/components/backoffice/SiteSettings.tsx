import React, { useState, useEffect } from 'react';
import { Save, Globe, Search } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const SiteSettings: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useData();
  const [formData, setFormData] = useState({
    siteName: siteConfig.siteName,
    seoSettings: siteConfig.seoSettings
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!isSaving) {
      setFormData({
        siteName: siteConfig.siteName,
        seoSettings: siteConfig.seoSettings
      });
    }
  }, [siteConfig, isSaving]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    updateSiteConfig(formData);

    setSaveMessage('Indstillinger gemt succesfuldt!');
    setIsSaving(false);

    setTimeout(() => setSaveMessage(''), 3000);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSeoSettings = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seoSettings: {
        ...prev.seoSettings,
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Site Indstillinger</h2>
        {saveMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
            {saveMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} />
            Generelle Indstillinger
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Navn
              </label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => updateFormData('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search size={20} />
            SEO Indstillinger
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Titel
              </label>
              <input
                type="text"
                value={formData.seoSettings.defaultTitle}
                onChange={(e) => updateSeoSettings('defaultTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Vises i browser fanen og søgeresultater
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Beskrivelse
              </label>
              <textarea
                rows={3}
                value={formData.seoSettings.defaultDescription}
                onChange={(e) => updateSeoSettings('defaultDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.seoSettings.defaultDescription.length}/160 tegn - Vises i søgeresultater
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isSaving ? 'Gemmer...' : 'Gem Indstillinger'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettings;
