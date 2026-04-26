import { Pressable, Animated, Text, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { Radius, Shadow } from '../lib/theme';

/**
 * ActionButton — purpose-built button for equal-width grid/row layouts.
 *
 * Unlike AnimatedButton, this:
 *  - ALWAYS expands to fill its container (works perfectly inside flex rows)
 *  - Has minimal default padding so 3-4 buttons fit in a row on small screens
 *  - Uses `numberOfLines={1}` + `adjustsFontSizeToFit` so labels never crop
 *
 * Usage:
 *   <View style={{ flexDirection: 'row', gap: 6 }}>
 *     <ActionButton label="Mark" color="#6366F1" onPress={...} />
 *     <ActionButton label="Dashboard" color="#EC4899" onPress={...} />
 *   </View>
 */
export default function ActionButton({
  label,
  onPress,
  color = '#6366F1',
  textColor = '#fff',
  disabled = false,
  size = 'md',   // 'sm' | 'md' | 'lg'
  icon = null,   // optional ReactNode (e.g. <Icon name="check" />)
  style,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const sizeStyles = {
    sm: { paddingVertical: 8,  fontSize: 11, gap: 4 },
    md: { paddingVertical: 11, fontSize: 13, gap: 6 },
    lg: { paddingVertical: 14, fontSize: 15, gap: 8 },
  };
  const ss = sizeStyles[size] || sizeStyles.md;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
      style={[styles.outer, style]}
    >
      <Animated.View style={[
        styles.inner,
        {
          backgroundColor: color,
          paddingVertical: ss.paddingVertical,
          gap: ss.gap,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale }],
        },
      ]}>
        {icon}
        <Text
          style={[styles.label, { color: textColor, fontSize: ss.fontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    minWidth: 0,    // allow shrinking inside flex rows
  },
  inner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: Radius.md,
    ...Shadow.sm,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
