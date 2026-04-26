import { Pressable, Animated, Text, StyleSheet, View } from 'react-native';
import { useRef } from 'react';
import { Radius, Shadow } from '../lib/theme';

export function AnimatedButton({ onPress, children, style, textStyle, color = '#6366F1', disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  // Split style: layout props (flex, width, margin) go on the outer Pressable
  // so this button plays nice inside flex-row containers; visual props
  // (background, padding, etc.) stay on the inner Animated.View.
  const flat = StyleSheet.flatten(style) || {};
  const outer = {};
  const inner = {};
  for (const k of Object.keys(flat)) {
    if (
      k === 'flex' || k === 'flexBasis' || k === 'flexGrow' || k === 'flexShrink' ||
      k === 'width' || k === 'minWidth' || k === 'maxWidth' ||
      k === 'margin' || k === 'marginTop' || k === 'marginBottom' ||
      k === 'marginLeft' || k === 'marginRight' || k === 'marginHorizontal' || k === 'marginVertical' ||
      k === 'alignSelf'
    ) {
      outer[k] = flat[k];
    } else {
      inner[k] = flat[k];
    }
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
      disabled={disabled}
      style={outer}
    >
      <Animated.View style={[
        styles.btn,
        // When outer uses flex, force inner to fill the whole flex slot —
        // this makes 4 buttons in a row become equal-width regardless of label length
        (outer.flex || outer.width) ? { width: '100%' } : null,
        { backgroundColor: color, transform: [{ scale }], opacity: disabled ? 0.6 : 1 },
        inner,
      ]}>
        {typeof children === 'string'
          ? <Text style={[styles.btnTxt, textStyle]} numberOfLines={1}>{children}</Text>
          : children}
      </Animated.View>
    </Pressable>
  );
}

export function AnimatedCard({ onPress, onLongPress, children, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  if (!onPress && !onLongPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14, paddingHorizontal: 24,
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  card: { borderRadius: Radius.lg, padding: 16, ...Shadow.sm },
});
