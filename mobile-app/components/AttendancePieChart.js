import { useState, useRef } from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

function polarXY(cx, cy, r, angle) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function arcPath(cx, cy, outerR, innerR, start, end) {
  const o1 = polarXY(cx, cy, outerR, start);
  const o2 = polarXY(cx, cy, outerR, end);
  const i1 = polarXY(cx, cy, innerR, end);
  const i2 = polarXY(cx, cy, innerR, start);
  const large = end - start > Math.PI ? 1 : 0;
  return `M${o1.x} ${o1.y} A${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L${i1.x} ${i1.y} A${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y} Z`;
}

export default function AttendancePieChart({
  present = 0, absent = 0, size = 220,
  presentColor = '#10B981', absentColor = '#EF4444',
  textColor = '#1F2937', bgColor = '#FFFFFF',
}) {
  const total = present + absent;
  const cx = size / 2, cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.54;
  const GAP = 0.05;
  const START = -Math.PI / 2;
  const pAngle = total > 0 ? (present / total) * 2 * Math.PI : 0;

  const segments = [
    {
      key: 'present', label: 'Present', value: present, color: presentColor,
      start: START + GAP, end: START + Math.max(pAngle - GAP, GAP + 0.01),
    },
    {
      key: 'absent', label: 'Absent', value: absent, color: absentColor,
      start: START + pAngle + GAP, end: START + 2 * Math.PI - GAP,
    },
  ];

  const lifts = useRef(segments.map(() => new Animated.Value(0))).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;
  const tipScale = useRef(new Animated.Value(0.8)).current;
  const [activeIdx, setActiveIdx] = useState(null);
  const [tip, setTip] = useState({ label: '', count: 0, pct: 0, color: '' });

  const show = (idx) => {
    const seg = segments[idx];
    const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
    setActiveIdx(idx);
    setTip({ label: seg.label, count: seg.value, pct, color: seg.color });
    Animated.parallel([
      Animated.spring(lifts[idx], { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 4 }),
      Animated.timing(tipOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(tipScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const hide = (idx) => {
    Animated.parallel([
      Animated.spring(lifts[idx], { toValue: 0, useNativeDriver: true, speed: 25 }),
      Animated.timing(tipOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(tipScale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
    ]).start(() => setActiveIdx(null));
  };

  const panResponders = segments.map((_, idx) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => show(idx),
      onPanResponderRelease: () => hide(idx),
      onPanResponderTerminate: () => hide(idx),
    })
  );

  const LIFT_PX = 10;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size}>
          {segments.map((seg, idx) => {
            if (seg.value === 0 || seg.end <= seg.start) return null;
            const midAngle = (seg.start + seg.end) / 2;
            const tx = Math.cos(midAngle) * LIFT_PX;
            const ty = Math.sin(midAngle) * LIFT_PX;
            const AnimPath = Animated.createAnimatedComponent(Path);
            return (
              <AnimPath
                key={seg.key}
                d={arcPath(cx, cy, outerR, innerR, seg.start, seg.end)}
                fill={seg.color}
                translateX={lifts[idx].interpolate({ inputRange: [0, 1], outputRange: [0, tx] })}
                translateY={lifts[idx].interpolate({ inputRange: [0, 1], outputRange: [0, ty] })}
                {...panResponders[idx].panHandlers}
              />
            );
          })}
          <Circle cx={cx} cy={cy} r={innerR - 3} fill={bgColor} />
        </Svg>

        {/* Center label */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: size * 0.115, fontWeight: '800', color: activeIdx !== null ? segments[activeIdx].color : textColor }}>
            {activeIdx !== null
              ? `${tip.pct}%`
              : `${total > 0 ? Math.round((present / total) * 100) : 0}%`}
          </Text>
          <Text style={{ fontSize: size * 0.062, color: '#6B7280', marginTop: 2 }}>
            {activeIdx !== null ? tip.label : 'Present'}
          </Text>
          {activeIdx !== null && (
            <Text style={{ fontSize: size * 0.058, color: segments[activeIdx].color, fontWeight: '700', marginTop: 1 }}>
              {tip.count} / {total}
            </Text>
          )}
        </View>
      </View>

      {/* Tooltip popup */}
      <Animated.View
        pointerEvents="none"
        style={{
          opacity: tipOpacity,
          transform: [{ scale: tipScale }],
          marginTop: 4,
          backgroundColor: tip.color || presentColor,
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: 12,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 8,
          minWidth: 180,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>
          {tip.label}: {tip.count} classes
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 2 }}>
          {tip.pct}% of total {total} classes
        </Text>
      </Animated.View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
        {segments.map((seg) => (
          <View key={seg.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: seg.color }} />
            <Text style={{ color: textColor, fontSize: 13, fontWeight: '600' }}>
              {seg.label} {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}