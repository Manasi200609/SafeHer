import { useRef, useEffect } from "react";
import { TouchableOpacity, Animated, StyleSheet } from "react-native";
import { COLORS } from "../../styles/globalStyles";

export default function Toggle({ on, onToggle }) {
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: on ? 1 : 0, duration: 240, useNativeDriver: false }).start();
  }, [on]);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 22] });
  const bgColor    = anim.interpolate({ inputRange: [0, 1], outputRange: [COLORS.border, COLORS.primary] });
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <Animated.View style={[s.track, { backgroundColor: bgColor }]}>
        <Animated.View style={[s.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  track: { width: 46, height: 26, borderRadius: 13, justifyContent: "center" },
  thumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 3,
  },
});