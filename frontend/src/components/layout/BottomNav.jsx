import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/globalStyles";

const TABS = [
  { id: "home",     icon: "home-outline",   iconActive: "home",    label: "Home"    },
  { id: "map",      icon: "map-outline",    iconActive: "map",     label: "Map"     },
  { id: "contacts", icon: "people-outline", iconActive: "people",  label: "Circle"  },
  { id: "settings", icon: "person-outline", iconActive: "person",  label: "Profile" },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <View style={s.nav}>
      {TABS.map((t) => {
        const active = activeTab === t.id;
        return (
          <TouchableOpacity key={t.id} style={s.item} onPress={() => onTabChange(t.id)} activeOpacity={0.7}>
            <View style={[s.iconWrap, active && s.iconWrapActive]}>
              <Ionicons name={active ? t.iconActive : t.icon} size={22} color={active ? COLORS.primary : COLORS.textDim} />
              {active && <View style={s.activeDot} />}
            </View>
            <Text style={[s.label, active && s.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  nav: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: 10, paddingBottom: 28,
    position: "absolute", bottom: 0, left: 0, right: 0,
  },
  item: { flex: 1, alignItems: "center", gap: 4 },
  iconWrap: {
    width: 44, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  iconWrapActive: { backgroundColor: "rgba(200,80,155,0.15)" },
  activeDot: {
    position: "absolute", bottom: 2, width: 4, height: 4,
    borderRadius: 2, backgroundColor: COLORS.primary,
  },
  label: { fontSize: 10, fontWeight: "600", color: COLORS.textDim, letterSpacing: 0.3 },
  labelActive: { color: COLORS.primary },
});