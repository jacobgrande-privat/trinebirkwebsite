import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, PageContent, SiteConfig, User } from '../types';
import { getContentAdminToken } from '../lib/contentAuth';

interface DataContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

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

  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const CONTENT_API_PATH = '/api/content';

interface SerializedContent {
  siteConfig: SiteConfig;
  pages: Array<Omit<PageContent, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }>;
  events: Array<Omit<CalendarEvent, 'date' | 'createdAt' | 'updatedAt'> & { date: string; createdAt: string; updatedAt: string }>;
}

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
      await loadContentFromJSON();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContentFromJSON = async () => {
    try {
      const apiResponse = await fetch(CONTENT_API_PATH, { cache: 'no-store' });
      if (apiResponse.ok) {
        const data = await apiResponse.json();
        applyLoadedContent(data);
        return;
      }

      const fallbackResponse = await fetch('/content.json', { cache: 'no-store' });
      if (!fallbackResponse.ok) {
        throw new Error(`Failed to load content: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
      }

      const fallbackData = await fallbackResponse.json();
      applyLoadedContent(fallbackData);
    } catch (error) {
      console.error('Error loading content from local file:', error);
    }
  };

  const applyLoadedContent = (data: Partial<SerializedContent>) => {
    if (data.siteConfig) {
      setSiteConfig(data.siteConfig);
    }

    if (data.pages) {
      const mappedPages: PageContent[] = data.pages.map(page => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      }));
      setPages(mappedPages);
    }

    if (data.events) {
      const mappedEvents: CalendarEvent[] = data.events.map(event => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }));
      setEvents(mappedEvents);
    }
  };

  const saveContentToStorage = async (updatedSiteConfig?: SiteConfig, updatedPages?: PageContent[], updatedEvents?: CalendarEvent[]) => {
    try {
      const contentData: SerializedContent = {
        siteConfig: updatedSiteConfig || siteConfig,
        pages: (updatedPages || pages).map(page => ({
          ...page,
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString()
        })),
        events: (updatedEvents || events).map(event => ({
          ...event,
          date: event.date.toISOString(),
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString()
        }))
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      const contentAdminToken = getContentAdminToken();
      if (contentAdminToken) {
        headers['x-content-admin-token'] = contentAdminToken;
      }

      const response = await fetch(CONTENT_API_PATH, {
        method: 'PUT',
        headers,
        body: JSON.stringify(contentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to persist content: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  useEffect(() => {
    document.title = siteConfig.seoSettings.defaultTitle;
    const metaDescription = document.getElementById('page-description');
    if (metaDescription) {
      metaDescription.setAttribute('content', siteConfig.seoSettings.defaultDescription);
    }
  }, [siteConfig.seoSettings]);

  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveContentToStorage(undefined, undefined, updatedEvents);
  };

  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    const updatedEvents = events.map(event =>
      event.id === id
        ? { ...event, ...eventData, updatedAt: new Date() }
        : event
    );
    setEvents(updatedEvents);
    saveContentToStorage(undefined, undefined, updatedEvents);
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    saveContentToStorage(undefined, undefined, updatedEvents);
  };

  const addPage = (pageData: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPage: PageContent = {
      ...pageData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    saveContentToStorage(undefined, updatedPages);
  };

  const updatePage = (id: string, pageData: Partial<PageContent>) => {
    const updatedPages = pages.map(page =>
      page.id === id
        ? { ...page, ...pageData, updatedAt: new Date() }
        : page
    );
    setPages(updatedPages);
    saveContentToStorage(undefined, updatedPages);
  };

  const deletePage = (id: string) => {
    const updatedPages = pages.filter(page => page.id !== id);
    setPages(updatedPages);
    saveContentToStorage(undefined, updatedPages);
  };

  const updateSiteConfig = (configData: Partial<SiteConfig>) => {
    const updatedConfig = {
      ...siteConfig,
      ...configData,
      socialMedia: configData.socialMedia ? { ...siteConfig.socialMedia, ...configData.socialMedia } : siteConfig.socialMedia,
      seoSettings: configData.seoSettings ? { ...siteConfig.seoSettings, ...configData.seoSettings } : siteConfig.seoSettings,
      pageContent: configData.pageContent ? {
        hero: configData.pageContent.hero ? { ...siteConfig.pageContent.hero, ...configData.pageContent.hero } : siteConfig.pageContent.hero,
        about: configData.pageContent.about ? { ...siteConfig.pageContent.about, ...configData.pageContent.about } : siteConfig.pageContent.about,
        values: configData.pageContent.values ? { ...siteConfig.pageContent.values, ...configData.pageContent.values } : siteConfig.pageContent.values,
        goals: configData.pageContent.goals ? { ...siteConfig.pageContent.goals, ...configData.pageContent.goals } : siteConfig.pageContent.goals,
        contact: configData.pageContent.contact ? { ...siteConfig.pageContent.contact, ...configData.pageContent.contact } : siteConfig.pageContent.contact,
        calendar: configData.pageContent.calendar ? { ...siteConfig.pageContent.calendar, ...configData.pageContent.calendar } : siteConfig.pageContent.calendar,
        footer: configData.pageContent.footer ? { ...siteConfig.pageContent.footer, ...configData.pageContent.footer } : siteConfig.pageContent.footer
      } : siteConfig.pageContent
    };
    setSiteConfig(updatedConfig);
    saveContentToStorage(updatedConfig);
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
