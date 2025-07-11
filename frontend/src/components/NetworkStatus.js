import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide offline notification after 5 seconds
  useEffect(() => {
    if (showOffline && isOnline) {
      const timer = setTimeout(() => {
        setShowOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOffline]);

  if (!showOffline && isOnline) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-4 right-4 z-40 transition-all duration-300 ${
      showOffline ? 'transform translate-y-0' : 'transform -translate-y-full'
    }`}>
      <div className={`rounded-lg p-3 shadow-lg ${
        isOnline 
          ? 'bg-green-100 border border-green-200' 
          : 'bg-red-100 border border-red-200'
      }`}>
        <div className="flex items-center">
          <div className={`p-1 rounded-full mr-3 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOnline ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728 0L5.636 5.636" />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              isOnline ? 'text-green-800' : 'text-red-800'
            }`}>
              {isOnline ? 'Conectado' : 'Sem conexão'}
            </p>
            <p className={`text-xs ${
              isOnline ? 'text-green-600' : 'text-red-600'
            }`}>
              {isOnline 
                ? 'Conexão restaurada' 
                : 'Algumas funcionalidades podem estar limitadas'
              }
            </p>
          </div>
          {isOnline && (
            <button
              onClick={() => setShowOffline(false)}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;