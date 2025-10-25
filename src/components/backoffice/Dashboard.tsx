import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Edit3
} from 'lucide-react';
import CalendarManager from './CalendarManager';
import PageManager from './PageManager';
import UserManager from './UserManager';
import SiteSettings from './SiteSettings';
import ContentEditor from './ContentEditor';

type ActiveTab = 'overview' | 'calendar' | 'pages' | 'content' | 'users' | 'settings';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'overview', name: 'Oversigt', icon: BarChart3 },
    { id: 'calendar', name: 'Kalender', icon: Calendar },
    { id: 'pages', name: 'Sider', icon: FileText },
    { id: 'content', name: 'Sideindhold', icon: Edit3 },
    ...(user?.role === 'admin' ? [{ id: 'users', name: 'Brugere', icon: Users }] : []),
    ...(user?.role === 'admin' ? [{ id: 'settings', name: 'Indstillinger', icon: Settings }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'calendar':
        return <CalendarManager />;
      case 'pages':
        return <PageManager />;
      case 'content':
        return <ContentEditor />;
      case 'users':
        return user?.role === 'admin' ? <UserManager /> : <div>Ingen adgang</div>;
      case 'settings':
        return user?.role === 'admin' ? <SiteSettings /> : <div>Ingen adgang</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Site Backoffice</h1>
                <p className="text-sm text-gray-600">Trine Birk - Socialdemokratiet</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} />
                Log ud
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id as ActiveTab)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-red-50 text-red-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  is_published: boolean;
}

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const colors = ['border-red-500', 'border-blue-500', 'border-green-500', 'border-yellow-500', 'border-purple-500'];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Velkommen {user?.name}</h2>
        <p className="text-gray-600">{user?.email}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">De næste kommende arrangementer</h3>
        <p className="text-sm text-gray-600 mb-4">Næste 10 - se Kalender for alle</p>
        {loading ? (
          <p className="text-gray-500">Indlæser arrangementer...</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-gray-500">Ingen kommende arrangementer</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className={`border-l-4 ${colors[index % colors.length]} pl-4`}>
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600">{formatEventDate(event.start_time)}</p>
                {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;