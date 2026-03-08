import React, { useState, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, 
  TextInput, Dimensions, ScrollView, StatusBar, Modal, Keyboard, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import MapView, { Marker, Circle } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { LinearGradient } from "expo-linear-gradient";
import { NEARBY_ALERTS, apiFetch } from "../constants/data";
import { useAuth } from "../context/AuthContext";

const { width: W, height: H } = Dimensions.get("window");

// ─── PREMIUM DESIGN TOKENS ──────────────────────────────────────────────────
const T = {
  bg: "#050103",
  plum: "#1A0514",
  card: "rgba(20, 5, 15, 0.85)", 
  border: "rgba(255, 255, 255, 0.12)",
  white: "#FFFFFF",
  muted: "#7A5568",
  coral: "#E8956D",
  accent: "#F3D8C7",
  safe: "#34D399",
  warning: "#FBBF24",
  danger: "#F43F5E",
};

const GMAPS = {
  bg: "#101010",
  surface: "#1F1F1F",
  text: "#E3E3E3",
  subtext: "#9AA0A6",
  icon: "#9AA0A6",
  divider: "#3C4043",
  blue: "#8AB4F8"
};

// ─── MOCK DATABASE WITH REAL PUNE COORDINATES ───────────────────────────────
const FALLBACK_PUNE_LOC = { latitude: 18.5204, longitude: 73.8567 };

const PUNE_PLACES = [
  { id: 101, title: "SGS Mall", sub: "231, Moledina Rd, Camp, Pune", coords: { latitude: 18.5173, longitude: 73.8776 } },
  { id: 102, title: "Sinhgad College of Engineering", sub: "Vadgaon Budruk, Pune", coords: { latitude: 18.4659, longitude: 73.8360 } },
  { id: 103, title: "Symbiosis Institute of Technology", sub: "Lavale, Pune", coords: { latitude: 18.5401, longitude: 73.7275 } },
  { id: 104, title: "Shreeram Corner", sub: "Barangani Road, Pune", coords: { latitude: 18.4900, longitude: 73.8200 } },
  { id: 105, title: "Shivajinagar Railway Station", sub: "Shivajinagar, Pune", coords: { latitude: 18.5314, longitude: 73.8446 } },
];

const RECENT_SEARCHES = [
  { id: 1, type: "location", title: "SGS Mall", sub: "231, Moledina Rd, Camp, Pune...", coords: { latitude: 18.5173, longitude: 73.8776 } },
  { id: 2, type: "history", title: "Defence Institute of Advanced Technolo...", sub: "", coords: { latitude: 18.4326, longitude: 73.7431 } },
  { id: 3, type: "history", title: "Shreeram Corner", sub: "Barangani Road, Dalve Wadi...", coords: { latitude: 18.4900, longitude: 73.8200 } },
  { id: 4, type: "history", title: "Sinhgad College of Engineering, Pune", sub: "Closed · Opens 9:00 am Mon", subColor: "#F28B82", coords: { latitude: 18.4659, longitude: 73.8360 } },
];

const mapStylePlum = [
  { elementType: "geometry", stylers: [{ color: "#1A0514" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7A5568" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#050103" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#320824" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#4A1535" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050103" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] }
];

export default function MapScreen({ onBack, onGoSettings }) {
  const { token } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [region, setRegion] = useState(null);
  const [destination, setDestination] = useState(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [destInput, setDestInput] = useState("");
  const [routeDetails, setRouteDetails] = useState(null);
  
  const GOOGLE_MAPS_API_KEY = ""; 
  const hasValidKey = GOOGLE_MAPS_API_KEY.length > 10;

  useEffect(() => {
    fetchStatus();
    
    let isMounted = true;
    (async () => {
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== "granted") throw new Error("Permission Denied");

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isMounted) {
          const currentLoc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCoords(currentLoc);
          setRegion({ ...currentLoc, latitudeDelta: 0.04, longitudeDelta: 0.04 });
        }
      } catch (e) {
        if (isMounted) {
          console.log("Using Fallback Pune GPS");
          setCoords(FALLBACK_PUNE_LOC);
          setRegion({ ...FALLBACK_PUNE_LOC, latitudeDelta: 0.04, longitudeDelta: 0.04 });
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const fetchStatus = async () => {
    if (!token) return;
    setLoading(true);
    const res = await apiFetch("/safety/status", "GET", null, token);
    if (res.success) setStatus({ score: res.score, status: res.status });
    setLoading(false);
  };

  const searchResults = destInput.trim() === "" 
    ? [] 
    : PUNE_PLACES.filter(p => 
        p.title.toLowerCase().includes(destInput.toLowerCase()) || 
        p.sub.toLowerCase().includes(destInput.toLowerCase())
      );

  const handleSelectDestination = (item) => {
    setIsSearching(false);
    Keyboard.dismiss();
    setDestInput(item.title);
    
    if (!coords) return;
    
    const destCoords = item.coords || {
      latitude: coords.latitude + 0.012,
      longitude: coords.longitude - 0.008,
    };
    
    setDestination(destCoords);
    
    const centerLat = (coords.latitude + destCoords.latitude) / 2;
    const centerLng = (coords.longitude + destCoords.longitude) / 2;
    
    const latDelta = Math.abs(coords.latitude - destCoords.latitude) * 1.8 + 0.01;
    const lngDelta = Math.abs(coords.longitude - destCoords.longitude) * 1.8 + 0.01;

    setRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    });
  };

  return (
    <View style={s.screen}>
      <StatusBar barStyle="light-content" />

      {coords ? (
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          customMapStyle={mapStylePlum}
        >
          {destination && (
            <Marker coordinate={destination} title="Destination">
              <View style={s.markerWrap}>
                <Ionicons name="location" size={32} color={T.coral} />
              </View>
            </Marker>
          )}

          {destination && hasValidKey && (
            <MapViewDirections
              origin={coords}
              destination={destination}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor={T.safe}
              optimizeWaypoints={true}
              onReady={(result) => {
                setRouteDetails({
                  distance: result.distance,
                  duration: result.duration
                });
              }}
            />
          )}
          
          <Circle center={{ latitude: coords.latitude + 0.005, longitude: coords.longitude + 0.002 }} radius={400} fillColor="rgba(244, 63, 94, 0.2)" strokeColor="rgba(244, 63, 94, 0.5)" strokeWidth={1} />
          <Circle center={{ latitude: coords.latitude - 0.003, longitude: coords.longitude - 0.004 }} radius={250} fillColor="rgba(251, 191, 36, 0.15)" strokeColor="rgba(251, 191, 36, 0.4)" strokeWidth={1} />
        </MapView>
      ) : (
        <View style={s.mapLoading}>
          <ActivityIndicator size="large" color={T.coral} />
          <Text style={s.loadingText}>Establishing GPS Uplink...</Text>
        </View>
      )}

      {!isSearching && (
        <>
          <View style={s.topOverlay} pointerEvents="box-none">
            <View style={s.navRow}>
              
              {/* ── LEFT NAV AREA (Width: 44px) ── */}
              <View style={{ width: 44 }}>
                <TouchableOpacity style={s.iconBtn} onPress={onBack}>
                  <Ionicons name="chevron-back" size={22} color={T.white} />
                </TouchableOpacity>
              </View>

              {/* ── CENTER TITLE & FLOATING LOGO ── */}
              <View style={s.headerCenter}>
                <View style={s.logoFrameAbsolute}>
                  <Image 
                    source={require("../assets/icon.png")} 
                    style={s.logoImg} 
                    resizeMode="cover" 
                  />
                </View>
                <Text style={s.headerTitle}>Area Intel</Text>
              </View>

              {/* ── RIGHT NAV AREA (Width: 44px) ── */}
              <View style={{ width: 44, alignItems: "flex-end" }}>
                <TouchableOpacity style={s.iconBtn} onPress={onGoSettings}>
                  <Ionicons name="options-outline" size={20} color={T.white} />
                </TouchableOpacity>
              </View>

            </View>

            <View style={s.floatingCard}>
              <TouchableOpacity style={s.searchWrap} activeOpacity={0.9} onPress={() => setIsSearching(true)}>
                <Ionicons name="search" size={18} color={T.muted} style={s.searchIcon} />
                <Text style={s.searchPlaceholder} numberOfLines={1}>
                  {destInput ? destInput : "Search destination..."}
                </Text>
              </TouchableOpacity>

              {status && (
                <View style={s.statusRow}>
                  <View style={s.statusContent}>
                    <View style={[s.statusDot, { backgroundColor: T[status.status?.toLowerCase()] || T.warning }]} />
                    <Text style={s.statusText}>
                      {status.status} RISK AREA · INDEX {Math.round(status.score * 100)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={fetchStatus}>
                    <Ionicons name="refresh" size={16} color={T.coral} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={s.bottomOverlay} pointerEvents="box-none">
            {routeDetails && (
              <View style={s.coordsPill}>
                <Ionicons name="navigate" size={14} color={T.safe} />
                <Text style={s.coordsText}>
                  Secure Route: {routeDetails.duration.toFixed(0)} min ({routeDetails.distance.toFixed(1)} km)
                </Text>
              </View>
            )}
            <Text style={s.sectionTitle}>NEARBY THREATS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.alertScroll} pointerEvents="auto">
              {NEARBY_ALERTS.map((a, i) => {
                const c = a.color === "#34D399" ? T.safe : a.color === "#FBBF24" ? T.warning : T.danger;
                return (
                  <View key={i} style={s.alertCard}>
                    <View style={[s.alertIconWrap, { backgroundColor: `${c}15` }]}>
                      <Ionicons name={c === T.safe ? "shield-checkmark" : "warning"} size={16} color={c} />
                    </View>
                    <View style={s.alertContent}>
                      <Text style={s.alertTitle} numberOfLines={1}>{a.title}</Text>
                      <Text style={s.alertDesc} numberOfLines={2}>{a.desc}</Text>
                      <Text style={s.alertTime}>{a.time}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}

      {/* ── GOOGLE MAPS EXACT SEARCH UI OVERLAY ── */}
      <Modal visible={isSearching} animationType="fade" transparent={true} onRequestClose={() => setIsSearching(false)}>
        <View style={gm.container}>
          
          <View style={gm.header}>
            <TouchableOpacity onPress={() => setIsSearching(false)} style={gm.backBtn}>
              <Ionicons name="arrow-back" size={24} color={GMAPS.text} />
            </TouchableOpacity>
            <TextInput
              style={gm.input}
              placeholder="Search here"
              placeholderTextColor={GMAPS.subtext}
              autoFocus={true}
              value={destInput}
              onChangeText={setDestInput}
              returnKeyType="search"
            />
            {destInput.length > 0 && (
              <TouchableOpacity onPress={() => setDestInput("")} style={gm.clearBtn}>
                <Ionicons name="close" size={20} color={GMAPS.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={gm.micBtn}>
              <Ionicons name="mic" size={20} color={GMAPS.blue} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {destInput.trim() === "" ? (
              <>
                <View style={gm.quickLinksRow}>
                  <TouchableOpacity style={gm.chip}>
                    <View style={gm.chipIconWrap}><Ionicons name="home" size={16} color={GMAPS.text} /></View>
                    <View><Text style={gm.chipTitle}>Home</Text><Text style={gm.chipSub}>Set location</Text></View>
                  </TouchableOpacity>
                  <TouchableOpacity style={gm.chip}>
                    <View style={gm.chipIconWrap}><Ionicons name="briefcase" size={16} color={GMAPS.text} /></View>
                    <View><Text style={gm.chipTitle}>Work</Text><Text style={gm.chipSub}>Set location</Text></View>
                  </TouchableOpacity>
                </View>
                <View style={gm.divider} />
                <View style={gm.recentHeaderRow}>
                  <Text style={gm.recentHeaderText}>Recent</Text>
                  <Ionicons name="information-circle-outline" size={18} color={GMAPS.icon} />
                </View>
                {RECENT_SEARCHES.map((item) => (
                  <TouchableOpacity key={`recent-${item.id}`} style={gm.listItem} onPress={() => handleSelectDestination(item)}>
                    <View style={gm.listIconCircle}>
                      <Ionicons name={item.type === "location" ? "location-outline" : "time-outline"} size={20} color={GMAPS.icon} />
                    </View>
                    <View style={gm.listTextWrap}>
                      <Text style={gm.listTitle} numberOfLines={1}>{item.title}</Text>
                      {item.sub ? <Text style={[gm.listSub, item.subColor && { color: item.subColor }]} numberOfLines={2}>{item.sub}</Text> : null}
                      <View style={gm.itemDivider} />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <TouchableOpacity key={`suggest-${item.id}`} style={gm.listItem} onPress={() => handleSelectDestination(item)}>
                      <View style={gm.listIconCircle}><Ionicons name="location-outline" size={20} color={GMAPS.icon} /></View>
                      <View style={gm.listTextWrap}>
                        <Text style={gm.listTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={gm.listSub} numberOfLines={1}>{item.sub}</Text>
                        <View style={gm.itemDivider} />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={gm.noResults}>
                    <Ionicons name="search-outline" size={40} color={GMAPS.divider} />
                    <Text style={gm.noResultsText}>No matching places found</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  mapLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  loadingText: { color: T.muted, marginTop: 15, fontWeight: "700", letterSpacing: 1 },
  markerWrap: { shadowColor: T.coral, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } },
  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, paddingTop: 60, paddingHorizontal: 20 },
  
  // ── NAV LAYOUT ──
  navRow: { 
    flexDirection: "row", 
    alignItems: "center", // <--- PERFECT HORIZONTAL ALIGNMENT
    justifyContent: "space-between", 
    marginBottom: 20,
    marginTop: 20 // Adjusts the row down slightly to make room for the floating logo
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(5, 1, 3, 0.5)", borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  
  // ── CENTERED HEADER STYLES ──
  headerCenter: { 
    alignItems: "center", 
    justifyContent: "center",
  },
  logoFrameAbsolute: { 
    position: "absolute", 
    top: -55, // <--- DETACHES LOGO AND FLOATS IT ABOVE THE TEXT
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
  
  floatingCard: { backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 24, padding: 16, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchIcon: { marginRight: 10 },
  searchPlaceholder: { flex: 1, color: T.white, fontSize: 15, fontWeight: "500" },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15, paddingHorizontal: 5 },
  statusContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: T.white, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  bottomOverlay: { position: "absolute", bottom: 40, left: 0, right: 0 },
  coordsPill: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(5,1,3,0.85)", borderWidth: 1, borderColor: T.border, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, marginBottom: 20 },
  coordsText: { color: T.white, fontSize: 12, fontWeight: "800" },
  sectionTitle: { color: T.white, fontSize: 11, fontWeight: "900", letterSpacing: 2, paddingHorizontal: 25, marginBottom: 15, textShadowColor: "#000", textShadowRadius: 10 },
  alertScroll: { paddingHorizontal: 20, gap: 12 },
  alertCard: { width: W * 0.75, backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 20, padding: 16, flexDirection: "row", gap: 12 },
  alertIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  alertContent: { flex: 1 },
  alertTitle: { color: T.white, fontSize: 14, fontWeight: "800", marginBottom: 4 },
  alertDesc: { color: T.muted, fontSize: 11, lineHeight: 16, marginBottom: 8 },
  alertTime: { color: T.accent, fontSize: 10, fontWeight: "700" },
});

const gm = StyleSheet.create({
  container: { flex: 1, backgroundColor: GMAPS.bg, paddingTop: 50 },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: GMAPS.surface, marginHorizontal: 16, borderRadius: 24, height: 48, paddingHorizontal: 12, marginBottom: 16 },
  backBtn: { padding: 4, marginRight: 8 },
  input: { flex: 1, color: GMAPS.text, fontSize: 16 },
  clearBtn: { padding: 6, marginRight: 4 },
  micBtn: { padding: 4 },
  quickLinksRow: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: GMAPS.surface, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, gap: 8 },
  chipIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#2B2B2B", alignItems: "center", justifyContent: "center" },
  chipTitle: { color: GMAPS.text, fontSize: 14, fontWeight: "500" },
  chipSub: { color: GMAPS.subtext, fontSize: 11 },
  divider: { height: 1, backgroundColor: GMAPS.divider, width: "100%" },
  recentHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  recentHeaderText: { color: GMAPS.text, fontSize: 14, fontWeight: "500" },
  listItem: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12 },
  listIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: GMAPS.surface, alignItems: "center", justifyContent: "center", marginRight: 16, marginTop: 4 },
  listTextWrap: { flex: 1 },
  listTitle: { color: GMAPS.text, fontSize: 16, marginBottom: 2 },
  listSub: { color: GMAPS.subtext, fontSize: 13, lineHeight: 18, paddingRight: 20 },
  itemDivider: { height: 1, backgroundColor: GMAPS.divider, marginTop: 12 },
  noResults: { alignItems: "center", justifyContent: "center", marginTop: 60, opacity: 0.5 },
  noResultsText: { color: GMAPS.text, marginTop: 16, fontSize: 15 }
});