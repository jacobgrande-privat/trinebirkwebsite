import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { CalendarEvent } from '../types';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { events } = useData();

  const monthNames = [
    "Januar", "Februar", "Marts", "April", "Maj", "Juni",
    "Juli", "August", "September", "Oktober", "November", "December"
  ];

  const dayNames = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      new Date(event.date).toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          className={`h-12 flex flex-col items-center justify-center cursor-pointer rounded-lg transition-colors ${
            isToday ? 'bg-red-600 text-white font-bold' :
            isSelected ? 'bg-red-100 text-red-800' :
            dayEvents.length > 0 ? 'bg-blue-50 text-blue-800 font-semibold' :
            'hover:bg-gray-100'
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <span className="text-xs">{day}</span>
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayEvents.map((event, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full ${getEventTypeDotColor(event.type)}`}
                  title={event.title}
                ></div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-red-100 text-red-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'debate': return 'bg-purple-100 text-purple-800';
      case 'visit': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeDotColor = (type: string) => {
    switch (type) {
      case 'public': return 'bg-red-500';
      case 'meeting': return 'bg-blue-500';
      case 'debate': return 'bg-purple-500';
      case 'visit': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'public': return 'Offentligt arrangement';
      case 'meeting': return 'Møde';
      case 'debate': return 'Debat';
      case 'visit': return 'Besøg';
      default: return 'Arrangement';
    }
  };

  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate).sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      })
    : [];
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="h-8 flex items-center justify-center font-semibold text-sm text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-6">
              Arrangementer d. {selectedDate.getDate()}. {monthNames[selectedDate.getMonth()]}
            </h4>
            <div className="space-y-6">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {event.image && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-xl font-bold text-gray-900">{event.title}</h5>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-red-600" />
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-red-600" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-gray-700 font-medium mb-2">Kort beskrivelse:</p>
                      <p className="text-gray-600 leading-relaxed">{event.description}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-700 font-medium mb-3">Detaljeret indhold:</p>
                      <div
                        className="prose prose-sm max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: event.content }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon size={20} />
            Kommende Arrangementer
          </h4>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                className="border-l-4 border-red-500 pl-4 cursor-pointer hover:bg-gray-50 -ml-4 pl-4 py-2 rounded-r transition-colors"
                onClick={() => {
                  setSelectedDate(new Date(event.date));
                  setSelectedEvent(event);
                }}
              >
                <h5 className="font-semibold text-gray-900 text-sm">{event.title}</h5>
                <div className="text-xs text-gray-600 mt-1">
                  <div>{new Date(event.date).getDate()}. {monthNames[new Date(event.date).getMonth()]} kl. {event.time}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getEventTypeColor(event.type)}`}>
                  {getEventTypeLabel(event.type)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Calendar;