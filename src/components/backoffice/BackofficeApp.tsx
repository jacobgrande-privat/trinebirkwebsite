import React from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';

const BackofficeContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <div className="text-gray-600">Indlæser...</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
};

const BackofficeApp: React.FC = () => {
  return (
    <AuthProvider>
      <BackofficeContent />
    </AuthProvider>
  );
};

export default BackofficeApp;