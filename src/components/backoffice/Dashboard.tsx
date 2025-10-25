import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Mail,
  Clock,
  TrendingUp,
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

const DashboardOverview: React.FC = () => {
  const stats = [
    { name: 'Kommende Arrangementer', value: '12', icon: Calendar, color: 'text-blue-600' },
    { name: 'Aktive Sider', value: '8', icon: FileText, color: 'text-green-600' },
    { name: 'Nyhedsbrev Tilmeldinger', value: '1,247', icon: Mail, color: 'text-purple-600' },
    { name: 'Månedlige Besøgende', value: '3,891', icon: TrendingUp, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Oversigt</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seneste Aktivitet</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ny side "Klimapolitik" oprettet</span>
              <span className="text-xs text-gray-400 ml-auto">2 timer siden</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Arrangement "Borgermøde" opdateret</span>
              <span className="text-xs text-gray-400 ml-auto">5 timer siden</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">23 nye nyhedsbrev tilmeldinger</span>
              <span className="text-xs text-gray-400 ml-auto">1 dag siden</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kommende Arrangementer</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-medium text-gray-900">Borgermøde om Sundhed</h4>
              <p className="text-sm text-gray-600">15. januar kl. 19:00</p>
              <p className="text-sm text-gray-500">Kulturhuset, Aarhus</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Besøg på AUH</h4>
              <p className="text-sm text-gray-600">18. januar kl. 10:00</p>
              <p className="text-sm text-gray-500">Aarhus Universitetshospital</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Valgdebat - DR</h4>
              <p className="text-sm text-gray-600">22. januar kl. 20:00</p>
              <p className="text-sm text-gray-500">DR Huset, Aarhus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;