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
  bg:       "#050103", // Deep Obsidian
  plum:     "#1A0514", // Mid-tone Shadow
  card:     "rgba(255, 255, 255, 0.04)",
  border:   "rgba(255, 255, 255, 0.08)",
  white:    "#FFFFFF",
  muted:    "#7A5568",
  coral:    "#E8956D",
  accent:   "#F3D8C7",
  safe:     "#34D399",
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
      <LinearGradient colors={["transparent", "rgba(92, 15, 42, 0.35)", "transparent"]} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 0.8 }} />
      {lines}
      <LinearGradient colors={["rgba(139, 26, 66, 0.25)", "rgba(92, 15, 42, 0.1)", "transparent"]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: H * 0.4 }} />
      <LinearGradient colors={["transparent", "rgba(5, 1, 3, 0.8)"]} style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 250 }} />
    </View>
  );
};

// ─── HELPERS & SUB-COMPONENTS ───────────────────────────────────────────────
const isValidPhoneFormat = (phone) => {
  if (!phone) return true;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10;
};

const Field = ({ label, value, onChange, placeholder, kb = "default", secure = false }) => (
  <View style={s.inputGroup}>
    <Text style={s.inputLabel}>{label}</Text>
    <TextInput
      style={s.inputField}
      placeholder={placeholder}
      placeholderTextColor={T.textDim}
      keyboardType={kb}
      secureTextEntry={secure}
      autoCapitalize="none"
      autoCorrect={false}
      value={value}
      onChangeText={onChange}
      returnKeyType="next"
    />
  </View>
);

const StepPill = ({ num, active, done }) => (
  <View style={[
    s.pillWrap,
    done   && { backgroundColor: T.safe, borderColor: T.safe },
    active && { backgroundColor: T.coral, borderColor: T.coral },
    !active && !done && { backgroundColor: "transparent", borderColor: T.border },
  ]}>
    {done
      ? <Ionicons name="checkmark" size={14} color={T.bg} />
      : <Text style={[s.pillText, active ? { color: T.bg } : { color: T.muted }]}>{num}</Text>}
  </View>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function SignupScreen({ onBack, onSignup, onGoLogin }) {
  const { register } = useAuth();
  const [step,     setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [form,     setForm]    = useState({
    name: "", email: "", phone: "", password: "",
    bloodGroup: "", emergencyContactName: "", emergencyContactPhone: "",
  });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const goStep2 = () => {
    if (!form.name.trim())              return Alert.alert("Missing", "Please enter your full name.");
    if (!form.email.trim())             return Alert.alert("Missing", "Please enter your email.");
    if (form.password.length < 8)       return Alert.alert("Missing", "Password must be at least 8 characters.");
    if (form.phone && !isValidPhoneFormat(form.phone)) return Alert.alert("Invalid Format", "Please enter a valid phone number.");
    setStep(2);
  };

  // ─── THE BULLETPROOF FAILSAFE LOGIC ───
  const handleRegister = async () => {
    if (!form.emergencyContactName.trim())  return Alert.alert("Missing", "Please enter emergency contact name.");
    if (!form.emergencyContactPhone.trim()) return Alert.alert("Missing", "Please enter emergency contact phone.");
    if (!isValidPhoneFormat(form.emergencyContactPhone)) return Alert.alert("Invalid Format", "Please enter a valid phone number.");
    
    setLoading(true);
    
    try {
      const res = await register(form);
      setLoading(false);
      
      if (res && res.success) {
        if (res.demoMode) {
          Alert.alert(
            "Demo Mode Active", 
            "Backend server connection failed. Bypassing directly to Dashboard for Hackathon Demo.",
            [{ text: "Enter SafeHer", onPress: () => onSignup() }]
          );
        } else {
          onSignup();
        }
      } else {
        Alert.alert("Sign Up Failed", res?.message || "Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.warn("Complete Signup Failure:", error);
      Alert.alert(
        "Demo Mode Active", 
        "Backend server is offline. Bypassing directly to Dashboard.",
        [{ text: "Enter SafeHer", onPress: () => onSignup() }]
      );
    }
  };

  const Header = ({ title, sub, onBackPress }) => (
    <View style={s.header}>
      <TouchableOpacity onPress={onBackPress} style={s.iconBtn}>
        <Ionicons name="chevron-back" size={22} color={T.white} />
      </TouchableOpacity>

      {/* ── FORMATTED LOGO FRAME ── */}
      <View style={s.logoFrame}>
        <Image source={require("../assets/icon.png")} style={s.logoImg} resizeMode="contain" />
      </View>

      <View style={s.stepRow}>
        <StepPill num="1" active={step === 1} done={step > 1} />
        <View style={[s.stepLine, step > 1 && { backgroundColor: T.safe }]} />
        <StepPill num="2" active={step === 2} done={false} />
      </View>
      
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, marginTop: 10 }}>
        <Text style={[s.shimmerText, { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 2 }]}>
          {sub.toUpperCase()}
        </Text>
      </View>

      <Text style={s.heading}>{title}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <>
              <Header title={"Create your\nsafe space"} sub="Step 1 of 2 — Account details" onBackPress={onBack} />
              <View style={s.body}>
                <Field label="FULL NAME *"         value={form.name}     onChange={set("name")}     placeholder="Your name" />
                <Field label="EMAIL ADDRESS *"     value={form.email}    onChange={set("email")}    placeholder="you@example.com" kb="email-address" />
                <Field label="PHONE NUMBER"        value={form.phone}    onChange={set("phone")}    placeholder="+91 00000 00000" kb="phone-pad" />
                <Field label="PASSWORD * (MIN 8)"  value={form.password} onChange={set("password")} placeholder="Create a password" secure />

                <TouchableOpacity style={s.btnPrimaryTouch} onPress={goStep2} activeOpacity={0.85}>
                  <LinearGradient colors={[T.coral, "rgba(232,149,109,0.8)"]} style={s.btnPrimaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={s.btnPrimaryText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={18} color={T.bg} style={{ marginLeft: 6 }} />
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={s.switchText}>
                  Already have an account?{"  "}
                  <Text style={s.link} onPress={onGoLogin}>Sign in</Text>
                </Text>
              </View>
            </>
          ) : (
            <>
              <Header title={"Emergency\nProfile"} sub="Step 2 of 2 — Encrypted, emergencies only" onBackPress={() => setStep(1)} />
              <View style={s.body}>
                <Field label="BLOOD GROUP"               value={form.bloodGroup}             onChange={set("bloodGroup")}             placeholder="e.g. O+" />
                <Field label="EMERGENCY CONTACT NAME *"  value={form.emergencyContactName}   onChange={set("emergencyContactName")}   placeholder="e.g. Mom, Dad" />
                <Field label="EMERGENCY CONTACT PHONE *" value={form.emergencyContactPhone}  onChange={set("emergencyContactPhone")}  placeholder="+91 00000 00000" kb="phone-pad" />

                <View style={s.notice}>
                  <Ionicons name="lock-closed" size={16} color={T.safe} />
                  <Text style={s.noticeText}>Encrypted — only used in emergencies to alert your designated guardian.</Text>
                </View>

                <TouchableOpacity style={s.btnPrimaryTouch} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                  <LinearGradient
                    colors={loading ? ["rgba(232,149,109,0.5)", "rgba(232,149,109,0.5)"] : [T.coral, "rgba(232,149,109,0.8)"]}
                    style={s.btnPrimaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    {loading ? <ActivityIndicator color={T.bg} /> : (
                      <>
                        <Text style={s.btnPrimaryText}>Authorize & Enter</Text>
                        <Ionicons name="shield-checkmark" size={18} color={T.bg} style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  header: { paddingTop: 60, paddingHorizontal: 28, paddingBottom: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  
  // ── NEW STYLES FOR HEADER LOGO ──
  logoFrame: { 
    width: 64, height: 64, 
    borderRadius: 20, 
    backgroundColor: "rgba(255,255,255,0.02)", 
    borderWidth: 1, borderColor: "rgba(232,149,109,0.2)", // Subtle coral border
    alignItems: "center", justifyContent: "center", 
    marginBottom: 24,
    overflow: "hidden" 
  },
  logoImg: { 
    width: 64, height: 64, 
    transform: [{ scale: 1.35 }] // Magnifies the image to hide sharp edges
  },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  pillWrap: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  pillText: { fontSize: 12, fontWeight: "800" },
  stepLine: { flex: 0, width: 40, height: 2, backgroundColor: T.border, marginHorizontal: 8, borderRadius: 1 },
  heading: { fontSize: 36, fontWeight: "900", color: T.white, lineHeight: 44, letterSpacing: 0.5, marginBottom: 8 },
  shimmerText: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  body: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 60 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  inputField: { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 16, paddingHorizontal: 16, height: 60, color: T.white, fontSize: 15, fontWeight: "500" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "rgba(52,211,153,0.1)", borderWidth: 1, borderColor: "rgba(52,211,153,0.25)", borderRadius: 16, padding: 16, marginBottom: 30, marginTop: 10 },
  noticeText: { color: T.safe, fontSize: 12, lineHeight: 18, flex: 1, fontWeight: "600" },
  btnPrimaryTouch: { width: "100%", shadowColor: T.coral, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  btnPrimaryGrad: { flexDirection: "row", width: "100%", height: 60, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  btnPrimaryText: { color: T.bg, fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  switchText: { textAlign: "center", color: T.muted, fontSize: 13, marginTop: 25 },
  link: { color: T.coral, fontWeight: "800" },
});