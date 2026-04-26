import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * ScreenFadeIn — wraps content in fade + slide animation on mount.
 * Use inside any screen as the outermost child.
 *
 * Props:
 *   children: content
 *   direction: 'down' | 'up' | 'right' | 'left' | 'none' — slide direction
 *     'right' = enters sliding IN from RIGHT (default) — matches right→left open feel
 *   duration: ms (default 420)
 *   delay: ms (default 0)
 */
export default function ScreenFadeIn({
  children, direction = 'right', duration = 420, delay = 0, style,
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  // Initial offset based on direction
  const initialOffset =
    direction === 'none' ? 0
    : direction === 'up' ? 20
    : direction === 'down' ? -20
    : direction === 'right' ? 40   // starts off-screen right, slides left to position
    : direction === 'left' ? -40
    : 0;

  const offset = useRef(new Animated.Value(initialOffset)).current;

  const useX = direction === 'right' || direction === 'left';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration, delay, useNativeDriver: true,
      }),
      Animated.timing(offset, {
        toValue: 0, duration, delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [useX ? { translateX: offset } : { translateY: offset }],
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

