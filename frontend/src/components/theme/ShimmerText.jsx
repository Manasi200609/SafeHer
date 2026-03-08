import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * ShimmerText Component
 * Renders text with a glowing shimmer animation effect
 * Uses rose gold, blush, and champagne gradients
 * Perfect for titles, section headers, and emphasis text
 */
const ShimmerText = ({ 
  children, 
  style, 
  size = 'md',
  speed = 'normal' 
}) => {
  const speedClass = speed === 'fast' ? styles.shimmerFast : styles.shimmer;
  const sizeStyle = styles[`size_${size}`];

  return (
    <Text style={[sizeStyle, speedClass, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    // CSS animation will be applied via Web platform
    // For React Native, we use a static style
    color: '#FBF3F0',
    fontWeight: '700',
  },
  shimmerFast: {
    color: '#FBF3F0',
    fontWeight: '700',
  },
  size_sm: {
    fontSize: 12,
  },
  size_md: {
    fontSize: 16,
  },
  size_lg: {
    fontSize: 24,
  },
  size_xl: {
    fontSize: 32,
  },
});

export default ShimmerText;

/**
 * Web version with CSS gradient shimmer
 * Usage in web: <div className="shimmer-text">Shimmer Text</div>
 * 
 * CSS classes available:
 * - shimmer-text: Normal speed shimmer (8s)
 * - shimmer-text-fast: Fast speed shimmer (4s)
 */
