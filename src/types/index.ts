export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: Date;
  lastLogin?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'public' | 'meeting' | 'debate' | 'visit';
  description: string;
  content: string;
  image?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteConfig {
  siteName: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  contactForm: {
    recipientEmail: string;
    smtpSettings: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    };
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  seoSettings: {
    defaultTitle: string;
    defaultDescription: string;
  };
  pageContent: {
    hero: {
      badge: string;
      title: string;
      titleHighlight: string;
      description: string;
      button1Text: string;
      button2Text: string;
      yearsExperience: string;
      yearsLabel: string;
      partyBadge: string;
      partyName: string;
      imageUrl: string;
    };
    about: {
      title: string;
      subtitle: string;
      backgroundTitle: string;
      backgroundText: string;
      educationTitle: string;
      educationItems: string[];
      resultsTitle: string;
      resultStats: Array<{ value: string; label: string }>;
      visionTitle: string;
      visionText: string;
    };
    values: {
      title: string;
      subtitle: string;
      items: Array<{
        title: string;
        description: string;
        icon: string;
      }>;
    };
    goals: {
      title: string;
      subtitle: string;
      sections: Array<{
        title: string;
        description: string;
        icon: string;
        color: string;
        items: string[];
      }>;
    };
    contact: {
      title: string;
      subtitle: string;
      getInTouchTitle: string;
      emailLabel: string;
      phoneLabel: string;
      addressLabel: string;
      followTitle: string;
    };
    calendar: {
      title: string;
      subtitle: string;
    };
    footer: {
      name: string;
      subtitle: string;
      copyright: string;
    };
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}