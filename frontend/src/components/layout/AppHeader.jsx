import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles/globalStyles";

export default function AppHeader({
  title,
  showBack = false,
  onBack,
  rightIconName,
  onPressRight,
}) {
  return (
    <View style={s.container}>
      <View style={s.leftRow}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            style={s.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.cream} />
          </TouchableOpacity>
        )}

        {/* Logo placeholder – swap with Image when asset is ready */}
        <View style={s.logoPill}>
          <Text style={s.logoText}>SafeHer</Text>
        </View>

        {title ? <Text style={s.title}>{title}</Text> : null}
      </View>

      {rightIconName && (
        <TouchableOpacity
          onPress={onPressRight}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={s.rightBtn}
        >
          <Ionicons name={rightIconName} size={20} color={COLORS.cream} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  logoPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#24163F",
    borderWidth: 1,
    borderColor: "rgba(200,80,155,0.6)",
  },
  logoText: {
    color: COLORS.cream,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  rightBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
});

