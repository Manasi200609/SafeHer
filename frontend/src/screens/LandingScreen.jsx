import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: W, height: H } = Dimensions.get("window");

// ─── PREMIUM DESIGN TOKENS ──────────────────────────────────────────────────
const T = {
  bg:       "#050103", // Deep Obsidian
  plum:     "#1A0514", // Mid-tone Shadow
  card:     "rgba(255, 255, 255, 0.04)",
  border:   "rgba(255, 255, 255, 0.08)",
  white:    "#FFFFFF",
  muted:    "#7A5568",
  coral:    "#E8956D",
  accent:   "#F3D8C7",
  silver:   "#A1A1AA",
  textDim:  "#52525B"
};

// ─── GEOMETRIC AURA BACKGROUND ──────────────────────────────────────────────
const GeoBg = () => {
  const lines = [];
  for (let i = 0; i < 18; i++) {
    lines.push(
      <View key={`h${i}`} style={{
        position: "absolute", top: (H / 17) * i, left: 0, right: 0,
        height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.012)", 
      }} />
    );
  }
  for (let i = -6; i < 10; i++) {
    lines.push(
      <View key={`d${i}`} style={{
        position: "absolute", top: 0, left: i * (W / 5),
        width: StyleSheet.hairlineWidth, height: H * 2,
        backgroundColor: "rgba(232,149,109,0.015)", 
        transform: [{ rotate: "22deg" }], transformOrigin: "top left",
      }} />
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: T.bg }]} />
      <LinearGradient
        colors={["transparent", "rgba(92, 15, 42, 0.35)", "transparent"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 0.8 }}
      />
      {lines}
      <LinearGradient
        colors={["rgba(139, 26, 66, 0.25)", "rgba(92, 15, 42, 0.1)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: H * 0.4 }}
      />
      <LinearGradient
        colors={["transparent", "rgba(5, 1, 3, 0.8)"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 250 }}
      />
    </View>
  );
};

// ─── GLOSSY SHINE OVERLAY ───────────────────────────────────────────────────
// This creates the reflection effect on the top edge of the buttons
const ShineOverlay = () => (
  <LinearGradient
    colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0)"]}
    style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
    pointerEvents="none"
  />
);

export default function LandingScreen({ onLogin, onSignup }) {
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      {/* ── HERO SECTION ── */}
      <View style={s.hero}>
        {/* Ambient rings */}
        <View style={s.ring1} />
        <View style={s.ring2} />

        {/* Night Watch Logo Concept */}
        <View style={s.logoWrapper}>
          <LinearGradient
            colors={["rgba(232,149,109,0.2)", "rgba(255,255,255,0.02)"]}
            style={s.logoBg}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            {/* ── IMAGE TAG INTEGRATION ── */}
            <Image 
              source={require("../assets/icon.png")} 
              style={s.logoImg} 
              resizeMode="contain" 
            />
          </LinearGradient>
        </View>

        <Text style={s.brand}>SAFEHER</Text>
        <Text style={s.tagline}>PREDICTIVE SAFETY SYSTEM</Text>

        <Text style={s.pitch}>
          Not reactive.{" "}
          <Text style={{ color: T.coral, fontWeight: "800" }}>Predictive.</Text>
          {"\n"}SafeHer anticipates risk before it reaches you.
        </Text>

        {/* Trust badges */}
        <View style={s.badges}>
          {[
            { icon: "analytics-outline", label: "AI Powered" },
            { icon: "shield-checkmark",  label: "AWS Secure" },
            { icon: "flash",             label: "Real-time" },
          ].map((b, i) => (
            <View key={i} style={s.badge}>
              <Ionicons name={b.icon} size={12} color={T.accent} />
              <Text style={s.badgeText}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── ACTIONS ── */}
      <View style={s.actions}>
        
        {/* Primary Button */}
        <TouchableOpacity style={s.btnPrimaryTouch} onPress={onSignup} activeOpacity={0.85}>
          <LinearGradient
            colors={[T.coral, "rgba(232,149,109,0.7)"]} // Slightly darkened bottom for depth
            style={s.btnPrimaryGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <ShineOverlay />
            <Text style={s.btnPrimaryText}>Create Your Safe Account</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Secondary Button */}
        <TouchableOpacity style={s.btnSecondary} onPress={onLogin} activeOpacity={0.85}>
          {/* subtle shine for the dark button */}
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          />
          <Text style={s.btnSecondaryText}>I Already Have an Account</Text>
        </TouchableOpacity>
        
        <Text style={s.legal}>By joining you agree to our Privacy Policy</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  
  hero: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32,
  },
  
  // High-tech subtle radar rings
  ring1: {
    position: "absolute", width: 340, height: 340, borderRadius: 170,
    borderWidth: 1, borderColor: "rgba(232,149,109,0.08)",
  },
  ring2: {
    position: "absolute", width: 220, height: 220, borderRadius: 110,
    borderWidth: 1, borderColor: "rgba(232,149,109,0.15)",
  },
  
  logoWrapper: {
    marginBottom: 30,
    shadowColor: T.coral, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 30, elevation: 16,
  },
  logoBg: {
    width: 100, height: 100, borderRadius: 32,
    borderWidth: 1, borderColor: "rgba(232,149,109,0.3)",
    alignItems: "center", justifyContent: "center", flexDirection: "row",
    overflow: "hidden" // Keeps image strictly inside rounded corners
  },
  logoImg: { width: 120, height: 120 , borderRadius: 60,transform: [{ scale: 1.3 }]},
  
  brand: {
    fontSize: 42, fontWeight: "900",
    color: T.white, letterSpacing: 4, marginBottom: 6,
  },
  tagline: {
    fontSize: 10, letterSpacing: 4,
    color: T.muted, fontWeight: "800", marginBottom: 24,
  },
  pitch: {
    fontSize: 15, color: T.silver,
    lineHeight: 24, textAlign: "center",
    maxWidth: 290, marginBottom: 32, fontWeight: "500"
  },
  
  badges: { flexDirection: "row", gap: 10 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: T.card, 
    borderWidth: 1, 
    borderColor: T.border,
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 8,
  },
  badgeText: { color: T.white, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  
  actions: { paddingHorizontal: 25, paddingBottom: 50, gap: 14 },
  
  btnPrimaryTouch: { width: "100%", shadowColor: T.coral, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnPrimaryGrad: {
    width: "100%", height: 60, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden" // Keeps the shine overlay inside the button
  },
  btnPrimaryText: { color: T.bg, fontSize: 15, fontWeight: "800", letterSpacing: 0.5, zIndex: 2 },
  
  btnSecondary: {
    width: "100%", height: 60, borderRadius: 16,
    borderWidth: 1, borderColor: T.border, backgroundColor: T.card,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden"
  },
  btnSecondaryText: { color: T.white, fontSize: 14, fontWeight: "700", zIndex: 2 },
  
  legal: { textAlign: "center", fontSize: 11, color: T.textDim, marginTop: 8 },
});