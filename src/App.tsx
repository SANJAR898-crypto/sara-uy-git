import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BottomNav, SplashScreen, TopNav } from "./components/layout";
import { ToastContainer, BottomSheet } from "./components/ui";
import { FavoritesProvider, ToastProvider } from "./context";
import Favorites from "./pages/Favorites";
import Home from "./pages/Home";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import PropertyDetails from "./pages/PropertyDetails";
import SearchPage from "./pages/Search";
import type { Property } from "./types";
import type { ScreenId } from "./types-nav";
import { notifications } from "./data";

export type { ScreenId } from "./types-nav";

const cities = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Namangan"];

function AppShell() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<ScreenId>("home");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [city, setCity] = useState("Toshkent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenProperty = (p: Property) => {
    setSelectedProperty(p);
    window.scrollTo({ top: 0 });
  };

  const handleTabChange = (s: ScreenId) => {
    setSelectedProperty(null);
    setNotifOpen(false);
    setScreen(s);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#08233a] via-[#0d3a5c] to-[#0b84d6]">
      <div className="relative mx-auto min-h-screen w-full max-w-lg bg-bg shadow-[0_0_80px_rgba(0,0,0,0.25)]">
      <AnimatePresence>{showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}</AnimatePresence>

      {!showSplash && (
        <>
          <AnimatePresence mode="wait">
            {notifOpen ? (
              <Notifications key="notifications" onBack={() => setNotifOpen(false)} />
            ) : selectedProperty ? (
              <PropertyDetails
                key="details"
                property={selectedProperty}
                onBack={() => setSelectedProperty(null)}
                onOpenProperty={handleOpenProperty}
              />
            ) : (
              <motion.div
                key={screen}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {screen !== "profile" && (
                  <TopNav
                    onNotifications={() => setNotifOpen(true)}
                    unreadCount={unreadCount}
                    city={city}
                    onCityClick={() => setCityOpen(true)}
                  />
                )}
                {screen === "home" && (
                  <Home onOpenProperty={handleOpenProperty} onOpenSearch={() => handleTabChange("search")} loading={loading} />
                )}
                {screen === "search" && <SearchPage onOpenProperty={handleOpenProperty} />}
                {screen === "favorites" && <Favorites onOpenProperty={handleOpenProperty} />}
                {screen === "profile" && <Profile onOpenNotifications={() => setNotifOpen(true)} />}
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedProperty && !notifOpen && (
            <>
              <BottomNav active={screen} onChange={handleTabChange} />
              <div className="h-24" />
            </>
          )}
        </>
      )}

      <BottomSheet open={cityOpen} onClose={() => setCityOpen(false)} title="Shaharni tanlang">
        <div className="space-y-1 pt-1">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCity(c);
                setCityOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-3 text-[14px] font-medium transition-colors ${
                city === c ? "bg-brand-50 text-brand-600" : "text-ink-900 hover:bg-black/[0.03]"
              }`}
            >
              {c}
              {city === c && <span className="text-brand-500">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>

      <ToastContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <FavoritesProvider>
        <AppShell />
      </FavoritesProvider>
    </ToastProvider>
  );
}
