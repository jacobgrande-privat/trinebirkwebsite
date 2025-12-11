import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, PageContent, SiteConfig, User } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  pages: PageContent[];
  addPage: (page: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, page: Partial<PageContent>) => void;
  deletePage: (id: string) => void;

  siteConfig: SiteConfig;
  updateSiteConfig: (config: Partial<SiteConfig>) => void;

  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  downloadContent: () => void;

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
      followTitle: 'Følg Mig',
      contactEmail: 'trine@trinebirk.dk',
      phoneNumber: '+45 23 45 67 89',
      address: 'Socialdemokratiet Holbæk\nAlgade 3, 4300 Holbæk',
      facebookUrl: 'https://facebook.com/trinebirk',
      twitterUrl: '',
      instagramUrl: 'https://instagram.com/trinebirk'
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
        loadContentFromJSON(),
        loadEvents()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentFromJSON = async () => {
    try {
      const response = await fetch('/content.json');
      const data = await response.json();

      if (data.siteConfig) {
        setSiteConfig(data.siteConfig);
      }

      if (data.pages) {
        const mappedPages: PageContent[] = data.pages.map((page: any) => ({
          ...page,
          createdAt: new Date(page.createdAt),
          updatedAt: new Date(page.updatedAt)
        }));
        setPages(mappedPages);
      }
    } catch (error) {
      console.error('Error loading content from JSON:', error);
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
        type: event.event_type || 'public',
        description: event.description || '',
        content: event.content || event.description || '',
        image: event.image_url || '',
        createdBy: event.created_by || '',
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at)
      }));

      setEvents(mappedEvents);
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
        event_type: eventData.type,
        content: eventData.content || '',
        image_url: eventData.image || '',
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
    if (eventData.type) updateData.event_type = eventData.type;
    if (eventData.content !== undefined) updateData.content = eventData.content;
    if (eventData.image !== undefined) updateData.image_url = eventData.image;

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

  const addPage = (pageData: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPage: PageContent = {
      ...pageData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPages(prev => [...prev, newPage]);
  };

  const updatePage = (id: string, pageData: Partial<PageContent>) => {
    setPages(prev => prev.map(page =>
      page.id === id
        ? { ...page, ...pageData, updatedAt: new Date() }
        : page
    ));
  };

  const deletePage = (id: string) => {
    setPages(prev => prev.filter(page => page.id !== id));
  };

  const updateSiteConfig = (configData: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({
      ...prev,
      ...configData,
      socialMedia: configData.socialMedia ? { ...prev.socialMedia, ...configData.socialMedia } : prev.socialMedia,
      seoSettings: configData.seoSettings ? { ...prev.seoSettings, ...configData.seoSettings } : prev.seoSettings,
      pageContent: configData.pageContent ? {
        hero: configData.pageContent.hero ? { ...prev.pageContent.hero, ...configData.pageContent.hero } : prev.pageContent.hero,
        about: configData.pageContent.about ? { ...prev.pageContent.about, ...configData.pageContent.about } : prev.pageContent.about,
        values: configData.pageContent.values ? { ...prev.pageContent.values, ...configData.pageContent.values } : prev.pageContent.values,
        goals: configData.pageContent.goals ? { ...prev.pageContent.goals, ...configData.pageContent.goals } : prev.pageContent.goals,
        contact: configData.pageContent.contact ? { ...prev.pageContent.contact, ...configData.pageContent.contact } : prev.pageContent.contact,
        calendar: configData.pageContent.calendar ? { ...prev.pageContent.calendar, ...configData.pageContent.calendar } : prev.pageContent.calendar,
        footer: configData.pageContent.footer ? { ...prev.pageContent.footer, ...configData.pageContent.footer } : prev.pageContent.footer
      } : prev.pageContent
    }));
  };

  const downloadContent = () => {
    const contentData = {
      siteConfig,
      pages: pages.map(page => ({
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString()
      }))
    };

    const dataStr = JSON.stringify(contentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      downloadContent,
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
