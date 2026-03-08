import { StyleSheet, Dimensions } from "react-native";

export const { width: W, height: H } = Dimensions.get("window");

export const COLORS = {
  // ──────────────────────────────────────────────────────────────
  // DEEP PLUM + ROSE GOLD + BLUSH + CHAMPAGNE THEME
  // Dark berry background with warm feminine accents
  // ──────────────────────────────────────────────────────────────
  
  // ── Primary Backgrounds (Deep Plum Berry) ──────────────────────
  bg:        "#1A0B1E",      // Deep plum background (almost black-purple)
  surface:   "#2D1438",      // Rich plum surface
  card:      "#3D1D4A",      // Plum card background
  cardLight: "#4D2560",      // Lighter plum for interactive elements
  border:    "#9D5A9A",      // Soft mauve-plum border

  // ── Primary — Rose Gold & Blush ────────────────────────────────
  primary:       "#E89BAA",  // Rose gold primary
  primaryDark:   "#D67B8F",  // Deep rose
  primaryLight:  "#F5B3C3",  // Soft blush pink
  primaryGlow:   "#FFB3CA",  // Glowing blush
  roseGold:      "#D4A373",  // Rose gold accent
  blush:         "#F5B3C3",  // Blush pink

  // ── Warm Accents — Champagne & Gold ─────────────────────────
  white:        "#FFFFFF",
  cream:        "#FDF7F3",   // Warm champagne cream
  champagne:    "#F5E6D3",   // Champagne tone
  gold:         "#E6C5A8",   // Soft warm gold
  silver:       "#F0D4DD",   // Rose-silver shimmer
  mist:         "#FBF3F0",   // Very light blush mist

  // ── Accent Colors (Warm Feminine) ─────────────────────────────
  purple:       "#D4A373",   // Champagne gold
  purpleLight:  "#F5D5B8",   // Light champagne
  violet:       "#E89BAA",   // Warm rose
  peach:        "#F2A896",   // Soft peach accent

  // ── Status (Warm Palette) ─────────────────────────────────────
  safe:         "#7FD9B5",   // Soft sage green
  medium:       "#E6C5A8",   // Champagne gold
  high:         "#F2A896",   // Warm peach
  critical:     "#E8453A",   // Rose red

  // ── Text (Warm & Luminous) ────────────────────────────────────
  text:         "#FBF3F0",   // Warm white text
  textMuted:    "#D4A9AC",   // Muted rose text
  textDim:      "#9B7078",   // Dimmed plum text

  // ── Glass & Shimmer Effects ──────────────────────────────────
  glassLight:   "rgba(245, 227, 235, 0.08)",  // Glass effect light
  glassMid:     "rgba(217, 154, 170, 0.06)",  // Glass effect mid
  shimmer:      "rgba(255, 255, 255, 0.25)",  // Shimmer overlay

  // ── Overlays (Plum-based) ─────────────────────────────────────
  overlay:      "rgba(26, 11, 30, 0.92)",
  overlayLight: "rgba(61, 29, 74, 0.85)",
};

export const shared = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnSecondaryText: {
    color: COLORS.silver,
    fontSize: 15,
    fontWeight: "500",
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 12,
  },
});