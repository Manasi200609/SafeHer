import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ONBOARDING_STEPS } from "../constants/data";

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
const ShineOverlay = () => (
  <LinearGradient
    colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0)"]}
    style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
    pointerEvents="none"
  />
);

export default function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const s     = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <View style={st.container}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      {/* ── LOGO HEADER (TOP LEFT) ── */}
      <View style={st.logoWrap}>
        <View style={st.logoFrame}>
          <Image 
            source={require("../assets/icon.png")} 
            style={st.logoImg} 
            resizeMode="cover" 
          />
        </View>
      </View>

      {/* ── VISUAL HERO ── */}
      <View style={st.visual}>
        <View style={st.glowOuter} />
        <View style={st.glowInner} />
        <View style={st.iconCircle}>
          <Ionicons name={s.icon} size={70} color={T.coral} />
        </View>
      </View>

      {/* ── PAGINATION DOTS ── */}
      <View style={st.dots}>
        {ONBOARDING_STEPS.map((_, i) => (
          <View key={i} style={[st.dot, i === step && st.dotActive]} />
        ))}
      </View>

      {/* ── TEXT CONTENT ── */}
      <View style={st.content}>
        <Text style={st.stepLabel}>{s.step}</Text>
        <Text style={st.heading}>
          {s.heading}{"\n"}
          <Text style={{ color: T.coral }}>{s.heading2}</Text>
        </Text>
        <Text style={st.body}>{s.body}</Text>
      </View>

      {/* ── ACTIONS ── */}
      <View style={st.actions}>
        <TouchableOpacity onPress={onDone} style={st.skipBtn} activeOpacity={0.7}>
          <Text style={st.skipText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={st.btnPrimaryTouch}
          activeOpacity={0.85}
          onPress={() => isLast ? onDone() : setStep(step + 1)}
        >
          <LinearGradient
            colors={[T.coral, "rgba(232,149,109,0.7)"]} // Slightly darkened bottom for depth
            style={st.btnPrimaryGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <ShineOverlay />
            <Text style={st.btnPrimaryText}>{isLast ? "Initialize Protection" : "Continue"}</Text>
            <Ionicons name={isLast ? "shield-checkmark" : "arrow-forward"} size={18} color={T.bg} style={{ marginLeft: 6, zIndex: 2 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },

  // ── MOVED LOGO TO TOP LEFT ──
  logoWrap: { 
    width: "100%", 
    alignItems: "flex-start", 
    paddingTop: 60, 
    paddingHorizontal: 32 
  },
  logoFrame: {
    width: 48, height: 48, // Scaled down slightly for corner placement
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
  
  visual: { flex: 1, alignItems: "center", justifyContent: "center" },
  glowOuter: {
    position: "absolute", width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(232,149,109,0.04)", 
  },
  glowInner: {
    position: "absolute", width: 190, height: 190, borderRadius: 95,
    backgroundColor: "rgba(232,149,109,0.08)",
  },
  iconCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: "rgba(232,149,109,0.1)",
    borderWidth: 1.5, borderColor: "rgba(232,149,109,0.25)",
    alignItems: "center", justifyContent: "center",
    shadowColor: T.coral, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 22 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.border },
  dotActive: { width: 28, backgroundColor: T.coral, shadowColor: T.coral, shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } },
  
  content: { paddingHorizontal: 32, paddingBottom: 25 },
  stepLabel: {
    fontSize: 10, fontWeight: "800", letterSpacing: 2,
    color: T.muted, textTransform: "uppercase", marginBottom: 12,
  },
  heading: { fontSize: 32, fontWeight: "900", color: T.white, lineHeight: 40, marginBottom: 16, letterSpacing: 0.5 },
  body: { fontSize: 14, color: T.silver, lineHeight: 24, fontWeight: "500" },
  
  actions: {
    flexDirection: "row", gap: 16, alignItems: "center",
    paddingHorizontal: 28, paddingBottom: 55,
  },
  skipBtn: { paddingVertical: 16, paddingHorizontal: 12 },
  skipText: { color: T.muted, fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
  
  btnPrimaryTouch: { flex: 1, shadowColor: T.coral, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  btnPrimaryGrad: {
    flexDirection: "row", height: 60, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden" // CRITICAL: Keeps the shine inside the button's rounded corners
  },
  btnPrimaryText: { color: T.bg, fontSize: 15, fontWeight: "800", letterSpacing: 0.5, zIndex: 2 },
});