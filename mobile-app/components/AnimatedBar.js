import { useRef, useState } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';

export default function AnimatedBar({ label, value, total, color, trackColor, textColor }) {
  const pct = total > 0 ? value / total : 0;
  const pctInt = Math.round(pct * 100);
  const liftY = useRef(new Animated.Value(0)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  const scaleY = useRef(new Animated.Value(1)).current;
  const [show, setShow] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setShow(true);
      Animated.parallel([
        Animated.spring(scaleY, { toValue: 1.4, useNativeDriver: true, speed: 28 }),
        Animated.timing(tipOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(liftY, { toValue: -6, useNativeDriver: true, speed: 20 }),
      ]).start();
    },
    onPanResponderRelease: () => {
      Animated.parallel([
        Animated.spring(scaleY, { toValue: 1, useNativeDriver: true, speed: 28 }),
        Animated.timing(tipOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.spring(liftY, { toValue: 0, useNativeDriver: true, speed: 20 }),
      ]).start(() => setShow(false));
    },
    onPanResponderTerminate: () => {
      Animated.parallel([
        Animated.spring(scaleY, { toValue: 1, useNativeDriver: true, speed: 28 }),
        Animated.timing(tipOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.spring(liftY, { toValue: 0, useNativeDriver: true, speed: 20 }),
      ]).start(() => setShow(false));
    },
  });

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: textColor }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color }}>{value} / {total} ({pctInt}%)</Text>
      </View>

      <View style={{ position: 'relative', height: 40, justifyContent: 'center' }}>
        {/* Tooltip */}
        {show && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 28,
              left: `${Math.min(Math.max(pctInt - 15, 0), 65)}%`,
              opacity: tipOpacity,
              transform: [{ translateY: liftY }],
              zIndex: 20,
              backgroundColor: color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9,
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
              {label}: {value} classes ({pctInt}%)
            </Text>
          </Animated.View>
        )}

        {/* Bar */}
        <View
          style={{ height: 18, borderRadius: 9, backgroundColor: trackColor, overflow: 'visible' }}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={{
              height: '100%',
              width: `${pctInt}%`,
              borderRadius: 9,
              backgroundColor: color,
              transform: [{ scaleY }],
            }}
          />
        </View>
      </View>
    </View>
  );
}