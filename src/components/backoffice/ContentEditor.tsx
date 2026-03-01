import React, { useState } from 'react';
import { Save, FileText, Plus, Trash2 } from 'lucide-react';
import MediaPicker from './MediaPicker';
import { useData } from '../../contexts/DataContext';

const ContentEditor: React.FC = () => {
  const { siteConfig, updateSiteConfig } = useData();
  const [content, setContent] = useState(siteConfig.pageContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'values' | 'goals' | 'contact' | 'calendar' | 'footer'>('hero');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    updateSiteConfig({ pageContent: content });

    setSaveMessage('Indhold gemt succesfuldt!');
    setIsSaving(false);

    setTimeout(() => setSaveMessage(''), 3000);
  };

  const updateHero = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: { ...prev.hero, [field]: value }
    }));
  };

  const updateAbout = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      about: { ...prev.about, [field]: value }
    }));
  };

  const updateAboutEducationItem = (index: number, value: string) => {
    const newItems = [...content.about.educationItems];
    newItems[index] = value;
    updateAbout('educationItems', newItems);
  };

  const addAboutEducationItem = () => {
    updateAbout('educationItems', [...content.about.educationItems, '']);
  };

  const removeAboutEducationItem = (index: number) => {
    const newItems = content.about.educationItems.filter((_, i) => i !== index);
    updateAbout('educationItems', newItems);
  };

  const updateAboutResultStat = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...content.about.resultStats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateAbout('resultStats', newStats);
  };


  const updateGoals = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      goals: { ...prev.goals, [field]: value }
    }));
  };

  const updateGoalSection = (index: number, field: string, value: any) => {
    const newSections = [...content.goals.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    updateGoals('sections', newSections);
  };

  const updateGoalSectionItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...content.goals.sections];
    const newItems = [...newSections[sectionIndex].items];
    newItems[itemIndex] = value;
    newSections[sectionIndex] = { ...newSections[sectionIndex], items: newItems };
    updateGoals('sections', newSections);
  };

  const addGoalSectionItem = (sectionIndex: number) => {
    const newSections = [...content.goals.sections];
    newSections[sectionIndex].items.push('');
    updateGoals('sections', newSections);
  };

  const removeGoalSectionItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...content.goals.sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    updateGoals('sections', newSections);
  };

  const updateContact = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const updateCalendar = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      calendar: { ...prev.calendar, [field]: value }
    }));
  };

  const updateFooter = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      footer: { ...prev.footer, [field]: value }
    }));
  };

  const tabs = [
    { id: 'hero', label: 'Forsiden (Hero)' },
    { id: 'about', label: 'Om Trine' },
    { id: 'goals', label: 'Mærkesager' },
    { id: 'contact', label: 'Kontakt' },
    { id: 'calendar', label: 'Kalender' },
    { id: 'footer', label: 'Footer' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Rediger Sideindhold</h2>
        {saveMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg">
            {saveMessage}
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === 'hero' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Forside (Hero Sektion)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Tekst</label>
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) => updateHero('badge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel (Fornavn)</label>
                <input
                  type="text"
                  value={content.hero.title}
                  onChange={(e) => updateHero('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel Highlight (Efternavn)</label>
                <input
                  type="text"
                  value={content.hero.titleHighlight}
                  onChange={(e) => updateHero('titleHighlight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivelse</label>
                <textarea
                  rows={3}
                  value={content.hero.description}
                  onChange={(e) => updateHero('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Knap 1 Tekst</label>
                <input
                  type="text"
                  value={content.hero.button1Text}
                  onChange={(e) => updateHero('button1Text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Knap 2 Tekst</label>
                <input
                  type="text"
                  value={content.hero.button2Text}
                  onChange={(e) => updateHero('button2Text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parti Badge</label>
                <input
                  type="text"
                  value={content.hero.partyBadge}
                  onChange={(e) => updateHero('partyBadge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parti Navn</label>
                <input
                  type="text"
                  value={content.hero.partyName}
                  onChange={(e) => updateHero('partyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <MediaPicker
                  value={content.hero.imageUrl}
                  onChange={(url) => updateHero('imageUrl', url)}
                  label="Billede URL"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Om Trine Sektion
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <input
                  type="text"
                  value={content.about.title}
                  onChange={(e) => updateAbout('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Undertitel</label>
                <input
                  type="text"
                  value={content.about.subtitle}
                  onChange={(e) => updateAbout('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Baggrund Titel</label>
                <input
                  type="text"
                  value={content.about.backgroundTitle}
                  onChange={(e) => updateAbout('backgroundTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Baggrund Tekst</label>
                <textarea
                  rows={4}
                  value={content.about.backgroundText}
                  onChange={(e) => updateAbout('backgroundText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uddannelse Titel</label>
                <input
                  type="text"
                  value={content.about.educationTitle}
                  onChange={(e) => updateAbout('educationTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uddannelse & Erfaring Punkter</label>
                <div className="space-y-2">
                  {content.about.educationItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateAboutEducationItem(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeAboutEducationItem(index)}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAboutEducationItem}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <Plus size={16} />
                    Tilføj Punkt
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resultater Titel</label>
                <input
                  type="text"
                  value={content.about.resultsTitle}
                  onChange={(e) => updateAbout('resultsTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resultat Statistikker</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {content.about.resultStats.map((stat, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3 space-y-2">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => updateAboutResultStat(index, 'value', e.target.value)}
                        placeholder="Værdi (f.eks. 2.500)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateAboutResultStat(index, 'label', e.target.value)}
                        placeholder="Label"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vision Titel</label>
                <input
                  type="text"
                  value={content.about.visionTitle}
                  onChange={(e) => updateAbout('visionTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vision Tekst</label>
                <textarea
                  rows={4}
                  value={content.about.visionText}
                  onChange={(e) => updateAbout('visionText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}


        {activeTab === 'goals' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Mærkesager Sektion
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <input
                  type="text"
                  value={content.goals.title}
                  onChange={(e) => updateGoals('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Undertitel</label>
                <input
                  type="text"
                  value={content.goals.subtitle}
                  onChange={(e) => updateGoals('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Mærkesager</label>
                <div className="space-y-6">
                  {content.goals.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-md p-4 space-y-3">
                      <h4 className="font-medium text-gray-800">Mærkesag {sectionIndex + 1}</h4>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateGoalSection(sectionIndex, 'title', e.target.value)}
                        placeholder="Titel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <textarea
                        rows={2}
                        value={section.description}
                        onChange={(e) => updateGoalSection(sectionIndex, 'description', e.target.value)}
                        placeholder="Beskrivelse"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={section.icon}
                          onChange={(e) => updateGoalSection(sectionIndex, 'icon', e.target.value)}
                          placeholder="Ikon (shield, users, leaf, home)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <input
                          type="text"
                          value={section.color}
                          onChange={(e) => updateGoalSection(sectionIndex, 'color', e.target.value)}
                          placeholder="Farve (red, blue, green, purple)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Punkter</label>
                        <div className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => updateGoalSectionItem(sectionIndex, itemIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeGoalSectionItem(sectionIndex, itemIndex)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addGoalSectionItem(sectionIndex)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                          >
                            <Plus size={16} />
                            Tilføj Punkt
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Kontakt Sektion
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <input
                  type="text"
                  value={content.contact.title}
                  onChange={(e) => updateContact('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Undertitel</label>
                <textarea
                  rows={2}
                  value={content.contact.subtitle}
                  onChange={(e) => updateContact('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kontakt Sektion Titel</label>
                  <input
                    type="text"
                    value={content.contact.getInTouchTitle}
                    onChange={(e) => updateContact('getInTouchTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Label</label>
                  <input
                    type="text"
                    value={content.contact.emailLabel}
                    onChange={(e) => updateContact('emailLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Label</label>
                  <input
                    type="text"
                    value={content.contact.phoneLabel}
                    onChange={(e) => updateContact('phoneLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse Label</label>
                  <input
                    type="text"
                    value={content.contact.addressLabel}
                    onChange={(e) => updateContact('addressLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sociale Medier Titel</label>
                  <input
                    type="text"
                    value={content.contact.followTitle}
                    onChange={(e) => updateContact('followTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Kontaktinformation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Adresse</label>
                    <input
                      type="email"
                      value={content.contact.contactEmail || ''}
                      onChange={(e) => updateContact('contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Nummer</label>
                    <input
                      type="tel"
                      value={content.contact.phoneNumber || ''}
                      onChange={(e) => updateContact('phoneNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <textarea
                      rows={3}
                      value={content.contact.address || ''}
                      onChange={(e) => updateContact('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Sociale Medier</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                    <input
                      type="url"
                      value={content.contact.facebookUrl || ''}
                      onChange={(e) => updateContact('facebookUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                    <input
                      type="url"
                      value={content.contact.twitterUrl || ''}
                      onChange={(e) => updateContact('twitterUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={content.contact.instagramUrl || ''}
                      onChange={(e) => updateContact('instagramUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
                <h4 className="text-md font-semibold text-gray-900">Kontakt Billede (venstre kolonne)</h4>
                <MediaPicker
                  value={content.contact.contactImageUrl || ''}
                  onChange={(url) => updateContact('contactImageUrl', url)}
                  label="Billede URL"
                />
                {content.contact.contactImageUrl && (
                  <button
                    type="button"
                    onClick={() => updateContact('contactImageUrl', '')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Fjern Billede
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Kalender Sektion
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                <input
                  type="text"
                  value={content.calendar.title}
                  onChange={(e) => updateCalendar('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Undertitel</label>
                <textarea
                  rows={2}
                  value={content.calendar.subtitle}
                  onChange={(e) => updateCalendar('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Footer
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Navn</label>
                <input
                  type="text"
                  value={content.footer.name}
                  onChange={(e) => updateFooter('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Undertitel</label>
                <input
                  type="text"
                  value={content.footer.subtitle}
                  onChange={(e) => updateFooter('subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Copyright Tekst</label>
                <input
                  type="text"
                  value={content.footer.copyright}
                  onChange={(e) => updateFooter('copyright', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isSaving ? 'Gemmer...' : 'Gem Ændringer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentEditor;
