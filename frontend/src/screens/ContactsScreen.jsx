import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, 
  TextInput, Modal, Dimensions, ScrollView, StatusBar, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { apiFetch } from "../constants/data";
import { useAuth } from "../context/AuthContext";

const { width: W, height: H } = Dimensions.get("window");

// ─── PREMIUM DESIGN TOKENS (Matched to Home) ──────────────────────────────────
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

const BRAND_COLORS = [T.coral, T.accent, T.muted, T.white];

// ─── GEOMETRIC AURA BACKGROUND ────────────────────────────────────────────────
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

export default function ContactsScreen({ onBack, onGoSettings }) {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [showAdd, setShowAdd]  = useState(false);
  const [form, setForm]     = useState({ name: "", phone: "", role: "" });

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const res = await apiFetch("/contacts", "GET", null, token);
    if (res.success) setContacts(res.contacts || []);
    setLoading(false);
  };

  const addContact = async () => {
    if (!form.name.trim())  return Alert.alert("Missing", "Please enter a name.");
    if (!form.phone.trim()) return Alert.alert("Missing", "Please enter a phone number.");
    const res = await apiFetch("/contacts", "POST", form, token);
    if (res.success) {
      setContacts((c) => [...c, res.contact]);
      setShowAdd(false);
      setForm({ name: "", phone: "", role: "" });
    } else Alert.alert("Error", res.message);
  };

  const removeContact = (id, name) => {
    Alert.alert("Remove Guardian", `Remove ${name} from your network?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        const res = await apiFetch("/contacts/" + id, "DELETE", null, token);
        if (res.success) setContacts((c) => c.filter((x) => x._id !== id && x.contactId !== id));
      }},
    ]);
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" />
      <GeoBg />

      {/* ── CUSTOM HEADER ── */}
      <View style={s.header}>
        {/* ── LEFT NAV AREA (Width: 44px) ── */}
        <View style={{ width: 44 }}>
          <TouchableOpacity style={s.iconBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color={T.white} />
          </TouchableOpacity>
        </View>
        
        {/* ── CENTER LOGO & TITLE ── */}
        <View style={s.headerCenter}>
          <View style={s.logoFrameAbsolute}>
            <Image 
              source={require("../assets/icon.png")} 
              style={s.logoImg} 
              resizeMode="cover" 
            />
          </View>
          <Text style={s.headerTitle}>Guardians</Text>
        </View>

        {/* ── RIGHT NAV AREA (Width: 44px) ── */}
        <View style={{ width: 44, alignItems: "flex-end" }}>
          <TouchableOpacity style={s.iconBtn} onPress={onGoSettings}>
            <Ionicons name="settings-outline" size={20} color={T.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Notice & Add Button */}
        <View style={s.actionRow}>
          <View style={s.notice}>
            <Ionicons name="shield-checkmark" size={14} color={T.safe} />
            <Text style={s.noticeText}>Auto-alerts on CRITICAL risk</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={16} color={T.bg} />
            <Text style={s.addBtnText}>ADD</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionTitle}>TRUSTED CONTACTS ({contacts.length}/10)</Text>

        {loading ? (
          <ActivityIndicator color={T.coral} size="large" style={{ marginTop: 40 }} />
        ) : contacts.length === 0 ? (
          <TouchableOpacity style={s.emptyCard} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="people-outline" size={32} color={T.coral} />
            </View>
            <Text style={s.emptyTitle}>Network Offline</Text>
            <Text style={s.emptySub}>Add up to 10 guardians to receive live tracking and SOS dispatches.</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.list}>
            {contacts.map((c, i) => {
              const avatarColor = BRAND_COLORS[i % BRAND_COLORS.length];
              return (
                <View key={c._id || c.contactId || i} style={s.card}>
                  <View style={[s.avatar, { backgroundColor: `${avatarColor}15`, borderColor: `${avatarColor}40` }]}>
                    <Text style={[s.avatarText, { color: avatarColor }]}>
                      {c.initials || c.name?.[0] || "?"}
                    </Text>
                  </View>
                  <View style={s.cardContent}>
                    <Text style={s.name} numberOfLines={1}>{c.name}</Text>
                    <Text style={s.role} numberOfLines={1}>{c.role || "Guardian"}</Text>
                  </View>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => removeContact(c._id || c.contactId, c.name)}>
                    <Ionicons name="close" size={18} color={T.muted} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── ADD GUARDIAN MODAL ── */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <View style={s.modalContent}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Authorize Guardian</Text>
            <Text style={s.modalSub}>This contact will receive emergency SMS alerts.</Text>

            {[
              { label: "FULL NAME", key: "name", placeholder: "e.g. Aanya Sharma", kb: "default" },
              { label: "PHONE NUMBER", key: "phone", placeholder: "+91 00000 00000", kb: "phone-pad" },
              { label: "RELATIONSHIP", key: "role", placeholder: "e.g. Sister, Friend", kb: "default" },
            ].map((f) => (
              <View key={f.key} style={s.inputGroup}>
                <Text style={s.inputLabel}>{f.label}</Text>
                <TextInput
                  style={s.inputField}
                  placeholder={f.placeholder}
                  placeholderTextColor={T.muted}
                  keyboardType={f.kb}
                  value={form[f.key]}
                  onChangeText={set(f.key)}
                  autoCorrect={false}
                />
              </View>
            ))}

            <TouchableOpacity style={s.primaryBtn} onPress={addContact} activeOpacity={0.8}>
              <LinearGradient
                colors={["rgba(232,149,109,0.9)", "rgba(232,149,109,0.7)"]}
                style={s.primaryBtnGrad}
              >
                <Text style={s.primaryBtnText}>Add to Network</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: { paddingHorizontal: 25 },

  // ── HEADER STYLES ──
  header: { 
    flexDirection: "row", 
    alignItems: "center", // Perfect horizontal alignment with the buttons
    justifyContent: "space-between", 
    paddingHorizontal: 25, 
    paddingTop: 60, 
    paddingBottom: 20,
    marginTop: 20 // Adjusts the row down slightly to make room for the floating logo
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(5, 1, 3, 0.5)", borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  
  // ── CENTERED LOGO STYLES ──
  headerCenter: { 
    alignItems: "center", 
    justifyContent: "center",
  },
  logoFrameAbsolute: { 
    position: "absolute", 
    top: -55, // Detaches logo and floats it right above the text
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
  headerTitle: { color: T.white, fontSize: 20, fontWeight: "900", letterSpacing: 1 },

  actionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30 },
  notice: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(52,211,153,0.1)", borderWidth: 1, borderColor: "rgba(52,211,153,0.2)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, flex: 1, marginRight: 15 },
  noticeText: { color: T.safe, fontSize: 11, fontWeight: "700" },
  
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: T.accent, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText: { color: T.bg, fontSize: 12, fontWeight: "900", letterSpacing: 1 },

  sectionTitle: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 15 },

  list: { gap: 12 },
  card: { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center", height: 80 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center", marginRight: 15 },
  avatarText: { fontSize: 16, fontWeight: "800" },
  cardContent: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: T.white, marginBottom: 2 },
  role: { fontSize: 11, color: T.muted },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", justifyContent: "center" },

  emptyCard: { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 24, padding: 30, alignItems: "center", marginTop: 10 },
  emptyIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(232,149,109,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: T.white },
  emptySub: { fontSize: 12, color: T.muted, marginTop: 8, textAlign: "center", lineHeight: 18 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#12040E", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 50, borderWidth: 1, borderColor: T.border },
  modalHandle: { width: 40, height: 4, backgroundColor: T.border, alignSelf: "center", marginBottom: 25 },
  modalTitle: { color: T.white, fontSize: 22, fontWeight: "900", marginBottom: 5 },
  modalSub: { fontSize: 13, color: T.muted, marginBottom: 25 },
  
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: T.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginBottom: 8 },
  inputField: { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 16, paddingHorizontal: 16, height: 55, color: T.white, fontSize: 15, fontWeight: "500" },
  
  primaryBtn: { marginTop: 10 },
  primaryBtnGrad: { height: 55, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { color: T.bg, fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});