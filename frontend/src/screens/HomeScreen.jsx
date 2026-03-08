import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Vibration, Animated, PanResponder, Dimensions,
  Modal, ActivityIndicator, StatusBar, Image, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { generateSmartCall } from "../constants/data";
import { useAuth } from "../context/AuthContext";
import IncomingCallScreen from "./IncomingCallScreen";
import RiskScoreWidget from "../components/RiskScoreWidget";

const { width: W, height: H } = Dimensions.get("window");

const T = {
  bg:       "#050103", 
  plum:     "#1A0514", 
  plumCore: "#320824", 
  card:     "rgba(255, 255, 255, 0.04)",
  border:   "rgba(255, 255, 255, 0.08)",
  coral:    "#E8956D",
  accent:   "#F3D8C7", 
  white:    "#FFFFFF",
  muted:    "#7A5568",
  safe:     "#34D399",
  warning:  "#FBBF24",
  danger:   "#F43F5E",
};

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

export default function HomeScreen({ onShowModal, onGoMap, onGoContacts, onGoSettings }) {
  const { token, user } = useAuth();
  const [activeRecording, setActiveRecording] = useState(null);
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [isGeneratingCall, setIsGeneratingCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [aiScore, setAiScore] = useState(0.12);
  const [aiStatus, setAiStatus] = useState("SAFE");

  // ─── PROACTIVE GUARDIAN STATE ───
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const timerRef = useRef(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const slideMax = W - 60 - 110;

  const DEMO_FORCE_EMPTY_NETWORK = false; 

  const checkNetwork = () => {
    // Strictly check if they have added contacts to their network array
    const hasContacts = user?.contacts && user.contacts.length > 0;

    if (DEMO_FORCE_EMPTY_NETWORK || !hasContacts) {
      Vibration.vibrate([200, 200, 200]); // Error buzz
      Alert.alert(
        "Guardian Network Empty",
        "You must add at least one trusted contact to your network before dispatching an SOS.",
        [
          { text: "Add Contacts", onPress: onGoContacts },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return false; // Blocks the slide
    }
    return true; // Allows the slide
  };

  // ─── MONITOR RISK FOR PROACTIVE CHECK-IN ───
  useEffect(() => {
    if (aiScore >= 0.75 && !showCheckIn) {
      triggerCheckIn();
    }
  }, [aiScore]);

  const triggerCheckIn = () => {
    Vibration.vibrate([500, 200, 500]);
    setShowCheckIn(true);
    setCountdown(15);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const dismissCheckIn = () => {
    clearInterval(timerRef.current);
    setShowCheckIn(false);
    setAiScore(0.12);
    setAiStatus("SAFE");
  };

  const handleAutoSOS = () => {
    setShowCheckIn(false);
    if (!checkNetwork()) return; // Blocks automatic SOS if network is empty

    Vibration.vibrate(1000);
    if (onShowModal) onShowModal();
  };

  // ─── SOS SLIDER LOGIC ───
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => { if (g.dx > 0 && g.dx < slideMax) slideAnim.setValue(g.dx); },
    onPanResponderRelease: (_, g) => {
      if (g.dx > slideMax * 0.7) {
        
        // Block Manual SOS slide if no contacts are set
        if (!checkNetwork()) {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false }).start();
          return;
        }

        Vibration.vibrate(200);
        Animated.spring(slideAnim, { toValue: slideMax, useNativeDriver: false }).start();
        
        if (onShowModal) onShowModal(); 

        setTimeout(() => slideAnim.setValue(0), 1500);
      } else {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false }).start();
      }
    }
  })).current;

  const toggleStealthRecord = async () => {
    try {
      if (activeRecording) {
        await activeRecording.stopAndUnloadAsync();
        setActiveRecording(null); return;
      }
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
        (s) => {
          if (s.metering !== undefined && s.isRecording) {
            const norm = Math.min(1, Math.max(0, (s.metering + 60) / 50));
            setAiScore(norm);
            setAiStatus(norm > 0.75 ? "DANGER" : norm > 0.4 ? "WARNING" : "SAFE");
          }
        }, 100
      );
      setActiveRecording(recording);
    } catch (e) { console.error(e); }
  };

  const triggerFakeCall = async (ctx) => {
    setShowCallMenu(false);
    setIsGeneratingCall(true);
    
    try {
      const res = await generateSmartCall(ctx, token);
      setIsGeneratingCall(false);
      if (res && res.success) {
        setCallData({ audioUrl: res.audioUrl, script: res.script });
      } else {
        throw new Error("Backend Fail");
      }
    } catch (error) {
      console.log("Demo Fallback Activated");
      setIsGeneratingCall(false);
      setCallData({
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
        script: "Haan hello? May-nn tum-hah-ra live location track kar rahi hoon map pay..."
      });
    }
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.navRow}>
          <View style={s.brandGroup}>
            <View style={s.logoFrame}>
              <Image source={require("../assets/icon.png")} style={s.logoImg} resizeMode="cover" />
            </View>
            <View style={s.brandTextWrap}>
              <Text style={s.brandName}>SAFEHER</Text>
              <Text style={s.brandSub}>AI GUARDIAN SYSTEM</Text>
            </View>
          </View>
          
          <View style={s.navIcons}>
            <TouchableOpacity style={s.iconBtn} onPress={onGoMap}><Ionicons name="map-outline" size={18} color={T.muted} /></TouchableOpacity>
            <TouchableOpacity style={s.iconBtn} onPress={onGoSettings}><Ionicons name="settings-outline" size={18} color={T.muted} /></TouchableOpacity>
          </View>
        </View>
        
        <View style={s.headerContainer}>
          <View style={[s.statusPill, { borderColor: aiStatus === "DANGER" ? T.danger : aiStatus === "WARNING" ? T.warning : T.safe, backgroundColor: `${aiStatus === "DANGER" ? T.danger : T.safe}15` }]}>
            <View style={[s.statusDot, { backgroundColor: aiStatus === "DANGER" ? T.danger : T.safe }]} />
            <Text style={[s.statusText, { color: aiStatus === "DANGER" ? T.danger : T.safe }]}>AI MONITORING ACTIVE</Text>
          </View>
          <View style={s.scoreRow}>
            <Text style={s.scoreLabel}>RISK INDEX</Text>
            <Text style={[s.scoreValue, { color: aiStatus === "DANGER" ? T.danger : T.safe }]}>{Math.round(aiScore * 100)}%</Text>
          </View>
        </View>

        <View style={s.actionSection}>
          <Text style={s.sectionTitle}>PRIORITY SHIELD</Text>
          <TouchableOpacity onPress={toggleStealthRecord} style={s.cardTouch}>
            <LinearGradient colors={["rgba(232,149,109,0.15)", "rgba(255,255,255,0.03)"]} style={[s.cardBody, { borderColor: T.coral }]}>
               <View style={[s.iconCircle, { backgroundColor: `${T.accent}15` }]}><Ionicons name={activeRecording ? "stop-circle" : "mic-outline"} size={22} color={T.accent} /></View>
               <View style={s.cardContent}>
                 <Text style={[s.cardLabel, { color: T.accent }]}>{activeRecording ? "Recording Presence" : "Stealth Tripwire"}</Text>
                 <Text style={s.cardSub}>Continuous ambient AI analysis</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color={T.muted} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCallMenu(true)} style={s.cardTouch}>
            <LinearGradient colors={["rgba(232,149,109,0.15)", "rgba(255,255,255,0.03)"]} style={[s.cardBody, { borderColor: T.coral }]}>
               <View style={[s.iconCircle, { backgroundColor: `${T.coral}15` }]}><Ionicons name="call-outline" size={22} color={T.coral} /></View>
               <View style={s.cardContent}>
                 <Text style={[s.cardLabel, { color: T.coral }]}>Smart Cover Call</Text>
                 <Text style={s.cardSub}>Generate context-aware deterrent</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color={T.muted} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onGoContacts} style={s.cardTouch}>
            <View style={[s.cardBody, { borderColor: T.border, backgroundColor: T.card }]}>
               <View style={[s.iconCircle, { backgroundColor: `rgba(255,255,255,0.05)` }]}><Ionicons name="people-outline" size={22} color={T.white} /></View>
               <View style={s.cardContent}>
                 <Text style={[s.cardLabel, { color: T.white }]}>Guardian Network</Text>
                 <Text style={s.cardSub}>Notify your trusted circle</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color={T.muted} />
            </View>
          </TouchableOpacity>
        </View>

        <RiskScoreWidget score={aiScore} status={aiStatus} />

        <View style={s.sosTrack}>
          <Text style={s.sosHint}>SLIDE FOR EMERGENCY SOS</Text>
          <Animated.View style={[s.sosThumb, { transform: [{ translateX: slideAnim }] }]} {...panResponder.panHandlers}>
            <LinearGradient colors={["#F87171", T.danger, "#9f1239"]} style={s.sosGrad}>
              <Text style={s.sosText}>SOS</Text>
            </LinearGradient>
          </Animated.View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 1. AI SYNTHESIS LOADING */}
      {isGeneratingCall && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color={T.coral} />
          <Text style={s.overlayText}>Synthesizing AI Guardian Call...</Text>
        </View>
      )}

      {/* 2. CALL CONTEXT MENU */}
      <Modal visible={showCallMenu} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} onPress={() => setShowCallMenu(false)}>
          <View style={s.modalContent}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Choose Context</Text>
            <TouchableOpacity style={s.modalOpt} onPress={() => triggerFakeCall("IN_CAB")}><Text style={s.modalEmoji}>🚕</Text><Text style={s.modalOptText}>In a Cab / Auto</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalOpt} onPress={() => triggerFakeCall("WALKING")}><Text style={s.modalEmoji}>🚶‍♀️</Text><Text style={s.modalOptText}>Walking Alone</Text></TouchableOpacity>
            <TouchableOpacity style={s.modalOpt} onPress={() => triggerFakeCall("CROWDED_PLACE")}><Text style={s.modalEmoji}>🏙️</Text><Text style={s.modalOptText}>Crowded Place</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 3. PROACTIVE GUARDIAN CHECK-IN */}
      <Modal visible={showCheckIn} transparent animationType="fade">
        <View style={s.checkInOverlay}>
          <LinearGradient colors={["#1A0514", "#050103"]} style={s.checkInCard}>
            <View style={s.timerCircle}><Text style={s.timerNumber}>{countdown}</Text></View>
            <Text style={s.checkInTitle}>Guardian Check-in</Text>
            <Text style={s.checkInSub}>Risk level detected at {Math.round(aiScore * 100)}%. Are you safe?</Text>
            <TouchableOpacity style={s.safeBtn} onPress={dismissCheckIn}><Text style={s.safeBtnText}>YES, I AM SAFE</Text></TouchableOpacity>
            <Text style={s.sosWarning}>SOS will trigger automatically in {countdown}s</Text>
          </LinearGradient>
        </View>
      </Modal>

      {/* 4. ACTIVE INCOMING CALL */}
      {callData && (
        <IncomingCallScreen
          audioUrl={callData.audioUrl}
          script={callData.script}
          onHangUp={() => setCallData(null)}
        />
      )}

    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingHorizontal: 25, paddingTop: 50 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoFrame: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255, 255, 255, 0.02)", borderWidth: 1, borderColor: "rgba(232, 149, 109, 0.2)", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImg: { width: 46, height: 46, transform: [{ scale: 1.6 }] },
  brandTextWrap: { justifyContent: 'center' },
  brandName: { color: T.white, fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  brandSub: { color: T.muted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
  navIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: T.border, alignItems: 'center', justifyContent: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginBottom: 15 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreLabel: { color: T.muted, fontSize: 12, fontWeight: '700' },
  scoreValue: { fontSize: 18, fontWeight: '900' },
  actionSection: { marginBottom: 30 },
  sectionTitle: { color: T.muted, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 15 },
  cardTouch: { marginBottom: 12 },
  cardBody: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, height: 85, borderRadius: 24, borderWidth: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '700' },
  cardSub: { color: T.muted, fontSize: 11, marginTop: 2 },
  sosTrack: { height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)', justifyContent: 'center', padding: 5 },
  sosHint: { position: 'absolute', right: 40, color: 'rgba(244,63,94,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sosThumb: { width: 100, height: 52, borderRadius: 26, overflow: 'hidden' },
  sosGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sosText: { color: T.white, fontWeight: '900', fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,1,3,0.95)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  overlayText: { color: T.white, marginTop: 20, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#12040E', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50 },
  modalHandle: { width: 40, height: 4, backgroundColor: T.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: T.white, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  modalOpt: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, padding: 20, borderRadius: 15, marginBottom: 10 },
  modalEmoji: { fontSize: 24, marginRight: 15 },
  modalOptText: { color: T.white, fontSize: 16, fontWeight: '700' },
  checkInOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  checkInCard: { width: '100%', borderRadius: 32, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  timerCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: T.coral, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  timerNumber: { color: T.coral, fontSize: 32, fontWeight: '900' },
  checkInTitle: { color: T.white, fontSize: 22, fontWeight: '900', marginBottom: 10 },
  checkInSub: { color: T.muted, textAlign: 'center', fontSize: 14, marginBottom: 30 },
  safeBtn: { backgroundColor: T.coral, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20, width: '100%', alignItems: 'center' },
  safeBtnText: { color: T.plum, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  sosWarning: { color: T.danger, fontSize: 10, fontWeight: '800', marginTop: 20, letterSpacing: 1 },
});