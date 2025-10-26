import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, PageContent, SiteConfig, User } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  pages: PageContent[];
  addPage: (page: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePage: (id: string, page: Partial<PageContent>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;

  siteConfig: SiteConfig;
  updateSiteConfig: (config: Partial<SiteConfig>) => Promise<void>;

  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSiteConfig: SiteConfig = {
  siteName: 'Trine Birk - Socialdemokratiet',
  contactEmail: 'trine@trinebirk.dk',
  phoneNumber: '+45 23 45 67 89',
  address: 'Socialdemokratiet Holbæk\nAlgade 3, 4300 Holbæk',
  contactForm: {
    recipientEmail: 'trine@trinebirk.dk',
    smtpSettings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: ''
    }
  },
  socialMedia: {
    facebook: 'https://facebook.com/trinebirk',
    twitter: '',
    instagram: 'https://instagram.com/trinebirk'
  },
  seoSettings: {
    defaultTitle: 'Trine Birk - Socialdemokratiet | Byrådskandidat',
    defaultDescription: 'Stem på Trine Birk til Byrådet. Erfaring som pædagog og lokal politik. Kæmper for bedre velfærd i Holbæk.'
  },
  pageContent: {
    hero: {
      badge: 'Trine Birk - Socialdemokratiet',
      title: 'Trine',
      titleHighlight: 'Birk',
      description: 'Med erfaring som pædagog og engageret i lokal politik kæmper jeg for et stærkere lokalsamfund, hvor børn, familier og ældre får den omsorg de fortjener.',
      button1Text: 'Se Mine Mærkesager',
      button2Text: 'Kontakt Mig',
      yearsExperience: '15',
      yearsLabel: 'Års Erfaring',
      partyBadge: 'S',
      partyName: 'Socialdemokratiet',
      imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    about: {
      title: 'Om Trine',
      subtitle: 'En stemme fra pædagogik med erfaring fra både institution og ledelse',
      backgroundTitle: 'Min Baggrund',
      backgroundText: 'Som pædagog har jeg arbejdet med børn og familier i mange år. Jeg ved, hvad det vil sige at stå i frontlinjen af velfærden og kæmpe for at give børn den bedste start på livet.',
      educationTitle: 'Uddannelse & Erfaring',
      educationItems: [
        'Pædagog, Holbæk Kommune',
        'Bestyrelsesmedlem i lokal forening',
        'Aktiv i Socialdemokratiet Holbæk',
        'Mor til to børn'
      ],
      resultsTitle: 'Mine Fokusområder',
      resultStats: [
        { value: 'Børn', label: 'Bedre Normeringer' },
        { value: 'Familie', label: 'Støtte til Familier' },
        { value: 'Ældre', label: 'Værdig Ældrepleje' },
        { value: 'Klima', label: 'Grøn Omstilling' }
      ],
      visionTitle: 'Min Vision',
      visionText: '"Et Holbæk hvor alle børn får en god start på livet, hvor familier har tid til hinanden, og hvor ældre mødes med værdighed og omsorg. Det er det Holbæk, jeg vil kæmpe for."'
    },
    values: {
      title: 'Socialdemokratiske Værdier',
      subtitle: 'Grundpillerne i min politik bygger på solidaritet, lighed og fællesskab',
      items: [
        {
          title: 'Solidaritet',
          description: 'Vi står sammen om at løfte de svageste i samfundet. Ingen skal stå alene med udfordringer.',
          icon: 'heart'
        },
        {
          title: 'Lighed',
          description: 'Alle børn skal have samme muligheder uanset forældrenes økonomi.',
          icon: 'users'
        },
        {
          title: 'Velfærd',
          description: 'Gode institutioner, ordentlig ældrepleje og stærke fællesskaber.',
          icon: 'shield'
        },
        {
          title: 'Fællesskab',
          description: 'Vi bygger et stærkt lokalsamfund sammen.',
          icon: 'briefcase'
        }
      ]
    },
    goals: {
      title: 'Mine Mærkesager',
      subtitle: 'Konkrete forslag til et bedre Holbæk',
      sections: [
        {
          title: 'Børn & Uddannelse',
          description: 'Bedre normeringer og kvalitet i vores institutioner:',
          icon: 'users',
          color: 'blue',
          items: [
            'Flere pædagoger i vuggestuer og børnehaver',
            'Mindre klasser i folkeskolen',
            'Moderne skoler og institutioner'
          ]
        },
        {
          title: 'Ældre & Omsorg',
          description: 'Værdig ældrepleje med tid til omsorg:',
          icon: 'shield',
          color: 'red',
          items: [
            'Mere tid til den enkelte',
            'Bedre arbejdsvilkår for personalet',
            'Moderne plejehjem'
          ]
        },
        {
          title: 'Grøn Omstilling',
          description: 'Holbæk skal være en grøn kommune:',
          icon: 'leaf',
          color: 'green',
          items: [
            'Bedre kollektiv trafik',
            'Grønne områder og parker',
            'Bæredygtige løsninger'
          ]
        },
        {
          title: 'Lokale Fællesskaber',
          description: 'Støtte til foreninger og kulturliv:',
          icon: 'home',
          color: 'purple',
          items: [
            'Bedre faciliteter til foreninger',
            'Støtte til kulturarrangementer',
            'Levende bycentrum'
          ]
        }
      ]
    },
    contact: {
      title: 'Kontakt Trine',
      subtitle: 'Har du spørgsmål til min politik? Jeg vil gerne høre fra dig.',
      getInTouchTitle: 'Kontakt',
      emailLabel: 'Email',
      phoneLabel: 'Telefon',
      addressLabel: 'Adresse',
      followTitle: 'Følg Mig'
    },
    calendar: {
      title: 'Kalender',
      subtitle: 'Se hvornår og hvor jeg er tilgængelig.'
    },
    footer: {
      name: 'Trine Birk',
      subtitle: 'Trine Birk - Socialdemokratiet',
      copyright: '© 2025 Trine Birk. Alle rettigheder forbeholdes.'
    }
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pages, setPages] = useState<PageContent[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSiteConfig(),
        loadPageSections(),
        loadEvents(),
        loadDynamicPages()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSiteConfig = async () => {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error loading site config:', error);
      return;
    }

    if (data) {
      setSiteConfig(prev => ({
        ...prev,
        siteName: data.site_name || prev.siteName,
        contactEmail: data.contact_email || prev.contactEmail,
        phoneNumber: data.phone_number || prev.phoneNumber,
        address: data.address || prev.address,
        socialMedia: {
          facebook: data.facebook_url || '',
          twitter: data.twitter_url || '',
          instagram: data.instagram_url || ''
        },
        seoSettings: {
          defaultTitle: data.seo_title || prev.seoSettings.defaultTitle,
          defaultDescription: data.seo_description || prev.seoSettings.defaultDescription
        }
      }));
    } else {
      await initializeSiteConfig();
    }
  };

  const initializeSiteConfig = async () => {
    const { error } = await supabase
      .from('site_config')
      .insert({
        site_name: defaultSiteConfig.siteName,
        contact_email: defaultSiteConfig.contactEmail,
        phone_number: defaultSiteConfig.phoneNumber,
        address: defaultSiteConfig.address,
        facebook_url: defaultSiteConfig.socialMedia.facebook,
        twitter_url: defaultSiteConfig.socialMedia.twitter,
        instagram_url: defaultSiteConfig.socialMedia.instagram,
        seo_title: defaultSiteConfig.seoSettings.defaultTitle,
        seo_description: defaultSiteConfig.seoSettings.defaultDescription
      });

    if (error) {
      console.error('Error initializing site config:', error);
    }
  };

  const loadPageSections = async () => {
    const { data, error } = await supabase
      .from('page_sections')
      .select('*');

    if (error) {
      console.error('Error loading page sections:', error);
      return;
    }

    if (data && data.length > 0) {
      const updatedConfig = { ...siteConfig };

      data.forEach(section => {
        if (section.section_key === 'hero') {
          updatedConfig.pageContent.hero = { ...updatedConfig.pageContent.hero, ...section.content };
        } else if (section.section_key === 'about') {
          updatedConfig.pageContent.about = { ...updatedConfig.pageContent.about, ...section.content };
        } else if (section.section_key === 'values') {
          updatedConfig.pageContent.values = { ...updatedConfig.pageContent.values, ...section.content };
        } else if (section.section_key === 'goals') {
          updatedConfig.pageContent.goals = { ...updatedConfig.pageContent.goals, ...section.content };
        } else if (section.section_key === 'contact') {
          updatedConfig.pageContent.contact = { ...updatedConfig.pageContent.contact, ...section.content };
        } else if (section.section_key === 'calendar') {
          updatedConfig.pageContent.calendar = { ...updatedConfig.pageContent.calendar, ...section.content };
        } else if (section.section_key === 'footer') {
          updatedConfig.pageContent.footer = { ...updatedConfig.pageContent.footer, ...section.content };
        }
      });

      setSiteConfig(updatedConfig);
    } else {
      await initializePageSections();
    }
  };

  const initializePageSections = async () => {
    const sections = [
      { section_key: 'hero', content: defaultSiteConfig.pageContent.hero },
      { section_key: 'about', content: defaultSiteConfig.pageContent.about },
      { section_key: 'values', content: defaultSiteConfig.pageContent.values },
      { section_key: 'goals', content: defaultSiteConfig.pageContent.goals },
      { section_key: 'contact', content: defaultSiteConfig.pageContent.contact },
      { section_key: 'calendar', content: defaultSiteConfig.pageContent.calendar },
      { section_key: 'footer', content: defaultSiteConfig.pageContent.footer }
    ];

    const { error } = await supabase
      .from('page_sections')
      .insert(sections);

    if (error) {
      console.error('Error initializing page sections:', error);
    }
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);
      return;
    }

    if (data) {
      const mappedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.start_time),
        time: new Date(event.start_time).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }),
        location: event.location || '',
        type: 'public',
        description: event.description || '',
        content: event.description || '',
        image: '',
        createdBy: event.created_by || '',
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at)
      }));

      setEvents(mappedEvents);
    }
  };

  const loadDynamicPages = async () => {
    const { data, error } = await supabase
      .from('dynamic_pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading dynamic pages:', error);
      return;
    }

    if (data) {
      const mappedPages: PageContent[] = data.map(page => ({
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        metaDescription: page.meta_description || '',
        published: page.published,
        createdBy: page.created_by || '',
        createdAt: new Date(page.created_at),
        updatedAt: new Date(page.updated_at)
      }));

      setPages(mappedPages);
    }
  };

  useEffect(() => {
    document.title = siteConfig.seoSettings.defaultTitle;
    const metaDescription = document.getElementById('page-description');
    if (metaDescription) {
      metaDescription.setAttribute('content', siteConfig.seoSettings.defaultDescription);
    }
  }, [siteConfig.seoSettings]);

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const startTime = new Date(eventData.date);
    const [hours, minutes] = eventData.time.split(':');
    startTime.setHours(parseInt(hours), parseInt(minutes));

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start_time: startTime.toISOString(),
        is_published: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding event:', error);
      throw error;
    }

    await loadEvents();
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    const updateData: any = {};

    if (eventData.title) updateData.title = eventData.title;
    if (eventData.description) updateData.description = eventData.description;
    if (eventData.location) updateData.location = eventData.location;

    if (eventData.date || eventData.time) {
      const existingEvent = events.find(e => e.id === id);
      if (existingEvent) {
        const startTime = new Date(eventData.date || existingEvent.date);
        const timeStr = eventData.time || existingEvent.time;
        const [hours, minutes] = timeStr.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes));
        updateData.start_time = startTime.toISOString();
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    await loadEvents();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }

    await loadEvents();
  };

  const addPage = async (pageData: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('dynamic_pages')
      .insert({
        slug: pageData.slug,
        title: pageData.title,
        content: pageData.content,
        meta_description: pageData.metaDescription,
        published: pageData.published
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding page:', error);
      throw error;
    }

    await loadDynamicPages();
  };

  const updatePage = async (id: string, pageData: Partial<PageContent>) => {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (pageData.slug !== undefined) updateData.slug = pageData.slug;
    if (pageData.title !== undefined) updateData.title = pageData.title;
    if (pageData.content !== undefined) updateData.content = pageData.content;
    if (pageData.metaDescription !== undefined) updateData.meta_description = pageData.metaDescription;
    if (pageData.published !== undefined) updateData.published = pageData.published;

    const { error } = await supabase
      .from('dynamic_pages')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating page:', error);
      throw error;
    }

    await loadDynamicPages();
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase
      .from('dynamic_pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting page:', error);
      throw error;
    }

    await loadDynamicPages();
  };

  const updateSiteConfig = async (configData: Partial<SiteConfig>) => {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (configData.siteName) updateData.site_name = configData.siteName;
    if (configData.contactEmail) updateData.contact_email = configData.contactEmail;
    if (configData.phoneNumber) updateData.phone_number = configData.phoneNumber;
    if (configData.address) updateData.address = configData.address;
    if (configData.socialMedia?.facebook !== undefined) updateData.facebook_url = configData.socialMedia.facebook;
    if (configData.socialMedia?.twitter !== undefined) updateData.twitter_url = configData.socialMedia.twitter;
    if (configData.socialMedia?.instagram !== undefined) updateData.instagram_url = configData.socialMedia.instagram;
    if (configData.seoSettings?.defaultTitle) updateData.seo_title = configData.seoSettings.defaultTitle;
    if (configData.seoSettings?.defaultDescription) updateData.seo_description = configData.seoSettings.defaultDescription;

    const { error } = await supabase
      .from('site_config')
      .update(updateData)
      .eq('id', (await supabase.from('site_config').select('id').maybeSingle()).data?.id);

    if (error) {
      console.error('Error updating site config:', error);
      throw error;
    }

    if (configData.pageContent) {
      const sections = [];
      if (configData.pageContent.hero) sections.push({ section_key: 'hero', content: configData.pageContent.hero });
      if (configData.pageContent.about) sections.push({ section_key: 'about', content: configData.pageContent.about });
      if (configData.pageContent.values) sections.push({ section_key: 'values', content: configData.pageContent.values });
      if (configData.pageContent.goals) sections.push({ section_key: 'goals', content: configData.pageContent.goals });
      if (configData.pageContent.contact) sections.push({ section_key: 'contact', content: configData.pageContent.contact });
      if (configData.pageContent.calendar) sections.push({ section_key: 'calendar', content: configData.pageContent.calendar });
      if (configData.pageContent.footer) sections.push({ section_key: 'footer', content: configData.pageContent.footer });

      for (const section of sections) {
        const { error: sectionError } = await supabase
          .from('page_sections')
          .update({
            content: section.content,
            updated_at: new Date().toISOString()
          })
          .eq('section_key', section.section_key);

        if (sectionError) {
          console.error(`Error updating section ${section.section_key}:`, sectionError);
        }
      }
    }

    await loadSiteConfig();
    await loadPageSections();
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastLogin: undefined
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUserData = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === id
        ? { ...user, ...userData }
        : user
    ));
  };

  const deleteUserData = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  return (
    <DataContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      pages,
      addPage,
      updatePage,
      deletePage,
      siteConfig,
      updateSiteConfig,
      users,
      addUser,
      updateUser: updateUserData,
      deleteUser: deleteUserData,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
