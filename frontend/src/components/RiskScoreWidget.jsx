import React, { useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RiskScoreWidget({ score = 0, status = "SAFE" }) {
  
  // Dynamic UI based on the AI Status
  const getStatusUI = () => {
    switch (status) {
      case "CRITICAL":
        return { color: "#ef4444", icon: "warning", label: "CRITICAL RISK", glow: "rgba(239, 68, 68, 0.2)" };
      case "HIGH":
        return { color: "#f97316", icon: "alert-circle", label: "HIGH ALERT", glow: "rgba(249, 115, 22, 0.2)" };
      default:
        return { color: "#22c55e", icon: "shield-checkmark", label: "SAFE", glow: "rgba(34, 197, 94, 0.1)" };
    }
  };

  const ui = getStatusUI();
  // Convert score to percentage if your backend returns 0.0 to 1.0
  const displayScore = score <= 1 ? Math.round(score * 100) : score;

  return (
    <View style={[s.container, { borderColor: ui.color, backgroundColor: ui.glow }]}>
      <View style={s.header}>
        <Ionicons name={ui.icon} size={24} color={ui.color} />
        <Text style={[s.statusText, { color: ui.color }]}>{ui.label}</Text>
      </View>
      
      <View style={s.scoreRow}>
        <Text style={s.scoreLabel}>AI Risk Index:</Text>
        <Text style={[s.scoreValue, { color: ui.color }]}>{displayScore}%</Text>
      </View>
      
      <View style={s.progressBarBg}>
        <View style={[s.progressBarFill, { width: `${displayScore}%`, backgroundColor: ui.color }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 15,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 10,
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  scoreLabel: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "900",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});