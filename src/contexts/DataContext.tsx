import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, PageContent, SiteConfig, User } from '../types';

interface DataContextType {
  // Calendar Events
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Pages
  pages: PageContent[];
  addPage: (page: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, page: Partial<PageContent>) => void;
  deletePage: (id: string) => void;
  
  // Site Config
  siteConfig: SiteConfig;
  updateSiteConfig: (config: Partial<SiteConfig>) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial data
const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: "Borgermøde om Sundhedspolitik",
    date: new Date(2025, 0, 15),
    time: "19:00",
    location: "Kulturhuset, Aarhus",
    type: "public",
    description: "Kom og hør om vores planer for at styrke sundhedsvæsenet",
    content: "<p>Dette borgermøde fokuserer på <strong>sundhedspolitik</strong> og vores konkrete forslag til at forbedre det danske sundhedsvæsen.</p><p>Vi vil diskutere:</p><ul><li>Flere sygeplejersker</li><li>Kortere ventetider</li><li>Bedre arbejdsvilkår</li></ul>",
    image: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=800",
    createdBy: "1",
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    title: "Besøg på Aarhus Universitetshospital",
    date: new Date(2025, 0, 18),
    time: "10:00",
    location: "AUH, Skejby",
    type: "visit",
    description: "Møde med sundhedspersonale om arbejdsvilkår",
    content: "<p>Besøg på Aarhus Universitetshospital for at møde sygeplejersker og læger.</p><p>Fokus på:</p><ul><li>Arbejdsvilkår</li><li>Personalemangel</li><li>Patientrettigheder</li></ul>",
    createdBy: "1",
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '3',
    title: "Valgdebat - DR Østjylland",
    date: new Date(2025, 0, 22),
    time: "20:00",
    location: "DR Huset, Aarhus",
    type: "debate",
    description: "Live debat om klimapolitik og grøn omstilling",
    content: "<p>Deltag i den store valgdebat på DR Østjylland.</p><p>Emner:</p><ul><li>Klimapolitik</li><li>Grøn omstilling</li><li>Arbejdspladser</li></ul>",
    createdBy: "1",
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '4',
    title: "Møde med Fagforeninger",
    date: new Date(2025, 0, 25),
    time: "14:00",
    location: "LO Østjylland",
    type: "meeting",
    description: "Dialog om arbejdsmarkedspolitik og lønvilkår",
    content: "<p>Møde med fagforeningsledere om arbejdsmarkedspolitik.</p><p>Dagsorden:</p><ul><li>Lønudvikling</li><li>Arbejdstid</li><li>Pension</li></ul>",
    createdBy: "1",
    createdAt: new Date('2024-12-04'),
    updatedAt: new Date('2024-12-04')
  },
  {
    id: '5',
    title: "Klimamarch i Aarhus",
    date: new Date(2025, 0, 28),
    time: "12:00",
    location: "Rådhuspladsen",
    type: "public",
    description: "Deltag i kampen for en grønnere fremtid",
    content: "<p>Stor klimademonstration i Aarhus centrum.</p><p>Sammen kæmper vi for:</p><ul><li>Grøn energi</li><li>Bæredygtig transport</li><li>Klimaretfærdighed</li></ul>",
    createdBy: "1",
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05')
  }
];

const initialPages: PageContent[] = [
  {
    id: '1',
    slug: 'om-lise',
    title: 'Om Lise Nielsen',
    content: '<h2>Min Baggrund</h2><p>Som 50-årig sygeplejerske har jeg arbejdet på både akutafdelinger og i hjemmepleje. De sidste 10 år har jeg været fagforeningsleder i Dansk Sygeplejeråd, hvor jeg har kæmpet for bedre arbejdsvilkår og patientrettigheder.</p><h3>Uddannelse & Erfaring</h3><ul><li>Sygeplejerske, Aarhus Sygehus (1999-2014)</li><li>Fagforeningsleder, Dansk Sygeplejeråd (2014-2025)</li><li>Bestyrelsesmedlem, Socialdemokratiet Aarhus</li></ul>',
    metaDescription: 'Lær mere om Lise Nielsens baggrund som sygeplejerske og fagforeningsleder',
    published: true,
    createdBy: '1',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '2',
    slug: 'klimapolitik',
    title: 'Klimapolitik',
    content: '<h2>Grøn Omstilling</h2><p>Vi skal bekæmpe klimakrisen med retfærdige og sociale løsninger. Klimapolitik skal ikke gå ud over almindelige familier, men skal skabe nye grønne arbejdspladser.</p><h3>Mine Forslag</h3><ul><li>70% CO2-reduktion inden 2030</li><li>Grøn omstillingsfond til arbejdspladser</li><li>Billigere offentlig transport</li></ul>',
    metaDescription: 'Lise Nielsens klimapolitiske mærkesager og forslag til grøn omstilling',
    published: false,
    createdBy: '1',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10')
  }
];

const initialUsers: User[] = [
  {
    id: '1',
    email: 'admin@lisenielsen.dk',
    name: 'Lise Nielsen',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    email: 'editor@lisenielsen.dk',
    name: 'Maria Hansen',
    role: 'editor',
    createdAt: new Date('2024-02-01'),
    lastLogin: new Date('2024-12-10')
  }
];

const initialSiteConfig: SiteConfig = {
  siteName: 'Lise Nielsen - Socialdemokratiet',
  contactEmail: 'lise@lisenielsen.dk',
  phoneNumber: '+45 23 45 67 89',
  address: 'Socialdemokratiet Aarhus\nBanegårdspladsen 1, 8000 Aarhus C',
  contactForm: {
    recipientEmail: 'lise@lisenielsen.dk',
    smtpSettings: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: ''
    }
  },
  socialMedia: {
    facebook: 'https://facebook.com/lisenielsen',
    twitter: 'https://twitter.com/lisenielsen',
    instagram: 'https://instagram.com/lisenielsen'
  },
  seoSettings: {
    defaultTitle: 'Lise Nielsen - Socialdemokratiet | Folketingskandidat',
    defaultDescription: 'Stem på Lise Nielsen til Folketinget. 25 års erfaring som sygeplejerske og fagforeningsleder. Kæmper for et stærkere velfærdssamfund.'
  },
  pageContent: {
    hero: {
      badge: 'Lise Nielsen - Socialdemokratiet',
      title: 'Lise',
      titleHighlight: 'Nielsen',
      description: 'Med 25 års erfaring som sygeplejerske og fagforeningsleder kæmper jeg for et stærkere velfærdssamfund, hvor alle har ret til kvalitet i sundhed, uddannelse og omsorg.',
      button1Text: 'Se Mine Mærkesager',
      button2Text: 'Kontakt Mig',
      yearsExperience: '25',
      yearsLabel: 'Års Erfaring',
      partyBadge: 'S',
      partyName: 'Socialdemokratiet',
      imageUrl: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    about: {
      title: 'Om Trine',
      subtitle: 'En stemme fra sundhedsvæsenet med erfaring fra både frontlinjen og ledelse',
      backgroundTitle: 'Min Baggrund',
      backgroundText: 'Som 50-årig sygeplejerske har jeg arbejdet på både akutafdelinger og i hjemmepleje. De sidste 10 år har jeg været fagforeningsleder i Dansk Sygeplejeråd, hvor jeg har kæmpet for bedre arbejdsvilkår og patientrettigheder. Jeg ved, hvad det vil sige at stå i frontlinjen af velfærdssamfundet.',
      educationTitle: 'Uddannelse & Erfaring',
      educationItems: [
        'Sygeplejerske, Aarhus Sygehus (1999-2014)',
        'Fagforeningsleder, Dansk Sygeplejeråd (2014-2025)',
        'Bestyrelsesmedlem, Socialdemokratiet Aarhus',
        'Mor til tre børn'
      ],
      resultsTitle: 'Mine Resultater',
      resultStats: [
        { value: '2.500', label: 'Nye Sygeplejersker' },
        { value: '15%', label: 'Lønforbedring' },
        { value: '40', label: 'Overenskomster' },
        { value: '95%', label: 'Medlemstilfredshed' }
      ],
      visionTitle: 'Min Vision',
      visionText: '"Et Danmark hvor velfærd ikke er et privilegium, men en ret. Hvor sundhedspersonale har tid til omsorg, hvor børn får den bedste start på livet, og hvor ældre mødes med værdighed. Det er det Danmark, jeg vil kæmpe for på Christiansborg."'
    },
    values: {
      title: 'Socialdemokratiske Værdier',
      subtitle: 'Grundpillerne i min politik bygger på solidaritet, lighed og fællesskab',
      items: [
        {
          title: 'Solidaritet',
          description: 'Vi står sammen om at løfte de svageste i samfundet. Ingen skal stå alene med sygdom, arbejdsløshed eller sociale udfordringer.',
          icon: 'heart'
        },
        {
          title: 'Lighed',
          description: 'Alle børn skal have samme muligheder uanset forældrenes økonomi. Uddannelse og sundhed skal være gratis og tilgængelig for alle.',
          icon: 'users'
        },
        {
          title: 'Velfærd',
          description: 'Et stærkt offentligt sundhedsvæsen, gode skoler og ordentlig ældrepleje. Velfærd er kernen i det danske samfund.',
          icon: 'shield'
        },
        {
          title: 'Arbejde',
          description: 'Ordentlige løn- og arbejdsvilkår for alle. Arbejde skal kunne betale sig, og alle skal have ret til et trygt arbejdsmiljø.',
          icon: 'briefcase'
        }
      ]
    },
    goals: {
      title: 'Mine Mærkesager',
      subtitle: 'Konkrete forslag til et stærkere Danmark',
      sections: [
        {
          title: 'Sundhed for Alle',
          description: 'Styrk sundhedsvæsenet med flere hænder og kortere ventetider:',
          icon: 'shield',
          color: 'red',
          items: [
            'Ansæt 5.000 flere sygeplejersker over 4 år',
            'Maksimalt 30 dages ventetid på kræftbehandling',
            'Gratis tandpleje til alle under 25 år'
          ]
        },
        {
          title: 'Uddannelse & Børn',
          description: 'Investér i vores børns fremtid med bedre skoler og uddannelser:',
          icon: 'users',
          color: 'blue',
          items: [
            'Maksimalt 20 børn per klasse i folkeskolen',
            'Gratis SU til alle uddannelser',
            'Flere pædagoger i vuggestuer og børnehaver'
          ]
        },
        {
          title: 'Grøn Omstilling',
          description: 'Bekæmp klimakrisen med retfærdige og sociale løsninger:',
          icon: 'leaf',
          color: 'green',
          items: [
            '70% CO2-reduktion inden 2030',
            'Grøn omstillingsfond til arbejdspladser',
            'Billigere offentlig transport'
          ]
        },
        {
          title: 'Boliger til Alle',
          description: 'Sikr at alle kan få en bolig, de har råd til:',
          icon: 'home',
          color: 'purple',
          items: [
            'Byg 10.000 nye almene boliger årligt',
            'Stop spekulation i boligmarkedet',
            'Bedre støtte til førstegangskøbere'
          ]
        }
      ]
    },
    contact: {
      title: 'Kontakt Lise',
      subtitle: 'Har du spørgsmål til min politik eller vil du støtte min kampagne? Jeg vil gerne høre fra dig.',
      getInTouchTitle: 'Få i Touch',
      emailLabel: 'Email',
      phoneLabel: 'Telefon',
      addressLabel: 'Valgkampkontor',
      followTitle: 'Følg Kampagnen'
    },
    calendar: {
      title: 'Kalender',
      subtitle: 'Se hvornår og hvor jeg er tilgængelig. Kom til et af mine arrangementer og lær mig bedre at kende.'
    },
    footer: {
      name: 'Lise Nielsen',
      subtitle: 'Lise Nielsen - Socialdemokratiet',
      copyright: '© 2025 Lise Nielsen Kampagne. Alle rettigheder forbeholdes.'
    }
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem('campaign_events');
    if (stored) {
      const parsedEvents = JSON.parse(stored);
      return parsedEvents.map((event: any) => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }));
    }
    return initialEvents;
  });

  const [pages, setPages] = useState<PageContent[]>(() => {
    const stored = localStorage.getItem('campaign_pages');
    if (stored) {
      const parsedPages = JSON.parse(stored);
      return parsedPages.map((page: any) => ({
        ...page,
        createdAt: new Date(page.createdAt),
        updatedAt: new Date(page.updatedAt)
      }));
    }
    return initialPages;
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const stored = localStorage.getItem('campaign_config');
    if (stored) {
      const parsedConfig = JSON.parse(stored);
      return {
        ...initialSiteConfig,
        ...parsedConfig,
        contactForm: {
          ...initialSiteConfig.contactForm,
          ...(parsedConfig.contactForm || {}),
          smtpSettings: {
            ...initialSiteConfig.contactForm.smtpSettings,
            ...(parsedConfig.contactForm?.smtpSettings || {})
          }
        },
        socialMedia: {
          ...initialSiteConfig.socialMedia,
          ...(parsedConfig.socialMedia || {})
        },
        seoSettings: {
          ...initialSiteConfig.seoSettings,
          ...(parsedConfig.seoSettings || {})
        },
        pageContent: {
          hero: {
            ...initialSiteConfig.pageContent.hero,
            ...(parsedConfig.pageContent?.hero || {})
          },
          about: {
            ...initialSiteConfig.pageContent.about,
            ...(parsedConfig.pageContent?.about || {})
          },
          values: {
            ...initialSiteConfig.pageContent.values,
            ...(parsedConfig.pageContent?.values || {})
          },
          goals: {
            ...initialSiteConfig.pageContent.goals,
            ...(parsedConfig.pageContent?.goals || {})
          },
          contact: {
            ...initialSiteConfig.pageContent.contact,
            ...(parsedConfig.pageContent?.contact || {})
          },
          calendar: {
            ...initialSiteConfig.pageContent.calendar,
            ...(parsedConfig.pageContent?.calendar || {})
          },
          footer: {
            ...initialSiteConfig.pageContent.footer,
            ...(parsedConfig.pageContent?.footer || {})
          }
        }
      };
    }
    return initialSiteConfig;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('campaign_users');
    if (stored) {
      const parsedUsers = JSON.parse(stored);
      return parsedUsers.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
      }));
    }
    return initialUsers;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('campaign_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('campaign_pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('campaign_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('campaign_users', JSON.stringify(users));
  }, [users]);

  // Update page title and meta description based on site config
  useEffect(() => {
    document.title = siteConfig.seoSettings.defaultTitle;
    const metaDescription = document.getElementById('page-description');
    if (metaDescription) {
      metaDescription.setAttribute('content', siteConfig.seoSettings.defaultDescription);
    }
  }, [siteConfig.seoSettings]);

  // Event management
  const addEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, ...eventData, updatedAt: new Date() }
        : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Page management
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

  // Site config management
  const updateSiteConfig = (configData: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({
      ...prev,
      ...configData,
      contactForm: configData.contactForm
        ? {
            ...prev.contactForm,
            ...configData.contactForm,
            smtpSettings: configData.contactForm.smtpSettings
              ? { ...prev.contactForm.smtpSettings, ...configData.contactForm.smtpSettings }
              : prev.contactForm.smtpSettings
          }
        : prev.contactForm,
      socialMedia: configData.socialMedia
        ? { ...prev.socialMedia, ...configData.socialMedia }
        : prev.socialMedia,
      seoSettings: configData.seoSettings
        ? { ...prev.seoSettings, ...configData.seoSettings }
        : prev.seoSettings,
      pageContent: configData.pageContent
        ? {
            hero: configData.pageContent.hero
              ? { ...prev.pageContent.hero, ...configData.pageContent.hero }
              : prev.pageContent.hero,
            about: configData.pageContent.about
              ? { ...prev.pageContent.about, ...configData.pageContent.about }
              : prev.pageContent.about,
            values: configData.pageContent.values
              ? { ...prev.pageContent.values, ...configData.pageContent.values }
              : prev.pageContent.values,
            goals: configData.pageContent.goals
              ? { ...prev.pageContent.goals, ...configData.pageContent.goals }
              : prev.pageContent.goals,
            contact: configData.pageContent.contact
              ? { ...prev.pageContent.contact, ...configData.pageContent.contact }
              : prev.pageContent.contact,
            calendar: configData.pageContent.calendar
              ? { ...prev.pageContent.calendar, ...configData.pageContent.calendar }
              : prev.pageContent.calendar,
            footer: configData.pageContent.footer
              ? { ...prev.pageContent.footer, ...configData.pageContent.footer }
              : prev.pageContent.footer
          }
        : prev.pageContent
    }));
  };

  // User management
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
      deleteUser: deleteUserData
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