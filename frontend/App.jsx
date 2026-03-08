import { StyleSheet, Dimensions } from "react-native";

export const { width: W, height: H } = Dimensions.get("window");

export const COLORS = {
  // Warm backgrounds — deep rose-brown, not cold black
  bg: "#1A0A0F",
  surface: "#2A1118",
  card: "#3A1820",
  cardLight: "#4A2030",
  border: "#6B3545",

  // Primary — rose gold
  primary: "#E8688A",
  primaryDark: "#C4426A",
  primaryLight: "#F2A8BC",
  primaryGlow: "#FF8FAD",

  // Warm accents
  gold: "#F4C97A",
  goldLight: "#FDE8B0",
  peach: "#F2856A",
  blush: "#F7C5CC",
  cream: "#FDF0EC",

  // Status (warm versions)
  safe: "#5ECFAA",
  medium: "#F4C97A",
  high: "#F2856A",
  critical: "#E8453A",

  // Text
  text: "#FDF0F0",
  textMuted: "#C9A0A8",
  textDim: "#8A5A62",

  overlay: "rgba(26,10,15,0.92)",
};

export const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  btnSecondary: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnSecondaryText: { color: COLORS.text, fontSize: 15, fontWeight: "500" },

  formLabel: {
    fontSize: 11, fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: "700",
    letterSpacing: 1.4,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 12,
  },
});