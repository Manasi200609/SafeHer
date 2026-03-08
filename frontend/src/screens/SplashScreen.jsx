import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: W, height: H } = Dimensions.get("window");

// ─── PREMIUM DESIGN TOKENS ──────────────────────────────────────────────────
const T = {
  bg:       "#050103", 
  plum:     "#1A0514", 
  border:   "rgba(255, 255, 255, 0.08)",
  white:    "#FFFFFF",
  muted:    "#7A5568",
  coral:    "#E8956D",
  accent:   "#F3D8C7",
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

export default function SplashScreen() {
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.75)).current;
  const bar   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
    ]).start();
    
    Animated.timing(bar, { toValue: 1, duration: 2400, delay: 400, useNativeDriver: false }).start();
  }, []);

  const barWidth = bar.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      {/* ── AMBIENT GLOW RINGS ── */}
      <View style={[s.ring, { width: 340, height: 340, opacity: 0.08 }]} />
      <View style={[s.ring, { width: 220, height: 220, opacity: 0.15 }]} />

      {/* ── ANIMATED LOGO ── */}
      <Animated.View style={[s.logoWrap, { opacity: fade, transform: [{ scale }] }]}>
        <LinearGradient
          colors={["rgba(232,149,109,0.1)", "rgba(255,255,255,0.01)"]}
          style={s.logoBg}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          {/* UPDATED IMAGE PATH & STYLE */}
          <Image 
            source={require("../assets/icon.png")} 
            style={s.logoImg} 
            resizeMode="contain" 
          />
        </LinearGradient>
      </Animated.View>

      {/* ── ANIMATED TEXT ── */}
      <Animated.View style={{ opacity: fade, alignItems: "center", gap: 8, marginTop: 32 }}>
        <Text style={s.title}>SAFEHER</Text>
        <Text style={s.tagline}>because help shouldn't have to be called.</Text>
      </Animated.View>

      {/* ── LOADER TRACK ── */}
      <Animated.View style={[s.loaderContainer, { opacity: fade }]}>
        <View style={s.loaderTrack}>
          <Animated.View style={[s.loaderBarWrap, { width: barWidth }]}>
            <LinearGradient
              colors={[T.coral, "rgba(232,149,109,0.6)"]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
        <Text style={s.loaderText}>Establishing Secure AWS Uplink...</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: T.bg,
    alignItems: "center", justifyContent: "center",
  },
  
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.coral,
  },
  
  logoWrap: { 
    alignItems: "center", justifyContent: "center",
    shadowColor: T.coral, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 35, elevation: 20,
  },
  logoBg: {
    width: 140, height: 140,
    borderRadius: 40,
    borderWidth: 1, borderColor: "rgba(232,149,109,0.2)",
    alignItems: "center", justifyContent: "center",
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: "hidden", // CRITICAL: This keeps the magnified image inside the frame
  },
  logoImg: { 
    width: 140, // Match the frame size
    height: 140,
    transform: [{ scale: 1.35 }], // Magnifies the image to fill the space perfectly
  },
  
  title: {
    fontSize: 44, fontWeight: "900", color: T.white,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 11, color: T.coral, fontWeight: "500",
    fontStyle: 'italic', letterSpacing: 0.5
  },
  
  loaderContainer: {
    position: "absolute", bottom: 80,
    alignItems: "center", width: "100%",
  },
  loaderTrack: {
    width: 140, height: 3, backgroundColor: T.border, 
    borderRadius: 3, overflow: "hidden", marginBottom: 12,
  },
  loaderBarWrap: { 
    height: "100%", borderRadius: 3, overflow: "hidden" 
  },
  loaderText: {
    fontSize: 10, color: T.muted, fontWeight: "700", letterSpacing: 1,
    textTransform: 'uppercase'
  }
});