import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';

export default function SubjectDetail() {
  const { theme } = useTheme();
  const { subjectId } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/student/attendance/${subjectId}`);
        setData(res.data);
      } catch (e) {
        Alert.alert('Error', e.response?.data?.detail || e.message);
      }
    })();
  }, []);

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Navbar subtitle="Loading..." />
        <Text style={{ color: theme.textMuted, textAlign: 'center', padding: 40 }}>Loading...</Text>
      </View>
    );
  }

  const getColorByPct = (pct) => {
    if (pct >= 75) return { bg: theme.successLight, text: theme.success };
    if (pct >= 50) return { bg: theme.warningLight, text: theme.warning };
    return { bg: theme.dangerLight, text: theme.danger };
  };

  const pctColor = getColorByPct(data.summary.percentage);

  const tabs = [
    { key: 'summary', label: 'Summary', icon: '📊' },
    { key: 'present', label: 'Present', icon: '✓' },
    { key: 'absent', label: 'Absent', icon: '✗' },
    { key: 'analysis', label: 'Analysis', icon: '📈' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle={data.subject.code} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.subjCode}>{data.subject.code}</Text>
          <Text style={styles.subjName}>{data.subject.name}</Text>

          {/* Rounded chip boxes for Semester + Credit (matches teacher feel) */}
          <View style={styles.subjChipRow}>
            <View style={styles.subjChip}>
              <Text style={styles.subjChipTxt}>Semester • {data.subject.semester}</Text>
            </View>
            {data.subject.credits ? (
              <View style={styles.subjChip}>
                <Text style={styles.subjChipTxt}>Credit • {Number(data.subject.credits).toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          {data.subject.teacher_name && (
            <Text style={styles.subjTeacher}>👨‍🏫 {data.subject.teacher_name}</Text>
          )}
        </View>

        {/* 4-tab selector */}
        <View style={[styles.tabs, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.tab,
                activeTab === t.key && { backgroundColor: theme.primary }
              ]}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 14 }}>{t.icon}</Text>
              <Text style={{
                fontSize: 11, fontWeight: '700', marginTop: 2,
                color: activeTab === t.key ? '#fff' : theme.textSecondary,
              }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary tab */}
        {activeTab === 'summary' && (
          <>
            <View style={[styles.bigPctCard, { backgroundColor: pctColor.bg }]}>
              <Text style={[styles.bigPctLabel, { color: theme.textSecondary }]}>Attendance Percentage</Text>
              <Text style={[styles.bigPct, { color: pctColor.text }]}>
                {data.summary.percentage.toFixed(1)}%
              </Text>
              <Text style={[styles.bigPctSub, { color: theme.textMuted }]}>
                {data.summary.present} of {data.summary.total_classes} classes
              </Text>
            </View>

            <View style={styles.statRow}>
              <View style={[styles.statCard, { backgroundColor: theme.successLight }]}>
                <Text style={[styles.statValue, { color: theme.success }]}>{data.summary.present}</Text>
                <Text style={[styles.statLabel, { color: theme.text }]}>Present</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.dangerLight }]}>
                <Text style={[styles.statValue, { color: theme.danger }]}>{data.summary.absent}</Text>
                <Text style={[styles.statLabel, { color: theme.text }]}>Absent</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.infoLight }]}>
                <Text style={[styles.statValue, { color: theme.info }]}>{data.summary.total_classes}</Text>
                <Text style={[styles.statLabel, { color: theme.text }]}>Total</Text>
              </View>
            </View>
          </>
        )}

        {/* Present tab */}
        {activeTab === 'present' && (
          <View>
            <Text style={[styles.listTitle, { color: theme.text }]}>✓ Present on {data.present_dates.length} days</Text>
            {data.present_dates.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted }]}>No present records yet</Text>
            ) : data.all_records.filter(r => r.status === 'P').map((r, i) => (
              <View key={i} style={[styles.dateRow, { backgroundColor: theme.successLight }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateTxt, { color: theme.text }]}>📅 {r.date}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: theme.success }]}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>P</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Absent tab */}
        {activeTab === 'absent' && (
          <View>
            <Text style={[styles.listTitle, { color: theme.text }]}>✗ Absent on {data.absent_dates.length} days</Text>
            {data.absent_dates.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted }]}>Perfect record! No absents 🎉</Text>
            ) : data.all_records.filter(r => r.status === 'A').map((r, i) => (
              <View key={i} style={[styles.dateRow, { backgroundColor: theme.dangerLight }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dateTxt, { color: theme.text }]}>📅 {r.date}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: theme.danger }]}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>A</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Analysis tab */}
        {activeTab === 'analysis' && (
          <View>
            {/* Visual horizontal bar chart */}
            <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>📊 Visual Breakdown</Text>

              {/* Present bar */}
              <View style={{ marginTop: 14 }}>
                <View style={styles.chartRowHead}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Present</Text>
                  <Text style={{ color: theme.success, fontSize: 12, fontWeight: '800' }}>
                    {data.summary.present} ({data.summary.total_classes ? ((data.summary.present / data.summary.total_classes) * 100).toFixed(0) : 0}%)
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: theme.border }]}>
                  <View style={{
                    height: '100%',
                    width: `${data.summary.total_classes ? (data.summary.present / data.summary.total_classes) * 100 : 0}%`,
                    backgroundColor: theme.success,
                    borderRadius: 8,
                  }} />
                </View>
              </View>

              {/* Absent bar */}
              <View style={{ marginTop: 12 }}>
                <View style={styles.chartRowHead}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Absent</Text>
                  <Text style={{ color: theme.danger, fontSize: 12, fontWeight: '800' }}>
                    {data.summary.absent} ({data.summary.total_classes ? ((data.summary.absent / data.summary.total_classes) * 100).toFixed(0) : 0}%)
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: theme.border }]}>
                  <View style={{
                    height: '100%',
                    width: `${data.summary.total_classes ? (data.summary.absent / data.summary.total_classes) * 100 : 0}%`,
                    backgroundColor: theme.danger,
                    borderRadius: 8,
                  }} />
                </View>
              </View>

              {/* Target 75% line visualization */}
              <View style={{ marginTop: 18 }}>
                <View style={styles.chartRowHead}>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Progress toward 75% target</Text>
                  <Text style={{
                    fontSize: 12, fontWeight: '800',
                    color: data.summary.percentage >= 75 ? theme.success : theme.warning,
                  }}>
                    {data.summary.percentage.toFixed(1)}% / 75%
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: theme.border, height: 14, position: 'relative' }]}>
                  {/* 75% target line */}
                  <View style={{
                    position: 'absolute', left: '75%', top: 0, bottom: 0,
                    width: 2, backgroundColor: theme.textMuted, zIndex: 2,
                  }} />
                  <View style={{
                    height: '100%',
                    width: `${Math.min(data.summary.percentage, 100)}%`,
                    backgroundColor: data.summary.percentage >= 75 ? theme.success : theme.warning,
                    borderRadius: 8,
                  }} />
                </View>
                <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
                  The grey line shows the 75% target
                </Text>
              </View>
            </View>

            <View style={[styles.analysisCard, {
              backgroundColor: data.analysis.status === 'Safe' ? theme.successLight :
                data.analysis.status === 'Warning' ? theme.warningLight : theme.dangerLight
            }]}>
              <Text style={[styles.analysisLabel, { color: theme.textSecondary }]}>Status</Text>
              <Text style={[styles.analysisValue, {
                color: data.analysis.status === 'Safe' ? theme.success :
                  data.analysis.status === 'Warning' ? theme.warning : theme.danger
              }]}>
                {data.analysis.status === 'Safe' ? '✓ Safe' :
                  data.analysis.status === 'Warning' ? '⚠ Warning' : '⛔ Critical'}
              </Text>
              <Text style={[styles.analysisDesc, { color: theme.textSecondary }]}>
                {data.analysis.status === 'Safe' ? 'Attendance is above 75%. Keep it up!' :
                  data.analysis.status === 'Warning' ? 'Attendance between 50-75%. Be careful.' :
                    'Attendance below 50%. Urgent action needed.'}
              </Text>
            </View>

            {data.summary.percentage < 75 && data.analysis.classes_needed_for_75 > 0 && (
              <View style={[styles.infoCard, { backgroundColor: theme.warningLight }]}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>🎯 Classes Needed for 75%</Text>
                <Text style={[styles.infoValue, { color: theme.warning }]}>
                  {data.analysis.classes_needed_for_75}
                </Text>
                <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
                  Attend next {data.analysis.classes_needed_for_75} consecutive classes to reach 75%
                </Text>
              </View>
            )}

            {data.analysis.max_absent_streak > 0 && (
              <View style={[styles.infoCard, { backgroundColor: theme.dangerLight }]}>
                <Text style={[styles.infoTitle, { color: theme.text }]}>📉 Longest Absent Streak</Text>
                <Text style={[styles.infoValue, { color: theme.danger }]}>
                  {data.analysis.max_absent_streak} days
                </Text>
                <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
                  Most consecutive classes missed
                </Text>
              </View>
            )}

            <View style={[styles.infoCard, { backgroundColor: theme.infoLight }]}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>📊 Total Progress</Text>
              <Text style={[styles.infoDesc, { color: theme.textSecondary, marginTop: 8 }]}>
                Present: {data.summary.present} days{'\n'}
                Absent: {data.summary.absent} days{'\n'}
                Total: {data.summary.total_classes} days
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, borderRadius: Radius.lg, marginBottom: 16, ...Shadow.md },
  subjCode: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  subjName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  subjSem: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 6 },
  subjChipRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  subjChip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  subjChipTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  subjTeacher: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginTop: 4, fontWeight: '600' },

  tabs: { flexDirection: 'row', padding: 4, borderRadius: Radius.md, borderWidth: 1, marginBottom: 16, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.sm },

  bigPctCard: { padding: 24, borderRadius: Radius.lg, alignItems: 'center', marginBottom: 12, ...Shadow.sm },
  bigPctLabel: { fontSize: 13, fontWeight: '600' },
  bigPct: { fontSize: 48, fontWeight: '800', marginTop: 4 },
  bigPctSub: { fontSize: 12, marginTop: 4 },

  statRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, padding: 14, borderRadius: Radius.md, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  listTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: Radius.md, marginBottom: 6,
  },
  dateTxt: { fontSize: 13, fontWeight: '600' },
  statusDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  analysisCard: { padding: 18, borderRadius: Radius.lg, alignItems: 'center', marginBottom: 12 },
  chartCard: {
    padding: 16, borderRadius: Radius.lg,
    borderWidth: 1, marginBottom: 12,
  },
  chartTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  chartRowHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barBg: { height: 12, borderRadius: 8, overflow: 'hidden' },
  analysisLabel: { fontSize: 12, fontWeight: '600' },
  analysisValue: { fontSize: 26, fontWeight: '800', marginTop: 4 },
  analysisDesc: { fontSize: 12, textAlign: 'center', marginTop: 8, lineHeight: 18 },

  infoCard: { padding: 14, borderRadius: Radius.md, marginBottom: 10 },
  infoTitle: { fontSize: 13, fontWeight: '700' },
  infoValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  infoDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },

  empty: { textAlign: 'center', padding: 40, fontSize: 13 },
});
