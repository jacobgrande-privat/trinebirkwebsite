import React, { useState } from 'react';
import { Save, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Globe, Search, Server } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const SiteSettings: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useData();

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const updateConfig = async (updates: any) => {
    try {
      await updateSiteConfig(updates);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const updateSocialMedia = async (platform: string, value: string) => {
    await updateConfig({
      socialMedia: {
        ...siteConfig.socialMedia,
        [platform]: value
      }
    });
  };

  const updateSeoSettings = async (field: string, value: string) => {
    await updateConfig({
      seoSettings: {
        ...siteConfig.seoSettings,
        [field]: value
      }
    });
  };

  const updateContactForm = async (field: string, value: any) => {
    await updateConfig({
      contactForm: {
        ...siteConfig.contactForm,
        [field]: value
      }
    });
  };

  const updateSmtpSettings = async (field: string, value: any) => {
    await updateConfig({
      contactForm: {
        ...siteConfig.contactForm,
        smtpSettings: {
          ...siteConfig.contactForm.smtpSettings,
          [field]: value
        }
      }
    });
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

      <div className="space-y-8">
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
                value={siteConfig.siteName}
                onChange={(e) => updateConfig({ siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail size={20} />
            Kontakt Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresse
              </label>
              <input
                type="email"
                value={siteConfig.contactEmail}
                onChange={(e) => updateConfig({ contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Denne email bruges til kontaktformularen
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Nummer
              </label>
              <input
                type="tel"
                value={siteConfig.phoneNumber}
                onChange={(e) => updateConfig({ phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                rows={3}
                value={siteConfig.address}
                onChange={(e) => updateConfig({ address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Facebook size={20} />
            Sociale Medier
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Facebook size={16} />
                Facebook URL
              </label>
              <input
                type="url"
                value={siteConfig.socialMedia.facebook || ''}
                onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://facebook.com/ditbrugernavn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Twitter size={16} />
                Twitter URL
              </label>
              <input
                type="url"
                value={siteConfig.socialMedia.twitter || ''}
                onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://twitter.com/ditbrugernavn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Instagram size={16} />
                Instagram URL
              </label>
              <input
                type="url"
                value={siteConfig.socialMedia.instagram || ''}
                onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://instagram.com/ditbrugernavn"
              />
            </div>
          </div>
        </div>

        {/* Contact Form Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Server size={20} />
            Kontaktformular Indstillinger
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modtager Email
              </label>
              <input
                type="email"
                value={siteConfig.contactForm.recipientEmail}
                onChange={(e) => updateContactForm('recipientEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email adresse hvor kontaktformular beskeder sendes til
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">SMTP Server Indstillinger</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactForm.smtpSettings.host}
                    onChange={(e) => updateSmtpSettings('host', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={siteConfig.contactForm.smtpSettings.port}
                    onChange={(e) => updateSmtpSettings('port', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brugernavn
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactForm.smtpSettings.username}
                    onChange={(e) => updateSmtpSettings('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adgangskode
                  </label>
                  <input
                    type="password"
                    value={siteConfig.contactForm.smtpSettings.password}
                    onChange={(e) => updateSmtpSettings('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={siteConfig.contactForm.smtpSettings.secure}
                    onChange={(e) => updateSmtpSettings('secure', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Brug sikker forbindelse (SSL/TLS)</span>
                </label>
              </div>
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
                value={siteConfig.seoSettings.defaultTitle}
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
                value={siteConfig.seoSettings.defaultDescription}
                onChange={(e) => updateSeoSettings('defaultDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {siteConfig.seoSettings.defaultDescription.length}/160 tegn - Vises i søgeresultater
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettings;