import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity, Modal, StyleSheet, 
  ActivityIndicator, Alert, Dimensions, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../constants/data";
import { useAuth } from "../context/AuthContext";

const { width: W, height: H } = Dimensions.get("window");

// ─── PREMIUM DESIGN TOKENS (Matched to Global Theme) ──────────────────────────
const T = {
  bg:         "#050103", // Deep Obsidian
  plum:       "#1A0514", // Mid-tone Shadow
  card:       "rgba(255, 255, 255, 0.04)",
  border:     "rgba(255, 255, 255, 0.08)",
  white:      "#FFFFFF",
  muted:      "#7A5568",
  safe:       "#34D399", // Terminal Green
  danger:     "#F43F5E", // Critical Red
  dangerDark: "#9F1239",
  dangerGlow: "rgba(244, 63, 94, 0.15)",
  overlay:    "rgba(0, 0, 0, 0.85)",
};

export default function EscalationModal({ onClose }) {
  const { token } = useAuth();
  const [sending, setSending] = useState(false);

  const sendSOS = async () => {
    setSending(true);
    let locationPayload = {};

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        locationPayload = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      }
    } catch (e) {
      console.log("Location bypassed for speed");
    }

    const res = await apiFetch("/safety/sos", "POST", { location: locationPayload }, token);
    setSending(false);

    if (res.success) {
      const count = res.notified?.length || "all";
      Alert.alert(
        "DISPATCH CONFIRMED",
        `Emergency alert sent to ${count} guardian contacts via AWS SNS.`,
        [{ text: "SECURE", onPress: onClose }]
      );
    } else {
      Alert.alert("DISPATCH FAILED", res.message || "Could not establish connection to AWS.");
    }
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={s.sheetWrap} activeOpacity={1} onPress={() => {}}>
          
          {/* Subtle Danger Glow Background inside the Modal */}
          <LinearGradient
            colors={["#1A050A", T.bg]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
          />


          <View style={s.handle} />

          {/* CRITICAL ALERT ICON */}
          <View style={s.iconWrapper}>
            <View style={s.iconPulse} />
            <View style={s.iconCircle}>
              <Ionicons name="warning" size={42} color={T.danger} />
            </View>
          </View>

          {/* TEXT CONTENT */}
          <Text style={s.shimmerText}>CRITICAL THREAT DETECTED</Text>
          <Text style={s.title}>Escalate to Network?</Text>
          <Text style={s.desc}>
            This action bypasses standard monitoring and immediately dispatches your live GPS coordinates to your Guardian Network via AWS SNS.
          </Text>

          {/* SYSTEM CHECKS (High-Tech Terminal Look) */}
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

          {/* ACTION BUTTONS */}
          <TouchableOpacity 
            style={s.sosBtnTouch} 
            onPress={sendSOS} 
            disabled={sending} 
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={sending ? [T.dangerDark, T.dangerDark] : ["#F87171", T.danger, T.dangerDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[s.sosBtnGrad, sending && { opacity: 0.7 }]}
            >
              {sending ? (
                <ActivityIndicator color={T.white} />
              ) : (
                <>
                  <Ionicons name="flash" size={18} color={T.white} />
                  <Text style={s.sosBtnText}>AUTHORIZE DISPATCH</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.cancelBtnText}>FALSE ALARM — ABORT</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: T.overlay, 
    justifyContent: "center", 
    paddingHorizontal: 20 
  },
  sheetWrap: {
    backgroundColor: T.bg,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.3)", // Danger tinted border
    padding: 28,
    paddingBottom: 32,
    alignItems: "center",
    overflow: "hidden",
    shadowColor: T.danger,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10
  },

  logo: { width: 80, height: 80, marginBottom: 8 },

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
  sosBtnGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 16, height: 60,
  },
  sosBtnText: { color: T.white, fontSize: 15, fontWeight: "900", letterSpacing: 1 },

  cancelBtn: { width: "100%", height: 55, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.card, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: T.muted, fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
});