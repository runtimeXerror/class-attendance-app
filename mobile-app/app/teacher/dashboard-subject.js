import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, RefreshControl,
  TouchableOpacity, FlatList, Modal, Pressable, Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { api, API_URL, downloadFile, saveToDevice, shareFile } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import Icon from '../../components/Icon';
import ActionButton from '../../components/ActionButton';
import { AnimatedButton } from '../../components/Animated';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function TeacherAttendanceDashboard() {
  const { theme } = useTheme();
  const { subjectId } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  // Modal that opens when user taps any clickable summary stat / pill.
  // shape: { kind: 'dates' | 'students', title, items, color? }
  const [filterModal, setFilterModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/teacher/dashboard/${subjectId}`);
      setData(res.data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [exporting, setExporting] = useState(null);
  const [chooser, setChooser] = useState(null);

  const exportFile = async (kind) => {
    if (exporting || !data?.subject) return;
    setExporting(kind);
    try {
      const subj = data.subject;
      const session = subj.session || subj.batch_name || 'Batch';
      const ext = kind === 'excel' ? 'xlsx' : 'pdf';
      const cleanName = (subj.name || 'Subject').replace(/\s+/g, '_');
      const fileName = `${cleanName}(${subj.code})_${session}_Sem${subj.semester || 5}.${ext}`;
      const endpoint = kind === 'excel'
        ? `/api/teacher/export/${subjectId}`
        : `/api/teacher/export-pdf/${subjectId}`;
      const fileUri = await downloadFile(endpoint, fileName);
      const mime = kind === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      setChooser({ fileUri, mime, kind, fileName });
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not download file.');
    } finally {
      setExporting(null);
    }
  };

  const onSave = async () => {
    if (!chooser) return;
    const fileName = chooser.fileName;
    const mime = chooser.mime;
    const fileUri = chooser.fileUri;
    const kind = chooser.kind;
    setChooser(null);
    try {
      await saveToDevice(fileUri, mime, fileName);
      Alert.alert(
        '✓ Downloaded',
        `${kind === 'excel' ? 'Excel' : 'PDF'} file downloaded successfully.\n\n${fileName}`
      );
    } catch (e) {
      Alert.alert('Save failed', e.message || 'Could not save file');
    }
  };

  const onShare = async () => {
    if (!chooser) return;
    try { await shareFile(chooser.fileUri, chooser.mime); } catch (_) {}
    setChooser(null);
  };

  // Thresholds:
  //   Safe     ≥ 75%
  //   Warning  60-75% (60 ≤ x < 75)
  //   Critical < 60%
  const getColorByPct = (pct) => {
    if (pct >= 75) return { bg: theme.successLight, text: theme.success };
    if (pct >= 60) return { bg: theme.warningLight, text: theme.warning };
    return { bg: theme.dangerLight, text: theme.danger };
  };

  const typeLabel = (type) => {
    if (type === 'back_year') return 'Back';
    if (type === 'lateral_entry') return 'LE';
    return 'Reg';
  };

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <Navbar subtitle="Loading..." />
        <Text style={{ color: theme.textMuted, textAlign: 'center', marginTop: 40 }}>Loading dashboard...</Text>
      </View>
    );
  }

  const avg = data.students.length
    ? Math.round(data.students.reduce((s, x) => s + x.percentage, 0) / data.students.length)
    : 0;
  const safeStudents = data.students.filter(s => s.percentage >= 75);
  const warnStudents = data.students.filter(s => s.percentage < 75 && s.percentage >= 60);
  const critStudents = data.students.filter(s => s.percentage < 60);
  const safeCount = safeStudents.length;
  const warnCount = warnStudents.length;
  const critCount = critStudents.length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Save / Share chooser modal */}
      {chooser && (
        <Modal transparent animationType="fade" onRequestClose={() => setChooser(null)}>
          <Pressable style={chooserStyles.backdrop} onPress={() => setChooser(null)}>
            <Pressable style={[chooserStyles.box, { backgroundColor: theme.card }]} onPress={() => {}}>
              <View style={[chooserStyles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                <Icon name={chooser.kind === 'excel' ? 'excel' : 'pdf'} color={theme.primary} size={36} />
              </View>
              <Text style={[chooserStyles.title, { color: theme.text }]}>
                {chooser.kind === 'excel' ? 'Excel' : 'PDF'} Ready
              </Text>
              <Text style={[chooserStyles.subtitle, { color: theme.textMuted }]} numberOfLines={2}>
                {chooser.fileName}
              </Text>
              <View style={chooserStyles.row}>
                <TouchableOpacity onPress={onSave} style={[chooserStyles.action, { backgroundColor: theme.primary }]} activeOpacity={0.85}>
                  <Icon name="download" color="#fff" size={26} />
                  <Text style={chooserStyles.actionTxt}>Save to Device</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onShare} style={[chooserStyles.action, { backgroundColor: theme.success }]} activeOpacity={0.85}>
                  <Icon name="share" color="#fff" size={26} />
                  <Text style={chooserStyles.actionTxt}>Share</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setChooser(null)} style={chooserStyles.cancel}>
                <Text style={{ color: theme.textMuted }}>Cancel</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Filter modal — opened when user taps a stat card or status pill.
          Backdrop is an absolute-fill Pressable BEHIND the modal box so it
          doesn't intercept the FlatList's scroll gestures. */}
      {filterModal && (
        <Modal transparent animationType="fade" onRequestClose={() => setFilterModal(null)}>
          <View style={filterStyles.backdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setFilterModal(null)}
            />
            <View style={[filterStyles.box, { backgroundColor: theme.card, maxHeight: Dimensions.get('window').height * 0.8 }]}>
              <View style={[filterStyles.titleBar, { backgroundColor: filterModal.color || theme.primary }]}>
                <Text style={filterStyles.titleTxt} numberOfLines={1}>{filterModal.title}</Text>
                <TouchableOpacity
                  onPress={() => setFilterModal(null)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={filterStyles.closeX}>×</Text>
                </TouchableOpacity>
              </View>

              {filterModal.kind === 'dates' ? (
                filterModal.items.length === 0 ? (
                  <Text style={[filterStyles.empty, { color: theme.textMuted }]}>No classes yet.</Text>
                ) : (
                  <FlatList
                    data={filterModal.items}
                    keyExtractor={(d) => d}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: d, index }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          setFilterModal(null);
                          router.push({
                            pathname: '/teacher/mark',
                            params: {
                              subjectId,
                              subjectName: data.subject.name,
                              subjectCode: data.subject.code,
                              editDate: d,
                            },
                          });
                        }}
                        style={[filterStyles.dateRow, { borderBottomColor: theme.border }]}
                      >
                        <View style={[filterStyles.dateNum, { backgroundColor: theme.primaryLight }]}>
                          <Text style={[filterStyles.dateNumTxt, { color: theme.primary }]}>
                            {filterModal.items.length - index}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[filterStyles.dateMain, { color: theme.text }]}>{d}</Text>
                          <Text style={[filterStyles.dateHint, { color: theme.textMuted }]}>tap to view / edit</Text>
                        </View>
                        <Text style={{ color: theme.textMuted, fontSize: 18 }}>›</Text>
                      </TouchableOpacity>
                    )}
                  />
                )
              ) : (
                filterModal.items.length === 0 ? (
                  <Text style={[filterStyles.empty, { color: theme.textMuted }]}>No students in this group.</Text>
                ) : (
                  <FlatList
                    data={filterModal.items}
                    keyExtractor={(s) => String(s.student_id)}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: s }) => {
                      const c = getColorByPct(s.percentage);
                      return (
                        <View style={[filterStyles.studentRow, { borderBottomColor: theme.border }]}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={[filterStyles.studentName, { color: theme.text }]} numberOfLines={1}>
                                {s.name}
                              </Text>
                              {s.is_verified && <VerifiedBadge size={11} />}
                            </View>
                            <Text style={[filterStyles.studentMeta, { color: theme.textMuted }]}>
                              {s.reg_no}  •  {typeLabel(s.student_type)}  •  {s.present}/{s.total}
                            </Text>
                          </View>
                          <View style={[filterStyles.pctBadge, { backgroundColor: c.bg }]}>
                            <Text style={[filterStyles.pctTxt, { color: c.text }]}>{s.percentage}%</Text>
                          </View>
                        </View>
                      );
                    }}
                  />
                )
              )}
            </View>
          </View>
        </Modal>
      )}

      <Navbar subtitle="Attendance Dashboard" />

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={theme.primary} />}
      >
        {/* Subject header */}
        <View style={[styles.heading, { backgroundColor: theme.primary }]}>
          <Text style={styles.heroTitle}>{data.subject.name}</Text>
          <Text style={styles.heroMeta}>
            {data.subject.code}  •  Sem {data.subject.semester}  •  {data.subject.credits} credits
          </Text>
          {data.subject.session && (
            <Text style={styles.heroMeta}>Session: {data.subject.session}</Text>
          )}
        </View>

        {/* Summary stats — Classes Taken & Students are tap-to-list. Avg is plain. */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModal({
              kind: 'dates',
              title: `📅 All Classes Taken (${data.total_classes})`,
              items: data.all_dates || data.recent_dates || [],
              color: theme.primary,
            })}
            style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.statValue, { color: theme.primary }]}>{data.total_classes}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Classes Taken</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModal({
              kind: 'students',
              title: `👥 All Students (${data.students.length})`,
              items: data.students,
              color: theme.info,
            })}
            style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.statValue, { color: theme.info }]}>{data.students.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Students</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statValue, { color: theme.success }]}>{avg}%</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Avg</Text>
          </View>
        </View>

        {/* Status breakdown — each pill opens a filtered student list */}
        <View style={styles.statusRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModal({
              kind: 'students',
              title: `✓ Safe (≥75%) — ${safeCount}`,
              items: safeStudents,
              color: theme.success,
            })}
            style={[styles.statusPill, { backgroundColor: theme.successLight }]}
          >
            <Text style={[styles.statusVal, { color: theme.success }]}>{safeCount}</Text>
            <Text style={[styles.statusLbl, { color: theme.success }]}>✓ Safe (≥75%)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModal({
              kind: 'students',
              title: `⚠ Warning (60-75%) — ${warnCount}`,
              items: warnStudents,
              color: theme.warning,
            })}
            style={[styles.statusPill, { backgroundColor: theme.warningLight }]}
          >
            <Text style={[styles.statusVal, { color: theme.warning }]}>{warnCount}</Text>
            <Text style={[styles.statusLbl, { color: theme.warning }]}>⚠ Warning (60-75%)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModal({
              kind: 'students',
              title: `✗ Critical (<60%) — ${critCount}`,
              items: critStudents,
              color: theme.danger,
            })}
            style={[styles.statusPill, { backgroundColor: theme.dangerLight }]}
          >
            <Text style={[styles.statusVal, { color: theme.danger }]}>{critCount}</Text>
            <Text style={[styles.statusLbl, { color: theme.danger }]}>✗ Critical (&lt;60%)</Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons — equal width row */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14, width: '100%' }}>
          <ActionButton
            label="Mark"
            color={theme.primary}
            onPress={() => router.push({
              pathname: '/teacher/mark',
              params: { subjectId, subjectName: data.subject.name, subjectCode: data.subject.code },
            })}
          />
          <ActionButton
            label={exporting === 'excel' ? '...' : 'Excel'}
            color={theme.success}
            disabled={exporting === 'excel'}
            onPress={() => exportFile('excel')}
          />
          <ActionButton
            label={exporting === 'pdf' ? '...' : 'PDF'}
            color={theme.danger}
            disabled={exporting === 'pdf'}
            onPress={() => exportFile('pdf')}
          />
        </View>

        {/* Recent classes */}
        {data.recent_dates.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📅 Recent Classes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {data.recent_dates.map(d => (
                <TouchableOpacity
                  key={d}
                  onPress={() => router.push({
                    pathname: '/teacher/mark',
                    params: {
                      subjectId,
                      subjectName: data.subject.name,
                      subjectCode: data.subject.code,
                      editDate: d,
                    },
                  })}
                  style={[styles.dateChip, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 12 }}>{d}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 9, marginTop: 2 }}>tap to edit</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Student list with attendance % */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          👥 Student Attendance ({data.students.length})
        </Text>
        {data.students.map(s => {
          const c = getColorByPct(s.percentage);
          return (
            <View
              key={s.student_id}
              style={[styles.studentRow, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.studentName, { color: theme.text }]}>{s.name}</Text>
                  {s.is_verified && <VerifiedBadge size={11} />}
                </View>
                <Text style={[styles.studentReg, { color: theme.textMuted }]}>
                  {s.reg_no}  •  {typeLabel(s.student_type)}  •  {s.present}/{s.total}
                </Text>
              </View>
              <View style={[styles.pctBadge, { backgroundColor: c.bg }]}>
                <Text style={[styles.pctText, { color: c.text }]}>{s.percentage}%</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { padding: 16, borderRadius: Radius.lg, marginBottom: 14, ...Shadow.md },
  heroTitle: { color: '#fff', fontSize: 19, fontWeight: '800' },
  heroMeta: { color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 4, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard: { flex: 1, padding: 12, borderRadius: Radius.md, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, fontWeight: '600' },

  statusRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  statusPill: { flex: 1, padding: 10, borderRadius: Radius.md, alignItems: 'center' },
  statusVal: { fontSize: 18, fontWeight: '800' },
  statusLbl: { fontSize: 10, fontWeight: '700', marginTop: 2 },

  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 4 },

  dateChip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: Radius.md, borderWidth: 1, marginRight: 8, alignItems: 'center',
  },

  studentRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: Radius.md, marginBottom: 6, borderWidth: 1,
  },
  studentName: { fontSize: 13, fontWeight: '700' },
  studentReg: { fontSize: 10, marginTop: 2 },
  pctBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, minWidth: 60, alignItems: 'center' },
  pctText: { fontWeight: '800', fontSize: 13 },
});

const filterStyles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  box: {
    width: '100%', maxWidth: 380, borderRadius: 18, overflow: 'hidden',
    // box-shadow stays; max height is applied inline so FlatList knows its bound
    ...Shadow.lg,
  },
  titleBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  titleTxt: { color: '#fff', fontSize: 14, fontWeight: '800', flex: 1, marginRight: 12 },
  closeX: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 26 },
  empty: { textAlign: 'center', padding: 32, fontSize: 13 },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  dateNum: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  dateNumTxt: { fontSize: 12, fontWeight: '800' },
  dateMain: { fontSize: 14, fontWeight: '700' },
  dateHint: { fontSize: 10, marginTop: 2 },
  studentRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  studentName: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  studentMeta: { fontSize: 10, marginTop: 2 },
  pctBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, minWidth: 60, alignItems: 'center' },
  pctTxt: { fontWeight: '800', fontSize: 13 },
});

const chooserStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  box: { width: '100%', maxWidth: 360, padding: 22, borderRadius: 18, alignItems: 'center', ...Shadow.lg },
  iconCircle: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 11, textAlign: 'center', marginBottom: 18 },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  action: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', gap: 8 },
  actionTxt: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  cancel: { marginTop: 14, padding: 8 },
});
