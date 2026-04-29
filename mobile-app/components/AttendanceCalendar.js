import { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { Radius, Shadow } from '../lib/theme';
import { toLocalDateString } from '../lib/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const sameYMD = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function AttendanceCalendar({
  visible,
  onClose,
  selectedDate,
  markedDates = [],
  onPick,
  maxDate = new Date(),
}) {
  const { theme } = useTheme();

  const [viewMonth, setViewMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

  const today = new Date();

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list = [];
    for (let i = 0; i < firstDay; i++) list.push(null);
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(year, month, d));
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [viewMonth]);

  const goPrev = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNext = () => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    if (maxDate && next > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) return;
    setViewMonth(next);
  };

  const handlePick = (d) => {
    if (!d) return;
    if (maxDate && d > maxDate) return;
    onPick && onPick(d);
    onClose && onClose();
  };

  const markedCount = markedDates.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          {/* Header — month + nav */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goPrev} style={styles.navBtn} activeOpacity={0.6}>
              <Text style={[styles.navTxt, { color: theme.primary }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.monthTxt, { color: theme.text }]}>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={goNext} style={styles.navBtn} activeOpacity={0.6}>
              <Text style={[styles.navTxt, { color: theme.primary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday labels */}
          <View style={styles.weekRow}>
            {WEEK.map((w, i) => (
              <Text
                key={i}
                style={[styles.weekLbl, { color: theme.textMuted }]}
              >
                {w}
              </Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {cells.map((d, i) => {
              if (!d) return <View key={i} style={styles.cell} />;
              const dateStr = toLocalDateString(d);
              const isMarked = markedSet.has(dateStr);
              const isSelected = selectedDate && sameYMD(d, new Date(selectedDate));
              const isToday = sameYMD(d, today);
              const isDisabled = maxDate && d > maxDate;

              return (
                <TouchableOpacity
                  key={i}
                  style={styles.cell}
                  activeOpacity={0.6}
                  disabled={isDisabled}
                  onPress={() => handlePick(d)}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isMarked && {
                        backgroundColor: theme.primaryLight,
                      },
                      isSelected && {
                        backgroundColor: theme.primary,
                      },
                      isToday && !isSelected && {
                        borderWidth: 1.5,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayTxt,
                        { color: isDisabled ? theme.textMuted : theme.text },
                        isSelected && { color: '#fff', fontWeight: '800' },
                        isMarked && !isSelected && { color: theme.primary, fontWeight: '700' },
                      ]}
                    >
                      {d.getDate()}
                    </Text>
                    {isMarked && (
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isSelected ? '#fff' : theme.primary },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={[styles.legend, { borderTopColor: theme.border }]}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <View
                  style={[styles.legendInnerDot, { backgroundColor: theme.primary }]}
                />
              </View>
              <Text style={[styles.legendTxt, { color: theme.textSecondary }]}>
                Attendance marked ({markedCount})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
              <Text style={[styles.closeBtn, { color: theme.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 16,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  navTxt: { fontSize: 26, fontWeight: '700', lineHeight: 28 },
  monthTxt: { fontSize: 16, fontWeight: '800' },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekLbl: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayCircle: {
    width: '88%',
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTxt: { fontSize: 13, fontWeight: '600' },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  legendInnerDot: { width: 4, height: 4, borderRadius: 2 },
  legendTxt: { fontSize: 11, fontWeight: '600' },
  closeBtn: { fontSize: 13, fontWeight: '700' },
});
