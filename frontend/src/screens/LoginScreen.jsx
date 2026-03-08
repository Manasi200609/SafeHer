import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Dimensions, StatusBar, Image
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

export default function LoginScreen({ onBack, onLogin, onGoSignup }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return Alert.alert("Missing", "Please enter your email.");
    if (!password)     return Alert.alert("Missing", "Please enter your password.");
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (res.success) onLogin();
    else Alert.alert("Access Denied", res.message || "Invalid credentials.");
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER ── */}
          <View style={s.header}>
            
            {/* ── TOP LEFT NAV AREA ── */}
            <View style={s.topLeftNav}>
              <TouchableOpacity onPress={onBack} style={s.iconBtn}>
                <Ionicons name="chevron-back" size={22} color={T.white} />
              </TouchableOpacity>
              
              {/* ── UPPER LEFT LOGO ── */}
              <View style={s.logoFrame}>
                <Image 
                  source={require("../assets/icon.png")} 
                  style={s.logoImg} 
                  resizeMode="contain" 
                />
              </View>
            </View>
            
            <View style={{ marginTop: 24 }}>
              <Text style={s.shimmerText}>SECURE ACCESS</Text>
              <Text style={s.heading}>Sign In</Text>
              <Text style={s.sub}>because help shouldn't have to be called.</Text>
            </View>
          </View>

          <View style={s.body}>
            {/* ── INPUT: EMAIL ── */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.inputField}
                placeholder="you@example.com"
                placeholderTextColor={T.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
            </View>

            {/* ── INPUT: PASSWORD ── */}
            <View style={[s.inputGroup, { marginBottom: 10 }]}>
              <Text style={s.inputLabel}>PASSWORD</Text>
              <View>
                <TextInput
                  style={[s.inputField, { paddingRight: 50 }]}
                  placeholder="Enter secure key"
                  placeholderTextColor={T.textDim}
                  secureTextEntry={!show}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity style={s.eye} onPress={() => setShow(!show)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name={show ? "eye-off" : "eye"} size={20} color={T.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 35 }}>
              <Text style={s.forgot}>Reset Access Key?</Text>
            </TouchableOpacity>

            {/* ── SIGN IN BUTTON ── */}
            <TouchableOpacity style={s.btnPrimaryTouch} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={loading ? ["rgba(232,149,109,0.5)", "rgba(232,149,109,0.5)"] : [T.coral, "rgba(232,149,109,0.8)"]}
                style={s.btnPrimaryGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                {loading 
                  ? <ActivityIndicator color={T.bg} /> 
                  : <Text style={s.btnPrimaryText}>Initialize Portal Access</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* ── DIVIDER ── */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>OR</Text>
              <View style={s.divLine} />
            </View>

            {/* ── GOOGLE BUTTON ── */}
            <TouchableOpacity style={s.googleBtn} activeOpacity={0.85}>
              <Ionicons name="logo-google" size={18} color={T.white} />
              <Text style={s.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={s.switchText}>
              New to SafeHer?{"  "}
              <Text style={s.link} onPress={onGoSignup}>Join the Network</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingTop: 60, paddingHorizontal: 28, paddingBottom: 10 },
  
  // ── NEW LAYOUT STYLES ──
  topLeftNav: {
    flexDirection: "row", 
    alignItems: "center",
    gap: 12 // Space between back button and logo
  },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 12, 
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: T.border, 
    alignItems: "center", justifyContent: "center" 
  },
  logoFrame: { 
    width: 40, height: 40, // Matches back button size
    borderRadius: 20, 
    backgroundColor: "rgba(255, 255, 255, 0.02)", 
    borderWidth: 1, borderColor: "rgba(232, 149, 109, 0.2)", 
    alignItems: "center", justifyContent: "center", 
    overflow: "hidden" 
  },
  logoImg: { 
    width: 40, height: 40, 
    transform: [{ scale: 1.6 }] // Crops in perfectly on the Lotus
  },

  shimmerText: { color: T.coral, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  heading: { fontSize: 36, fontWeight: "900", color: T.white, letterSpacing: 1, marginBottom: 4 },
  sub: { color: T.coral, fontSize: 12, fontWeight: "500", fontStyle: "italic" },
  body: { paddingHorizontal: 28, paddingTop: 30, paddingBottom: 60 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  inputField: { 
    backgroundColor: T.card, borderWidth: 1, borderColor: T.border, 
    borderRadius: 16, paddingHorizontal: 16, height: 60, 
    color: T.white, fontSize: 15, fontWeight: "500" 
  },
  eye: { position: "absolute", right: 18, top: 20 },
  forgot: { color: T.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  btnPrimaryTouch: { width: "100%", shadowColor: T.coral, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  btnPrimaryGrad: { width: "100%", height: 62, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  btnPrimaryText: { color: T.bg, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 28 },
  divLine: { flex: 1, height: 1, backgroundColor: T.border },
  divText: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderWidth: 1, borderColor: T.border, backgroundColor: T.card, borderRadius: 16,
    height: 62, marginBottom: 32,
    overflow: "hidden"
  },
  googleText: { color: T.white, fontSize: 14, fontWeight: "700" },
  switchText: { textAlign: "center", color: T.muted, fontSize: 13 },
  link: { color: T.coral, fontWeight: "800" },
});