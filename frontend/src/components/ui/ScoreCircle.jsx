import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "../../styles/globalStyles";

export default function ScoreCircle({ score, status }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const colorMap = {
    SAFE: COLORS.safe,
    MEDIUM: COLORS.medium,
    HIGH: COLORS.high,
    CRITICAL: COLORS.critical,
  };
  const color = colorMap[status] || COLORS.safe;

  return (
    <View style={styles.wrap}>
      <Svg width={110} height={110} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx="55" cy="55" r={r} fill="none" stroke={COLORS.border} strokeWidth={6} />
        <Circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </Svg>
      <Text style={[styles.number, { color }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    position: "absolute",
    fontSize: 28,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
});