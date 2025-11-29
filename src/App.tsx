import React, { useState, useEffect } from 'react';
import { ChevronDown, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Users, Target, Heart, Globe, ArrowRight, Menu, X, Shield, Briefcase, Home, Leaf, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './components/Calendar';
import ContactForm from './components/ContactForm';
import BackofficeApp from './components/backoffice/BackofficeApp';
import NotFound from './components/NotFound';
import { DataProvider, useData } from './contexts/DataContext';

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

function AppContent() {
  const { siteConfig, pages, isLoading } = useData();
  const content = siteConfig.pageContent;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [show404, setShow404] = useState(false);

  // Check if we're in backoffice mode
  const isBackoffice = window.location.pathname.startsWith('/backoffice');

  useEffect(() => {
    const path = window.location.pathname;

    if (path === '/' || path === '') {
      setShow404(false);
      setActiveSection('home');
      return;
    }

    const slug = path.replace(/^\//, '');

    if (slug === 'calendar' || slug === 'kalender') {
      setShow404(false);
      setActiveSection('calendar');
      return;
    }

    const validSections = ['om', 'maal', 'kontakt'];
    if (validSections.includes(slug)) {
      setShow404(false);
      setActiveSection(slug);
      return;
    }

    const pageExists = pages.find(page => page.slug === slug && page.published);
    if (pageExists) {
      setShow404(false);
      setActiveSection(`page-${slug}`);
      return;
    }

    setShow404(true);
  }, [pages]);

  // Return early after all hooks
  if (isBackoffice) {
    return <BackofficeApp />;
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Indlæser...</p>
        </div>
      </div>
    );
  }

  // Get dynamic page content
  const getPageBySlug = (slug: string) => {
    return pages.find(page => page.slug === slug && page.published);
  };

  const scrollToSection = (sectionId: string) => {
    setShow404(false);
    setActiveSection(sectionId);
    if (sectionId === 'calendar') return;

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  if (show404) {
    return (
      <NotFound
        onNavigateHome={() => scrollToSection('home')}
        onNavigateCalendar={() => scrollToSection('calendar')}
        onNavigateContact={() => scrollToSection('kontakt')}
      />
    );
  }

  // Render dynamic page content
  const renderDynamicPage = (slug: string) => {
    const page = getPageBySlug(slug);
    if (!page) return null;

    return (
      <section className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </section>
    );
  };

  const renderContent = () => {
    if (activeSection === 'calendar') {
      return (
        <section className="min-h-screen bg-gray-50 pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.calendar.title}</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.calendar.subtitle}
              </p>
            </div>
            <Calendar />
          </div>
        </section>
      );
    }

    // Check if it's a dynamic page
    if (activeSection.startsWith('page-')) {
      const slug = activeSection.replace('page-', '');
      return renderDynamicPage(slug);
    }

    return (
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-blue-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                    {content.hero.badge}
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    {content.hero.title} <span className="text-red-600">{content.hero.titleHighlight}</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {content.hero.description}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => scrollToSection('maal')}
                    className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
                  >
                    {content.hero.button1Text}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => scrollToSection('kontakt')}
                    className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold"
                  >
                    {content.hero.button2Text}
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-96 lg:h-[500px] bg-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                  <img
                    src={content.hero.imageUrl}
                    alt={`${content.hero.title} ${content.hero.titleHighlight}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-2 rounded-xl shadow-lg">
                  <img
                    src="https://s-holbaek.dk/custom/images/logo.png"
                    alt={content.hero.partyName}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => scrollToSection('om')}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-red-600 animate-bounce"
            aria-label="Scroll ned til Om Trine sektion"
          >
            <ChevronDown size={32} aria-hidden="true" />
          </button>
        </section>

        {/* About Section */}
        <section id="om" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{content.about.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.about.subtitle}
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-red-50 p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-red-800 mb-3">{content.about.backgroundTitle}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content.about.backgroundText}
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-blue-800 mb-3">{content.about.educationTitle}</h3>
                  <ul className="space-y-3 text-gray-700">
                    {content.about.educationItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" aria-hidden="true"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-green-800 mb-3">{content.about.resultsTitle}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {content.about.resultStats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-green-800">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-red-800 mb-3">{content.about.visionTitle}</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {content.about.visionText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Goals Section */}
        <section id="maal" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{content.goals.title}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {content.goals.subtitle}
              </p>
            </div>

            <div className="space-y-8">
              {content.goals.sections
                .filter(section => {
                  const hasContent = section.title || section.description || section.icon || section.color;
                  const hasItems = section.items && section.items.length > 0 && section.items.some(item => item.trim() !== '');
                  return hasContent || hasItems;
                })
                .map((section, index) => {
                const iconMap: { [key: string]: any } = {
                  shield: Shield,
                  users: Users,
                  leaf: Leaf,
                  home: Home
                };
                const Icon = iconMap[section.icon] || Shield;
                const bgColorMap: { [key: string]: string } = {
                  red: 'bg-red-50',
                  blue: 'bg-blue-50',
                  green: 'bg-green-50',
                  purple: 'bg-purple-50'
                };
                const textColorMap: { [key: string]: string } = {
                  red: 'text-red-800',
                  blue: 'text-blue-800',
                  green: 'text-green-800',
                  purple: 'text-purple-800'
                };
                const bgIconColorMap: { [key: string]: string } = {
                  red: 'bg-red-600',
                  blue: 'bg-blue-600',
                  green: 'bg-green-600',
                  purple: 'bg-purple-600'
                };
                const targetColorMap: { [key: string]: string } = {
                  red: 'text-red-600',
                  blue: 'text-blue-600',
                  green: 'text-green-600',
                  purple: 'text-purple-600'
                };

                return (
                  <div key={index} className={`${bgColorMap[section.color] || 'bg-red-50'} p-8 rounded-xl`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${bgIconColorMap[section.color] || 'bg-red-600'} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                        <Icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold ${textColorMap[section.color] || 'text-red-800'} mb-3`}>{section.title}</h3>
                        <p className="text-gray-700 mb-4">
                          {section.description}
                        </p>
                        <ul className="space-y-2 text-gray-700">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2">
                              <Target size={16} className={`${targetColorMap[section.color] || 'text-red-600'} flex-shrink-0`} aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="kontakt" className="py-20 bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">{content.contact.title}</h2>
              <p className="text-xl text-red-50 max-w-3xl mx-auto">
                {content.contact.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold mb-6">{content.contact.getInTouchTitle}</h3>
                  <div className="space-y-4">
                    {siteConfig.contactEmail && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center" aria-hidden="true">
                          <Mail size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{content.contact.emailLabel}</div>
                          <div className="text-red-50">{siteConfig.contactEmail}</div>
                        </div>
                      </div>
                    )}
                    {siteConfig.phoneNumber && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center" aria-hidden="true">
                          <Phone size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{content.contact.phoneLabel}</div>
                          <div className="text-red-50">{siteConfig.phoneNumber}</div>
                        </div>
                      </div>
                    )}
                    {siteConfig.address && (
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center" aria-hidden="true">
                          <MapPin size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{content.contact.addressLabel}</div>
                          <div className="text-red-50" style={{ whiteSpace: 'pre-line' }}>{siteConfig.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-6">{content.contact.followTitle}</h3>
                  <div className="flex gap-4">
                    {siteConfig.socialMedia.facebook && (
                      <a href={siteConfig.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors" aria-label="Besøg vores Facebook side">
                        <Facebook size={20} className="text-white" aria-hidden="true" />
                      </a>
                    )}
                    {siteConfig.socialMedia.twitter && (
                      <a href={siteConfig.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors" aria-label="Besøg vores Twitter side">
                        <Twitter size={20} className="text-white" aria-hidden="true" />
                      </a>
                    )}
                    {siteConfig.socialMedia.instagram && (
                      <a href={siteConfig.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors" aria-label="Besøg vores Instagram side">
                        <Instagram size={20} className="text-white" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl text-gray-900">
                <ContactForm recipientEmail={siteConfig.contactForm.recipientEmail} />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">{content.footer.name}</div>
              <div className="text-gray-400 mb-4">{content.footer.subtitle}</div>
              <div className="text-sm text-gray-400">
                {content.footer.copyright}
              </div>
            </div>
          </div>
        </footer>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-lg"
      >
        Spring til hovedindhold
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 transition-all duration-300" role="navigation" aria-label="Hoved navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => scrollToSection('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              aria-label="Gå til forsiden"
            >
              <img
                src="https://s-holbaek.dk/custom/images/logo.png"
                alt="Socialdemokratiet logo"
                className="w-10 h-10 object-contain"
              />
              <div className="text-2xl font-bold text-gray-900">Trine Birk</div>
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <button
                onClick={() => scrollToSection('om')}
                className={`transition-colors font-medium ${activeSection === 'om' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
              >
                Om Trine
              </button>
              <button 
                onClick={() => scrollToSection('maal')} 
                className={`transition-colors font-medium ${activeSection === 'maal' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
              >
                Mærkesager
              </button>
              <button
                onClick={() => scrollToSection('calendar')}
                className={`transition-colors font-medium flex items-center gap-1 ${activeSection === 'calendar' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
              >
                <CalendarIcon size={16} aria-hidden="true" />
                Kalender
              </button>
              <button 
                onClick={() => scrollToSection('kontakt')} 
                className={`transition-colors font-medium ${activeSection === 'kontakt' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
              >
                Kontakt
              </button>
              
              {/* Dynamic Pages */}
              {pages.filter(page => page.published).map(page => (
                <button
                  key={page.id}
                  onClick={() => setActiveSection(`page-${page.slug}`)}
                  className={`transition-colors font-medium ${activeSection === `page-${page.slug}` ? 'text-red-600' : 'text-gray-700 hover:text-red-600'}`}
                >
                  {page.title}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-red-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Luk menu" : "Åbn menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div id="mobile-menu" className="md:hidden bg-white border-t border-gray-200 py-4 space-y-2">
              <button
                onClick={() => scrollToSection('om')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors font-medium"
              >
                Om Trine
              </button>
              <button 
                onClick={() => scrollToSection('maal')} 
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors font-medium"
              >
                Mærkesager
              </button>
              <button
                onClick={() => scrollToSection('calendar')}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors font-medium"
              >
                <CalendarIcon size={16} aria-hidden="true" />
                Kalender
              </button>
              <button 
                onClick={() => scrollToSection('kontakt')} 
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors font-medium"
              >
                Kontakt
              </button>
              
              {/* Dynamic Pages in Mobile Menu */}
              {pages.filter(page => page.published).map(page => (
                <button
                  key={page.id}
                  onClick={() => setActiveSection(`page-${page.slug}`)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  {page.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {renderContent()}
    </div>
  );
}

export default App;