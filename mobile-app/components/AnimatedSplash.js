import { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Image } from 'react-native';

/**
 * AnimatedSplash — shown on top of app while it's initializing.
 * Features:
 *   • Logo pulses + rotates gently
 *   • "Class Attendance" title slides up + fades in
 *   • "RRSDCE Begusarai" subtitle fades in second
 *   • Animated 3-dot loader at bottom
 *   • Exits with fade-out when `onFinish` fires
 *
 * Props:
 *   minDuration: ms to stay on screen minimum (default 1800)
 *   onFinish: called after exit animation completes
 */
export default function AnimatedSplash({ minDuration = 1800, onFinish }) {
  const [hidden, setHidden] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Loading dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Logo entrance: scale up + fade in + subtle rotate
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40, friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1, duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0, duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Title: slide up + fade in (delayed)
    Animated.parallel([
      Animated.timing(titleY, {
        toValue: 0, duration: 600, delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1, duration: 600, delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtitle: fade in (more delayed)
    Animated.timing(subtitleOpacity, {
      toValue: 1, duration: 500, delay: 800,
      useNativeDriver: true,
    }).start();

    // Loading dots: sequential pulse loop
    const pulse = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1, duration: 400, delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.3, duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    pulse(dot1, 0).start();
    pulse(dot2, 200).start();
    pulse(dot3, 400).start();

    // Schedule exit
    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0, duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setHidden(true);
        onFinish && onFinish();
      });
    }, minDuration);

    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '8deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity: containerOpacity }]}
    >
      {/* Decorative background circles */}
      <View style={[styles.bgCircle, styles.circle1]} />
      <View style={[styles.bgCircle, styles.circle2]} />
      <View style={[styles.bgCircle, styles.circle3]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }, { rotate }],
          },
        ]}
      >
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        Class Attendance
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        RRSDCE Begusarai
      </Animated.Text>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: subtitleOpacity }]}>
        v1.2.0 • Developed by Vishal Kumar
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  circle1: {
    width: 320, height: 320,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    top: -80, right: -80,
  },
  circle2: {
    width: 240, height: 240,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
    bottom: -60, left: -60,
  },
  circle3: {
    width: 140, height: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    top: '40%', left: -40,
  },
  logoWrap: {
    width: 140, height: 140,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 100, height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
    letterSpacing: 0.5,
    marginBottom: 36,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
