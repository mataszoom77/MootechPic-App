// components/LogoLoader.js
import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";
import Logo from "../Reusable/Logo"; // adjust path if needed

// Wrap your SVG Logo in an Animated component
const AnimatedLogo = Animated.createAnimatedComponent(Logo);

const LogoLoader = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Loop a pulse animation between 0.9 → 1.1
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale]);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <AnimatedLogo width={94} height={52} />
    </Animated.View>
  );
};

export default LogoLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
