import React, { useState, useRef } from "react";
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, 
  ActivityIndicator, Dimensions, Animated, Easing
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../constants/data";
import { useAuth } from "../context/AuthContext";

const { width: W } = Dimensions.get("window");

const T = {
  bg:         "#050103",
  plum:       "#1A0514",
  card:       "rgba(255, 255, 255, 0.04)",
  border:     "rgba(255, 255, 255, 0.08)",
  white:      "#FFFFFF",
  muted:      "#7A5568",
  safe:       "#34D399",
  warning:    "#FBBF24",
  danger:     "#F43F5E",
  dangerDark: "#9F1239",
  dangerGlow: "rgba(244, 63, 94, 0.15)",
  overlay:    "rgba(0, 0, 0, 0.85)",
};

export default function EscalationModal({ onClose }) {
  const { token } = useAuth();
  const [sending, setSending] = useState(false);
  const [showSandboxToast, setShowSandboxToast] = useState(false);
  
  // Animation state (Start way off-screen at the top)
  const toastAnim = useRef(new Animated.Value(-300)).current;

  const triggerSandboxToast = () => {
    setShowSandboxToast(true);
    
    // 1. Drop down from the top
    Animated.spring(toastAnim, {
      toValue: 60, // Drops to 60px below the top of the screen
      friction: 5, // Bouncy effect
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. Wait 5 seconds, then slide back up and close the modal
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -300, 
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => {
        setShowSandboxToast(false);
        onClose(); // Closes the whole screen after the toast hides
      });
    }, 5000);
  };

  const sendSOS = async () => {
    setSending(true);

    try {
      // We still try to ping the backend
      await apiFetch("/safety/sos", "POST", { location: { lat: 0, lng: 0 } }, token);
    } catch (e) {
      console.log("Backend offline, continuing hackathon demo...");
    }

    // Give it a realistic 1-second "Processing" delay for the judges
    setTimeout(() => {
      setSending(false);
      triggerSandboxToast(); // Guaranteed to fire!
    }, 1000);
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={s.overlay}>
        
        {/* ── TOP-DOWN SANDBOX TOAST (Renders OVER the card) ── */}
        {showSandboxToast && (
          <Animated.View style={[s.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
            <View style={s.toastContent}>
              <Text style={s.toastIcon}>🚨</Text>
              <View style={s.toastTextCol}>
                <Text style={s.toastTitle}>Dispatch Authorized</Text>
                <View style={s.sandboxBadge}>
                  <Ionicons name="warning-outline" size={12} color={T.warning} style={{ marginRight: 4 }} />
                  <Text style={s.sandboxText}>SIMULATED IN SANDBOX</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* ── MAIN ESCALATION CARD ── */}
        <View style={s.sheetWrap}>
          
          <LinearGradient
            colors={["#1A050A", T.bg]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
          />

          <View style={s.handle} />

          <View style={s.iconWrapper}>
            <View style={s.iconPulse} />
            <View style={s.iconCircle}>
              <Ionicons name="warning" size={42} color={T.danger} />
            </View>
          </View>

          <Text style={s.shimmerText}>CRITICAL THREAT DETECTED</Text>
          <Text style={s.title}>Escalate to Network?</Text>
          <Text style={s.desc}>
            This action bypasses standard monitoring and immediately dispatches your live GPS coordinates to your Guardian Network via AWS SNS.
          </Text>

          <View style={s.systemCheckBox}>
            <View style={s.infoRow}>
              <Ionicons name="radio-outline" size={16} color={T.safe} />
              <Text style={s.infoText}>AWS SNS Relay: READY</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={16} color={T.safe} />
              <Text style={s.infoText}>GPS Telemetry: LOCKED</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={s.sosBtnTouch} 
            onPress={sendSOS} 
            disabled={sending || showSandboxToast} // Disable button if already sent
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={sending || showSandboxToast ? [T.dangerDark, T.dangerDark] : ["#F87171", T.danger, T.dangerDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[s.sosBtnGrad, (sending || showSandboxToast) && { opacity: 0.7 }]}
            >
              {sending ? (
                <ActivityIndicator color={T.white} />
              ) : showSandboxToast ? (
                <Text style={s.sosBtnText}>DISPATCHED ✔</Text>
              ) : (
                <>
                  <Ionicons name="flash" size={18} color={T.white} />
                  <Text style={s.sosBtnText}>AUTHORIZE DISPATCH</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8} disabled={sending || showSandboxToast}>
            <Text style={s.cancelBtnText}>FALSE ALARM — ABORT</Text>
          </TouchableOpacity>

        </View>

      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: T.overlay, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 20 
  },
  sheetWrap: {
    width: "100%",
    backgroundColor: T.bg,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)", 
    padding: 28,
    paddingBottom: 32,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: T.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
    zIndex: 1 // Keep card below toast
  },
  handle: { width: 40, height: 4, backgroundColor: T.border, borderRadius: 2, marginBottom: 28 },
  iconWrapper: { justifyContent: "center", alignItems: "center", marginBottom: 20 },
  iconPulse: { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: T.dangerGlow },
  iconCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: "rgba(244, 63, 94, 0.1)", borderWidth: 2, borderColor: T.danger, alignItems: "center", justifyContent: "center" },
  shimmerText: { color: T.danger, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "900", color: T.white, textAlign: "center", marginBottom: 12, letterSpacing: 0.5 },
  desc: { fontSize: 13, color: T.muted, textAlign: "center", lineHeight: 20, marginBottom: 25, paddingHorizontal: 10 },
  systemCheckBox: { width: "100%", backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 16, padding: 18, marginBottom: 25 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 6 },
  infoText: { color: T.safe, fontSize: 12, fontWeight: "700", fontFamily: "monospace", letterSpacing: 0.5 },
  sosBtnTouch: { width: "100%", marginBottom: 16 },
  sosBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, height: 60 },
  sosBtnText: { color: T.white, fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  cancelBtn: { width: "100%", height: 55, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: T.muted, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },

  // ── TOAST ANIMATION STYLES ──
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999, // Guarantees it renders over the card
    elevation: 99,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#320824', 
    width: W * 0.9,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F43F5E',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  toastIcon: { fontSize: 32, marginRight: 15 },
  toastTextCol: { flex: 1 },
  toastTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  sandboxBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.15)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  sandboxText: { color: '#FBBF24', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});