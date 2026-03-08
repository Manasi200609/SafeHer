import React from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, Switch, Dimensions, StatusBar, Image, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";

const { width: W, height: H } = Dimensions.get("window");

// ─── PREMIUM DESIGN TOKENS ──────────────────────────────────────────────────
const T = {
  bg:       "#050103", 
  plum:     "#1A0514", 
  card:     "rgba(255, 255, 255, 0.04)",
  border:   "rgba(255, 255, 255, 0.08)",
  white:    "#FFFFFF",
  muted:    "#7A5568",
  coral:    "#E8956D",
  accent:   "#F3D8C7",
  danger:   "#F43F5E",
  textDim:  "#52525B"
};

// ─── GEOMETRIC AURA BACKGROUND ──────────────────────────────────────────────
const GeoBg = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: T.bg }]} />
    <LinearGradient 
      colors={["transparent", "rgba(92, 15, 42, 0.35)", "transparent"]} 
      style={StyleSheet.absoluteFillObject} 
    />
    <LinearGradient 
      colors={["rgba(139, 26, 66, 0.25)", "rgba(92, 15, 42, 0.1)", "transparent"]} 
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: H * 0.4 }} 
    />
  </View>
);

// We add onLogout as a prop so App.js can instantly swap out the navigation stack
export default function SettingsScreen({ onBack, onLogout }) {
  const { user, logout } = useAuth();
  const [notifs, setNotifs] = React.useState(true);
  const [tracking, setTracking] = React.useState(false);

  // ─── ROBUST LOGOUT HANDLER ───
  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to securely disconnect from the SafeHer network?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            await logout(); // Clear context and storage
            if (onLogout) onLogout(); // Trigger App.js state change to show Landing Screen
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, label, value, onValueChange, type = "switch" }) => (
    <View style={s.item}>
      <View style={s.itemLeft}>
        <View style={s.iconBox}>
          <Ionicons name={icon} size={20} color={T.accent} />
        </View>
        <Text style={s.itemLabel}>{label}</Text>
      </View>
      {type === "switch" ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: "#27272A", true: T.coral }}
          thumbColor={T.white}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={T.muted} />
      )}
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      {/* ── HEADER ── */}
      <View style={s.header}>
        {/* ── LEFT NAV AREA (Width: 44px) ── */}
        <View style={{ width: 44 }}>
          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={T.white} />
          </TouchableOpacity>
        </View>

        {/* ── CENTER LOGO & TITLE ── */}
        <View style={s.headerCenter}>
          <View style={s.logoFrame}>
            <Image 
              source={require("../assets/icon.png")} 
              style={s.logoImg} 
              resizeMode="cover" 
            />
          </View>
          <Text style={s.title}>Settings</Text>
        </View>
        
        {/* ── RIGHT BALANCE AREA (Width: 44px) ── */}
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Profile Card dynamically maps user data from DB via AuthContext */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.name || "Active Guardian"}</Text>
            <Text style={s.profileEmail}>{user?.email || "Secure Connection"}</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>PREFERENCES</Text>
        <View style={s.section}>
          <SettingItem 
            icon="notifications-outline" 
            label="Push Notifications" 
            value={notifs} 
            onValueChange={setNotifs} 
          />
          <SettingItem 
            icon="location-outline" 
            label="Background Tracking" 
            value={tracking} 
            onValueChange={setTracking} 
          />
        </View>

        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <View style={s.section}>
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem icon="shield-checkmark-outline" label="Privacy Policy" type="link" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <SettingItem icon="document-text-outline" label="Terms of Service" type="link" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON triggers the new handleLogout function */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={T.danger} />
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.versionText}>SafeHer v1.0.4 (Production)</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { 
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", 
    paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 
  },
  
  // ── NAV STYLES ──
  backBtn: { 
    width: 44, height: 44, borderRadius: 12, backgroundColor: T.card, 
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border 
  },
  
  // ── CENTERED HEADER STYLES ──
  headerCenter: { 
    alignItems: "center", 
    gap: 10 
  },
  logoFrame: { 
    width: 48, height: 48, 
    borderRadius: 24, 
    backgroundColor: "rgba(255, 255, 255, 0.02)", 
    borderWidth: 1, borderColor: "rgba(232, 149, 109, 0.2)", 
    alignItems: "center", justifyContent: "center", 
    overflow: "hidden" 
  },
  logoImg: { 
    width: 48, height: 48, 
    transform: [{ scale: 1.6 }] 
  },
  title: { color: T.white, fontSize: 24, fontWeight: "900", letterSpacing: 0.5 },
  
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCard: { 
    flexDirection: "row", alignItems: "center", backgroundColor: T.card, 
    borderRadius: 24, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: T.border 
  },
  avatar: { 
    width: 60, height: 60, borderRadius: 30, backgroundColor: T.plum, 
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.coral 
  },
  avatarText: { color: T.white, fontSize: 24, fontWeight: "bold" },
  profileInfo: { marginLeft: 15 },
  profileName: { color: T.white, fontSize: 18, fontWeight: "800" },
  profileEmail: { color: T.muted, fontSize: 14 },

  sectionLabel: { color: T.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1.5, marginBottom: 12, marginLeft: 5 },
  section: { backgroundColor: T.card, borderRadius: 24, borderWidth: 1, borderColor: T.border, marginBottom: 25, overflow: "hidden" },
  
  item: { 
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", 
    padding: 16, borderBottomWidth: 1, borderBottomColor: T.border 
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(232,149,109,0.1)", alignItems: "center", justifyContent: "center" },
  itemLabel: { color: T.white, fontSize: 15, fontWeight: "600", marginLeft: 12 },

  logoutBtn: { 
    flexDirection: "row", alignItems: "center", justifyContent: "center", 
    padding: 18, borderRadius: 20, backgroundColor: "rgba(244,63,94,0.05)", 
    borderWidth: 1, borderColor: "rgba(244,63,94,0.1)", marginTop: 10 
  },
  logoutText: { color: T.danger, fontSize: 16, fontWeight: "800", marginLeft: 8 },
  versionText: { textAlign: "center", color: T.textDim, fontSize: 12, marginTop: 30, fontWeight: "600" }
});