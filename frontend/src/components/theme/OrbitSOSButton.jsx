import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../styles/globalStyles';

/**
 * OrbitSOSButton Component
 * Renders the SOS/Alert button with a decorative rotating orbit ring
 * Features:
 * - Glowing pulse animation
 * - Rotating orbit decoration with glowing dots
 * - Rose gold + blush color scheme
 * - Responsive touch feedback
 */
const OrbitSOSButton = ({ onPress, isActive = false }) => {
  return (
    <View style={styles.container}>
      {/* Outer rotating orbit ring */}
      <View style={[styles.orbit, styles.orbitOuter]} />
      
      {/* Middle orbit ring (slower rotation) */}
      <View style={[styles.orbit, styles.orbitMiddle]} />
      
      {/* Inner glowing orbiting dots */}
      <View style={styles.orbitDot1} />
      <View style={styles.orbitDot2} />
      
      {/* Main SOS button */}
      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Ionicons name="alert-circle-sharp" size={32} color="#FFFFFF" />
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbit: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 1.5,
  },
  orbitOuter: {
    width: 120,
    height: 120,
    borderColor: 'rgba(233, 155, 170, 0.3)',
    animation: 'orbitRotate 4s linear infinite',
  },
  orbitMiddle: {
    width: 95,
    height: 95,
    borderColor: 'rgba(245, 179, 195, 0.25)',
    animation: 'orbitRotate 6s linear infinite reverse',
  },
  orbitDot1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB3CA',
    top: 5,
    left: '50%',
    marginLeft: -4,
    boxShadow: '0 0 10px rgba(255, 179, 202, 0.8)',
    animation: 'orbitRotate 3s linear infinite',
  },
  orbitDot2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F5B3C3',
    bottom: 10,
    right: 10,
    boxShadow: '0 0 8px rgba(245, 179, 195, 0.6)',
    animation: 'orbitRotate 4s linear infinite reverse',
  },
  button: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  buttonActive: {
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
});

export default OrbitSOSButton;
