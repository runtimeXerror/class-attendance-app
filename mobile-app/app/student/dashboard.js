import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { api, getAuth } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import VerifiedBadge from '../../components/VerifiedBadge';
import ScreenFadeIn from '../../components/ScreenFadeIn';

export default function StudentDashboard() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const auth = await getAuth();
    if (auth.role !== 'student') { router.replace('/'); return; }
    setLoading(true);
    try {
      const res = await api.get('/api/student/attendance');
      setData(res.data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getColorByPct = (pct) => {
    if (pct >= 75) return { bg: theme.successLight, text: theme.success };
    if (pct >= 50) return { bg: theme.warningLight, text: theme.warning };
    return { bg: theme.dangerLight, text: theme.danger };
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Student Portal" />
      <ScreenFadeIn direction="right" duration={380}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={theme.primary} />}
      >
        {data && (
          <>
            <View style={[styles.hero, { backgroundColor: theme.primary }]}>
              <Text style={styles.helloLabel}>Welcome back,</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.helloName}>{data.student.name}</Text>
                {data.student.is_verified && <VerifiedBadge size={18} />}
              </View>
              <Text style={styles.helloReg}>{data.student.reg_no}</Text>
              <View style={styles.heroTags}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagTxt}>{data.student.branch_code}</Text>
                </View>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagTxt}>Batch {data.student.batch}</Text>
                </View>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagTxt}>Sem {data.student.semester}</Text>
                </View>
              </View>
            </View>

            {/* Only subject-wise (no overall section as per feedback) */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Subject-wise Attendance</Text>
            <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>Tap any subject for detailed view</Text>

            {data.subjects.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted }]}>No subjects enrolled yet.</Text>
            ) : (
              data.subjects.map(s => {
                const c = getColorByPct(s.percentage);
                return (
                  <TouchableOpacity
                    key={s.subject_id}
                    onPress={() => router.push({
                      pathname: '/student/subject',
                      params: { subjectId: s.subject_id }
                    })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.subjectCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subjectName, { color: theme.text }]}>{s.subject_name}</Text>
                        <Text style={[styles.subjectCode, { color: theme.textMuted }]}>
                          {s.subject_code}
                        </Text>
                        {/* Chip row: Semester + Credits (rounded boxes) */}
                        <View style={styles.chipRow}>
                          <View style={[styles.chip, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                            <Text style={[styles.chipTxt, { color: theme.primary }]}>
                              Semester • {s.semester}
                            </Text>
                          </View>
                          {s.credits ? (
                            <View style={[styles.chip, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
                              <Text style={[styles.chipTxt, { color: theme.warning }]}>
                                Credit • {Number(s.credits).toFixed(1)}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        {s.teacher_name && (
                          <Text style={[styles.subjectCode, { color: theme.primary, fontWeight: '600' }]}>
                            👨‍🏫 {s.teacher_name}
                          </Text>
                        )}
                        <Text style={[styles.subjectStats, { color: theme.textSecondary }]}>
                          {s.present}/{s.total_classes} classes
                        </Text>
                        {s.percentage < 75 && s.classes_needed_for_75 > 0 && (
                          <Text style={[styles.subjectStats, { color: theme.warning, fontWeight: '600' }]}>
                            ⚠️ {s.classes_needed_for_75} more classes needed for 75%
                          </Text>
                        )}
                      </View>
                      <View style={[styles.pctBadge, { backgroundColor: c.bg }]}>
                        <Text style={[styles.pctText, { color: c.text }]}>{s.percentage.toFixed(1)}%</Text>
                      </View>
                      <Text style={{ color: theme.textMuted, fontSize: 20, marginLeft: 8 }}>›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>
      </ScreenFadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 20, borderRadius: Radius.lg, marginBottom: 20, ...Shadow.md },
  helloLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  helloName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  helloReg: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 4 },
  heroTags: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  heroTag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  heroTagTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  sectionDesc: { fontSize: 12, marginBottom: 14 },
  subjectCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: Radius.md, borderWidth: 1, ...Shadow.sm },
  subjectName: { fontSize: 14, fontWeight: '700' },
  subjectCode: { fontSize: 11, marginTop: 2 },
  subjectStats: { fontSize: 11, marginTop: 4 },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 2, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  chipTxt: { fontSize: 10.5, fontWeight: '700' },
  pctBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  pctText: { fontWeight: '800', fontSize: 14 },
  empty: { textAlign: 'center', padding: 40 },
});
