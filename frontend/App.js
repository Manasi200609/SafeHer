import { useState, useEffect } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "./src/styles/globalStyles";
import { AuthProvider } from "./src/context/AuthContext";

import SplashScreen from "./src/screens/SplashScreen";
import LandingScreen from "./src/screens/LandingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import EscalationModal from "./src/screens/EscalationModal";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [appScreen, setAppScreen] = useState("home");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("landing"), 2800);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const isApp = screen === "app";

  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return <SplashScreen />;
      case "landing":
        return <LandingScreen onLogin={() => setScreen("login")} onSignup={() => setScreen("signup")} />;
      case "login":
        return <LoginScreen onBack={() => setScreen("landing")} onLogin={() => setScreen("onboarding")} onGoSignup={() => setScreen("signup")} />;
      case "signup":
        return <SignupScreen onBack={() => setScreen("landing")} onSignup={() => setScreen("onboarding")} onGoLogin={() => setScreen("login")} />;
      case "onboarding":
        return <OnboardingScreen onDone={() => setScreen("app")} />;
      default:
        return null;
    }
  };

  const renderAppScreen = () => {
    switch (appScreen) {
      case "home":
        return (
          <HomeScreen
            onShowModal={() => setShowModal(true)}
            onGoMap={() => setAppScreen("map")}
            onGoContacts={() => setAppScreen("contacts")}
            onGoSettings={() => setAppScreen("settings")}
          />
        );
      case "map":
        return (
          <MapScreen
            onBack={() => setAppScreen("home")}
            onGoSettings={() => setAppScreen("settings")}
          />
        );
      case "contacts":
        return (
          <ContactsScreen
            onBack={() => setAppScreen("home")}
            onGoSettings={() => setAppScreen("settings")}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            onBack={() => setAppScreen("home")}
            onLogout={() => {
              setScreen("landing"); // <--- Reverted back to landing screen
              setAppScreen("home"); // Resets the inner stack
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          {!isApp ? (
            renderScreen()
          ) : (
            <View style={{ flex: 1 }}>
              {renderAppScreen()}
              {showModal && (
                <EscalationModal onClose={() => setShowModal(false)} />
              )}
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});