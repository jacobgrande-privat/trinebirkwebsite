import React from 'react';
import { Home, Search, Calendar, Mail } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
  onNavigateCalendar: () => void;
  onNavigateContact: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome, onNavigateCalendar, onNavigateContact }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <Search size={48} className="text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Siden findes ikke</h2>
          <p className="text-xl text-gray-600 mb-6">
            Ups! Det ligner at den side har stukket af til et borgermøde uden os.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Måske er den ude og samle vælgererklæringer, eller også har den bare fået et nyt link.
            Uanset hvad, så finder du ikke noget her - men lad os få dig tilbage på rette spor!
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <Home size={24} />
            Gå til forsiden
          </button>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateCalendar}
              className="inline-flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold"
            >
              <Calendar size={20} />
              Se kalender
            </button>
            <button
              onClick={onNavigateContact}
              className="inline-flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-semibold"
            >
              <Mail size={20} />
              Kontakt os
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Hvis du mener at denne side burde eksistere, så{' '}
            <button
              onClick={onNavigateContact}
              className="text-red-600 hover:text-red-700 font-semibold underline"
            >
              kontakt os gerne
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
