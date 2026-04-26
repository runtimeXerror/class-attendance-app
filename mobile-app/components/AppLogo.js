import { useRef, useEffect } from 'react';
import { Image, View, StyleSheet, Animated, Easing } from 'react-native';

/**
 * AppLogo — Class Attendance brand logo with built-in entrance animation.
 *
 * Props:
 *   size: pixel height (width auto). Default 48.
 *   style: extra style
 *   animate: if true (default), pulse/bounce-in on mount
 */
export default function AppLogo({ size = 48, style, animate = true }) {
  const scale = useRef(new Animated.Value(animate ? 0.3 : 1)).current;
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1, friction: 4, tension: 45, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { height: size, width: size, transform: [{ scale }], opacity },
        style,
      ]}
    >
      <Image
        source={require('../assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
