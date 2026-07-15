import React, { createContext, useContext, useEffect, useState } from 'react';

interface TelegramContextType {
  webApp: any;
  user: any;
  initData: string;
  isReady: boolean;
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  } | null;
  showAlert: (message: string) => void;
  closeApp: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [initData, setInitData] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setInitData(tg.initData || '');
      setUser(tg.initDataUnsafe?.user || null);
    }
    setIsReady(true);
  }, []);

  const impactOccurred = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(style);
    }
  };

  const notificationOccurred = (type: 'error' | 'success' | 'warning') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  };

  const selectionChanged = () => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.selectionChanged();
    }
  };

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const closeApp = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        webApp,
        user,
        initData,
        isReady,
        hapticFeedback: { impactOccurred, notificationOccurred, selectionChanged },
        showAlert,
        closeApp
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    // Return safe fallbacks if not inside a Provider so we don't crash
    return {
      webApp: null,
      user: null,
      initData: '',
      isReady: true,
      hapticFeedback: null,
      showAlert: (msg: string) => alert(msg),
      closeApp: () => {}
    };
  }
  return context;
}
