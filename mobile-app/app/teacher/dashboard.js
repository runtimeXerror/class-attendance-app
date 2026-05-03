import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, Image, TouchableOpacity, Modal, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getAuth, API_URL, downloadFile, saveToDevice, shareFile } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import useExitOnBack from '../../lib/useExitOnBack';
import Navbar from '../../components/Navbar';
import ScreenFadeIn from '../../components/ScreenFadeIn';
import Icon from '../../components/Icon';
import ActionButton from '../../components/ActionButton';
import { AnimatedButton, AnimatedCard } from '../../components/Animated';

export default function TeacherDashboard() {
  useExitOnBack();
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⚡ Instant-render trick: hydrate from a tiny AsyncStorage cache the
  // moment the screen mounts (zero network), then refresh in the background.
  // Render free-tier cold starts can take 30+ s — without the cache the
  // teacher saw a blank dashboard for 10-15 s every login.
  const CACHE_KEY = 'teacher_subjects_cache';

  const load = async () => {
    const auth = await getAuth();
    if (auth.role !== 'teacher') { router.replace('/'); return; }
    setName(auth.name || '');
    setBranchCode(auth.branch_code || '');
    setProfileImage(auth.profile_image || null);

    // 1) Hydrate from cache instantly so the UI is never blank.
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setSubjects(JSON.parse(cached));
    } catch (_) {}

    // 2) Refresh in the background. Only show spinner if we had no cache.
    const hadCache = subjects.length > 0;
    if (!hadCache) setLoading(true);
    try {
      const res = await api.get('/api/teacher/subjects');
      setSubjects(res.data);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(res.data)).catch(() => {});
    } catch (e) {
      // Don't blow away the cached UI on a network error
      if (!hadCache) Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [exporting, setExporting] = useState(null);
  const [chooser, setChooser] = useState(null); // { fileUri, mime, kind, fileName }

  const exportFile = async (subj, kind /* 'excel' | 'pdf' */) => {
    const key = subj.id + ':' + kind;
    if (exporting) return;
    setExporting(key);
    try {
      const session = subj.session || subj.batch_name || 'Batch';
      const ext = kind === 'excel' ? 'xlsx' : 'pdf';
      const cleanName = (subj.name || 'Subject').replace(/\s+/g, '_');
      const fileName = `${cleanName}(${subj.code})_${session}_Sem${subj.semester || 5}.${ext}`;
      const endpoint = kind === 'excel'
        ? `/api/teacher/export/${subj.id}`
        : `/api/teacher/export-pdf/${subj.id}`;
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

  const getInitials = (n) => {
    if (!n) return 'T';
    const parts = n.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'T';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const changeProfileImage = () => {
    router.push('/teacher/profile');
  };

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

      <Navbar subtitle={`Teacher • ${branchCode}`} />
      <ScreenFadeIn direction="right" duration={380}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Hero — NO hand emoji, profile image on right */}
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.helloLabel}>Welcome back,</Text>
            <Text style={styles.helloName}>{name}</Text>
            <Text style={styles.helloSub}>Mark attendance & manage classes</Text>
          </View>
          <TouchableOpacity onPress={changeProfileImage} style={styles.avatarBox}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInit}>{getInitials(name)}</Text>
              </View>
            )}
            <View style={styles.camBadge}>
              <Text style={{ fontSize: 10 }}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>📚 My Subjects</Text>

        <FlatList
          data={subjects}
          keyExtractor={item => String(item.id)}
          onRefresh={load}
          refreshing={loading}
          renderItem={({ item }) => (
            <AnimatedCard style={[styles.subjectCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <View style={styles.subjectHeader}>
                <View style={[styles.codeBadge, { backgroundColor: theme.primary }]}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{item.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.subjectName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.subjectMeta, { color: theme.textMuted }]}>
                    Sem {item.semester} • Batch {item.batch_name || '-'} • {item.credits || 3} credits
                  </Text>
                  {item.session && (
                    <Text style={[styles.subjectMeta, { color: theme.textMuted }]}>
                      Session: {item.session}
                    </Text>
                  )}
                </View>
              </View>

              {/* All 4 buttons — equal width, full row, on every device */}
              <View style={styles.btnRow}>
                <ActionButton
                  label="Mark"
                  color={theme.primary}
                  onPress={() => router.push({
                    pathname: '/teacher/mark',
                    params: { subjectId: item.id, subjectName: item.name, subjectCode: item.code },
                  })}
                />
                <ActionButton
                  label="Dashboard"
                  color={theme.accent}
                  onPress={() => router.push({
                    pathname: '/teacher/dashboard-subject',
                    params: { subjectId: item.id },
                  })}
                />
                <ActionButton
                  label={exporting === item.id + ':excel' ? '...' : 'Excel'}
                  color={theme.success}
                  disabled={exporting === item.id + ':excel'}
                  onPress={() => exportFile(item, 'excel')}
                />
                <ActionButton
                  label={exporting === item.id + ':pdf' ? '...' : 'PDF'}
                  color={theme.danger}
                  disabled={exporting === item.id + ':pdf'}
                  onPress={() => exportFile(item, 'pdf')}
                />
              </View>
            </AnimatedCard>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No subjects assigned. Contact admin.</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>
      </ScreenFadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 20, borderRadius: Radius.lg, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    ...Shadow.md,
  },
  helloLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  helloName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  helloSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 6 },

  avatarBox: { position: 'relative' },
  avatarImg: {
    width: 64, height: 64, borderRadius: 16,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInit: { color: '#fff', fontSize: 24, fontWeight: '800' },
  camBadge: {
    position: 'absolute', bottom: -2, right: -2,
    backgroundColor: '#fff', width: 20, height: 20,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  subjectCard: { padding: 14, marginBottom: 12 },
  subjectHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: Radius.sm, marginRight: 12, minWidth: 52, alignItems: 'center' },
  subjectName: { fontSize: 15, fontWeight: '700' },
  subjectMeta: { fontSize: 11, marginTop: 2 },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginTop: 4,
  },
  empty: { textAlign: 'center', padding: 40 },
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
