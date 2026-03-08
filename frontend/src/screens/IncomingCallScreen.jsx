import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Dimensions, Vibration , ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
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
  safe:     "#34D399", // Native Call Green
  danger:   "#F43F5E", // Native Hangup Red
  coral:    "#E8956D",
  accent:   "#F3D8C7",
};

// ─── NATIVE-LOOKING BACKGROUND ──────────────────────────────────────────────
const CallBg = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <LinearGradient
      colors={[T.plum, T.bg, T.bg]}
      style={StyleSheet.absoluteFillObject}
      start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
    />
  </View>
);

export default function IncomingCallScreen({ audioUrl, script, onHangUp }) {
  const [callStatus, setCallStatus] = useState("RINGING"); // RINGING, ACTIVE, ENDED
  const [sound, setSound] = useState(null);
  const [timer, setTimer] = useState(0);

  // 1. Play a realistic ringing vibration when the screen opens
  useEffect(() => {
    let interval;
    if (callStatus === "RINGING") {
      // Vibrate pattern: wait 0ms, vibrate 1s, pause 2s
      interval = setInterval(() => Vibration.vibrate([0, 1000, 2000]), 3000);
    }
    return () => {
      clearInterval(interval);
      Vibration.cancel(); // Stop vibrating if unmounted
    };
  }, [callStatus]);

  // 2. Call duration timer for realism
  useEffect(() => {
    let interval;
    if (callStatus === "ACTIVE") {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 3. User Answers the Call
  const handleAccept = async () => {
    setCallStatus("ACTIVE");
    Vibration.cancel();
    
    if (audioUrl) {
      try {
        await Audio.setAudioModeAsync({ 
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
        });

        const { sound: playbackObject } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, volume: 1.0 }
        );
        setSound(playbackObject);
        
        playbackObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            handleHangUp();
          }
        });
      } catch (err) {
        console.error("Audio playback failed:", err);
      }
    }
  };

  // 4. User Hangs Up (or AI finishes)
  const handleHangUp = async () => {
    setCallStatus("ENDED");
    Vibration.cancel();
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    onHangUp(); // Tell the Home Screen to close this UI
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <View style={s.container}>
      <CallBg />

      {/* ── TOP: CALLER INFO (Realistic Contact Name) ── */}
      <View style={s.topSection}>
        <Text style={s.callerName}>Priya (Sister)</Text>
        <Text style={s.statusText}>
          {callStatus === "RINGING" ? "Mobile..." : formatTime(timer)}
        </Text>
      </View>

      {/* ── MIDDLE: REALISTIC AVATAR ── */}
      <View style={s.avatarContainer}>
        {/* Replaced the shield with a standard contact initial to maintain the illusion */}
        <Text style={s.avatarText}>P</Text>
      </View>

      {/* ── SCRIPT: Shows what the AI is saying (Safely Rendered) ── */}
      {callStatus === "ACTIVE" && script ? (
  <View style={s.scriptBox}>
    <View style={s.scriptHeaderRow}>
      <Ionicons name="moon" size={12} color={T.accent} />
      <Text style={s.scriptLabel}>SAFEHER AI SCRIPT:</Text>
    </View>
    {/* Wrap the text in a ScrollView with a fixed height */}
    <View style={{ height: 120 }}> 
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.scriptText}>{script.replace(/<[^>]+>/g, '')}</Text>
      </ScrollView>
    </View>
  </View>
) : null}

      {/* ── BOTTOM: NATIVE ACTION BUTTONS ── */}
      <View style={s.bottomSection}>
        {callStatus === "RINGING" ? (
          <View style={s.ringingControls}>
            <View style={s.btnGroup}>
              <TouchableOpacity style={[s.btn, s.btnRed]} onPress={handleHangUp} activeOpacity={0.8}>
                <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>
              <Text style={s.btnLabel}>Decline</Text>
            </View>
            
            <View style={s.btnGroup}>
              <TouchableOpacity style={[s.btn, s.btnGreen]} onPress={handleAccept} activeOpacity={0.8}>
                <Ionicons name="call" size={32} color="white" />
              </TouchableOpacity>
              <Text style={s.btnLabel}>Accept</Text>
            </View>
          </View>
        ) : (
          <View style={s.activeControls}>
            <View style={s.btnGroup}>
              <TouchableOpacity style={[s.btn, s.btnRed]} onPress={handleHangUp} activeOpacity={0.8}>
                <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    width: W, 
    height: H, 
    backgroundColor: T.bg, 
    zIndex: 9999, 
    justifyContent: "space-between", 
    paddingVertical: 80 
  },
  
  topSection: { 
    alignItems: "center",
    marginTop: 20
  },
  callerName: { 
    color: T.white, 
    fontSize: 36, 
    fontWeight: "300", 
    letterSpacing: 0.5,
    marginBottom: 8 
  },
  statusText: { 
    color: T.muted, 
    fontSize: 18,
    fontWeight: "400"
  },
  
  avatarContainer: { 
    alignSelf: "center", 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: "rgba(255,255,255,0.08)", // Standard empty contact color
    justifyContent: "center", 
    alignItems: "center", 
  },
  avatarText: {
    color: T.white,
    fontSize: 60,
    fontWeight: "300",
  },
  
  scriptBox: {
    paddingHorizontal: 40,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    marginHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border
  },
  scriptHeaderRow: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    marginBottom: 10
  },
  scriptLabel: {
    color: T.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  scriptText: { 
    color: T.white, 
    textAlign: "center", 
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500",
    fontStyle: "italic"
  },
  
  bottomSection: { 
    paddingHorizontal: 60,
    marginBottom: 20
  },
  ringingControls: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  activeControls: { 
    flexDirection: "row", 
    justifyContent: "center" 
  },
  btnGroup: {
    alignItems: "center"
  },
  btn: { 
    width: 76, 
    height: 76, 
    borderRadius: 38, 
    justifyContent: "center", 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  btnLabel: {
    color: T.white,
    marginTop: 12,
    fontSize: 16,
    fontWeight: "400"
  },
  btnRed: { 
    backgroundColor: T.danger 
  },
  btnGreen: { 
    backgroundColor: T.safe 
  }
});