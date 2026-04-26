import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  Modal, Pressable, Animated, ScrollView, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api, toLocalDateString } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import Icon from '../../components/Icon';
import { AnimatedButton } from '../../components/Animated';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function MarkAttendance() {
  const { theme } = useTheme();
  const { subjectId, subjectName, subjectCode, editDate } = useLocalSearchParams();
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  // Date is now stateful — user can pick any past date for back-date marking
  const [selectedDate, setSelectedDate] = useState(editDate ? new Date(editDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isEditMode = !!editDate;

  // Keep "today" as alias for backward compat with rest of file
  const today = selectedDate;

  // Reload existing attendance whenever the picked date changes
  const loadForDate = async (date) => {
    try {
      const initial = {};
      students.forEach(s => { initial[s.id] = 'P'; });
      const dateStr = toLocalDateString(date);
      const existing = await api.get(`/api/teacher/attendance/${subjectId}?class_date=${dateStr}`);
      if (existing.data.length > 0) {
        const map = { ...initial };
        existing.data.forEach(r => { map[r.student_id] = r.status; });
        setMarks(map);
      } else {
        setMarks(initial);
      }
    } catch (_) {}
  };

  const onDateChange = (event, picked) => {
    setShowDatePicker(false);
    if (event?.type === 'set' && picked) {
      setSelectedDate(picked);
      loadForDate(picked);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/teacher/subjects/${subjectId}/students`);
        setStudents(res.data);
        const initial = {};
        res.data.forEach(s => { initial[s.id] = 'P'; });
        setMarks(initial);

        const dateStr = toLocalDateString(today);
        const existing = await api.get(`/api/teacher/attendance/${subjectId}?class_date=${dateStr}`);
        if (existing.data.length > 0) {
          const map = { ...initial };
          existing.data.forEach(r => { map[r.student_id] = r.status; });
          setMarks(map);
        }
      } catch (e) {
        Alert.alert('Error', e.response?.data?.detail || e.message);
      }
    })();
  }, []);

  const toggle = (id) => setMarks(prev => ({ ...prev, [id]: prev[id] === 'P' ? 'A' : 'P' }));

  // Toast state for "All Present"/"All Absent" visual feedback
  const [toast, setToast] = useState(null); // { text, color } | null
  const toastAnim = useState(() => new Animated.Value(0))[0];
  const flashToast = (text, color) => {
    setToast({ text, color });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  const markAllPresent = () => {
    const all = {};
    students.forEach(s => { all[s.id] = 'P'; });
    setMarks(all);
    flashToast(`✅  All ${students.length} marked Present`, theme.success);
  };

  const markAllAbsent = () => {
    const all = {};
    students.forEach(s => { all[s.id] = 'A'; });
    setMarks(all);
    flashToast(`❌  All ${students.length} marked Absent`, theme.danger);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const marksList = students.map(s => ({ student_id: s.id, status: marks[s.id] || 'A' }));
      // Use /edit endpoint when in back-date edit mode (replaces existing records)
      const endpoint = isEditMode ? '/api/teacher/attendance/edit' : '/api/teacher/attendance/mark';
      await api.post(endpoint, {
        subject_id: parseInt(subjectId),
        class_date: toLocalDateString(today),
        marks: marksList,
      });
      const p = marksList.filter(m => m.status === 'P').length;
      setSuccess({ present: p, absent: marksList.length - p, total: marksList.length });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const typeLabel = (type) => {
    if (type === 'back_year') return 'Back';
    if (type === 'lateral_entry') return 'LE';
    return 'Regular';
  };
  const typeColor = (type) => {
    if (type === 'back_year') return { bg: theme.warningLight, color: theme.warning };
    if (type === 'lateral_entry') return { bg: theme.infoLight, color: theme.info };
    return { bg: theme.successLight, color: theme.success };
  };

  const presentCount = Object.values(marks).filter(v => v === 'P').length;
  const absentCount = students.length - presentCount;

  const formatDate = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Mark Attendance" />

      {/* Toast — animated feedback for All Present / All Absent */}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              backgroundColor: toast.color,
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }),
              }],
            },
          ]}
        >
          <Text style={styles.toastTxt}>{toast.text}</Text>
        </Animated.View>
      )}

      <View style={{ flex: 1, padding: 12 }}>
        {/* Big heading: subject name + Course code + Today's date */}
        <View style={[styles.bigHeading, { backgroundColor: theme.primary }]}>
          <Text style={styles.subjectTitle}>{decodeURIComponent(subjectName || '')}</Text>
          <View style={styles.courseRow}>
            <Text style={styles.coursePill}>Course Code — {subjectCode}</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              style={styles.datePillTouchable}
            >
              <Text style={styles.datePill}>📅 {formatDate(today)}  ▾</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.successLight }]}>
            <Text style={[styles.statValue, { color: theme.success }]}>{presentCount}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Present</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.dangerLight }]}>
            <Text style={[styles.statValue, { color: theme.danger }]}>{absentCount}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Absent</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.infoLight }]}>
            <Text style={[styles.statValue, { color: theme.info }]}>{students.length}</Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>Total</Text>
          </View>
        </View>

        {/* Big polished All Present / All Absent buttons with SVG icons */}
        <View style={styles.bulkRow}>
          <TouchableOpacity
            onPress={markAllPresent}
            style={[styles.bulkBtn, { backgroundColor: theme.success }]}
            activeOpacity={0.8}
          >
            <View style={styles.bulkIconCircle}>
              <Icon name="check" color={theme.success} size={20} />
            </View>
            <Text style={styles.bulkBtnTxt}>All Present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={markAllAbsent}
            style={[styles.bulkBtn, { backgroundColor: theme.danger }]}
            activeOpacity={0.8}
          >
            <View style={styles.bulkIconCircle}>
              <Icon name="close" color={theme.danger} size={18} />
            </View>
            <Text style={styles.bulkBtnTxt}>All Absent</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={students}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => {
            const status = marks[item.id] || 'A';
            const isPresent = status === 'P';
            const tc = typeColor(item.student_type);
            return (
              <TouchableOpacity
                style={[styles.studentRow, { backgroundColor: isPresent ? theme.successLight : theme.dangerLight }]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.studentName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    {item.is_verified && <VerifiedBadge size={13} />}
                  </View>
                  <Text style={[styles.studentReg, { color: theme.textSecondary }]}>{item.reg_no}</Text>
                </View>
                <View style={[styles.typePill, { backgroundColor: tc.bg, borderColor: tc.color }]}>
                  <Text style={[styles.typeTxt, { color: tc.color }]}>{typeLabel(item.student_type)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isPresent ? theme.success : theme.danger }]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No students enrolled.</Text>}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        <AnimatedButton onPress={submit} color={theme.primary} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Saving...' : 'Submit Attendance'}
        </AnimatedButton>
      </View>

      {/* Payment-style success card */}
      <Modal visible={!!success} transparent animationType="fade" onRequestClose={() => { setSuccess(null); router.back(); }}>
        <Pressable style={styles.backdrop} onPress={() => { setSuccess(null); router.back(); }}>
          <Pressable style={[styles.successCard, { backgroundColor: theme.card }]} onPress={() => {}}>
            {/* Big tick mark */}
            <View style={[styles.tickCircle, { backgroundColor: theme.success }]}>
              <Text style={styles.tickMark}>✓</Text>
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Attendance Saved!</Text>
            <Text style={[styles.successSub, { color: theme.textMuted }]}>
              {decodeURIComponent(subjectName || '')}  •  {formatDate(today)}
            </Text>

            <View style={styles.successStats}>
              <View style={styles.successStat}>
                <Text style={[styles.ssVal, { color: theme.success }]}>{success?.present || 0}</Text>
                <Text style={[styles.ssLbl, { color: theme.textSecondary }]}>Present</Text>
              </View>
              <View style={[styles.ssDivider, { backgroundColor: theme.border }]} />
              <View style={styles.successStat}>
                <Text style={[styles.ssVal, { color: theme.danger }]}>{success?.absent || 0}</Text>
                <Text style={[styles.ssLbl, { color: theme.textSecondary }]}>Absent</Text>
              </View>
              <View style={[styles.ssDivider, { backgroundColor: theme.border }]} />
              <View style={styles.successStat}>
                <Text style={[styles.ssVal, { color: theme.info }]}>{success?.total || 0}</Text>
                <Text style={[styles.ssLbl, { color: theme.textSecondary }]}>Total</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.successBtn, { backgroundColor: theme.primary }]}
              onPress={() => { setSuccess(null); router.back(); }}
              activeOpacity={0.8}
            >
              <Text style={styles.successBtnTxt}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 24,
    zIndex: 1000,
    ...Shadow.md,
  },
  toastTxt: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
  bigHeading: { padding: 18, borderRadius: Radius.lg, marginBottom: 12, ...Shadow.md },
  bulkRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    width: '100%',
  },
  bulkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    gap: 8,
    ...Shadow.md,
  },
  bulkIconCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  bulkBtnTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subjectTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  subjectMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 6, fontWeight: '600' },
  courseRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, flexWrap: 'wrap', gap: 8,
  },
  coursePill: {
    color: '#fff', fontSize: 13, fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  datePill: {
    color: '#fff', fontSize: 13, fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  datePillTouchable: {
    // wrapper just for tap area; visual styling stays on inner Text
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard: { flex: 1, padding: 12, borderRadius: Radius.md, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  studentRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: Radius.md, marginBottom: 6, gap: 8,
  },
  studentName: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  studentReg: { fontSize: 11, marginTop: 2 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  typeTxt: { fontSize: 10, fontWeight: '800' },
  statusBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  empty: { textAlign: 'center', padding: 40 },

  // Success card (rounded, not rectangular)
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  successCard: {
    borderRadius: 24, padding: 28, width: '100%', maxWidth: 340,
    alignItems: 'center', ...Shadow.lg,
  },
  tickCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    ...Shadow.md,
  },
  tickMark: { color: '#fff', fontSize: 42, fontWeight: '900', lineHeight: 48 },
  successTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  successSub: { fontSize: 12, marginBottom: 20, textAlign: 'center' },
  successStats: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, width: '100%',
  },
  successStat: { flex: 1, alignItems: 'center' },
  ssVal: { fontSize: 24, fontWeight: '800' },
  ssLbl: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  ssDivider: { width: 1, height: 36 },
  successBtn: {
    marginTop: 20, paddingHorizontal: 40, paddingVertical: 12,
    borderRadius: 999, minWidth: 160, alignItems: 'center',
  },
  successBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
