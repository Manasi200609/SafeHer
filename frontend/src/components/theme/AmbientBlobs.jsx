import React from 'react';
import { View } from 'react-native';

/**
 * AmbientBlobs Component
 * Creates glowing ambient blob background elements for the deep plum theme
 * These are decorative elements that add visual depth and warmth
 */
export const AmbientBlobs = () => {
  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
      <View className="ambient-blob blob-1" />
      <View className="ambient-blob blob-2" />
      <View className="ambient-blob blob-3" />
    </View>
  );
};

export default AmbientBlobs;
