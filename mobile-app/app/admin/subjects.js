import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import { AnimatedButton, AnimatedCard } from '../../components/Animated';

export default function Subjects() {
  const { theme } = useTheme();
  const { batchId, batchName, semester } = useLocalSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '',
    semester: semester || '5',
    teacher_id: null,
    credits: '3',
    session: '2025-26',   // default current session
  });

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        api.get(`/api/admin/subjects?batch_id=${batchId}`),
        api.get('/api/admin/teachers'),
      ]);
      setSubjects(s.data);
      setTeachers(t.data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addSubject = async () => {
    if (!form.code || !form.name || !form.teacher_id) {
      Alert.alert('Oops', 'Code, name and teacher are required');
      return;
    }
    try {
      await api.post('/api/admin/subjects', {
        code: form.code,
        name: form.name,
        batch_id: parseInt(batchId),
        semester: parseInt(form.semester),
        teacher_id: form.teacher_id,
        credits: parseInt(form.credits) || 3,
        session: form.session,
      });
      setModal(false);
      setForm({ code: '', name: '', semester: semester || '5', teacher_id: null, credits: '3', session: '2025-26' });
      load();
      Alert.alert('✓ Created', 'Subject created.\nAll students of that semester auto-enrolled.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const confirmDelete = (subj) => {
    Alert.alert(
      'Delete Subject',
      `Remove ${subj.name} (${subj.code})?\nAll attendance records will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/admin/subjects/${subj.id}`);
              load();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Subjects Management" />

      <View style={{ flex: 1, padding: 16 }}>
        {/* Title card with session (shows which batch is being taught) */}
        <View style={[styles.titleCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.titleText}>📚 Subject Management</Text>
          <Text style={styles.titleSub}>Batch {batchName} • Sem {semester}</Text>
          <Text style={styles.titleSub}>Session: 2025-26</Text>
        </View>

        <View style={styles.headerRow}>
          <Text style={[styles.count, { color: theme.textSecondary }]}>{subjects.length} subjects</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => setModal(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={subjects}
          keyExtractor={item => String(item.id)}
          onRefresh={load}
          refreshing={loading}
          renderItem={({ item }) => (
            <AnimatedCard
              onPress={() => confirmDelete(item)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
              <View style={[styles.codeBadge, { backgroundColor: theme.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>{item.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
                  Sem {item.semester} • {item.credits || 3} credits • {item.batch_name || batchName}
                </Text>
                {item.session && (
                  <Text style={[styles.cardMeta, { color: theme.textMuted }]}>
                    Session: {item.session}
                  </Text>
                )}
                <Text style={[styles.cardMeta, { color: theme.textMuted }]}>
                  👨‍🏫 {item.teacher_name || 'Unassigned'}
                </Text>
              </View>
            </AnimatedCard>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No subjects yet. Tap + Add</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            subjects.length > 0 && (
              <View style={[styles.hint, { backgroundColor: theme.warningLight }]}>
                <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
                  💡 Tap any subject to Delete
                </Text>
              </View>
            )
          }
        />
      </View>

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Create Subject</Text>

          {/* Session at top - which batch being taught */}
          <View style={[styles.sessionBanner, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.sessionTxt, { color: theme.primary }]}>
              🎓 Batch {batchName}  •  Semester {semester}  •  Session 2025-26
            </Text>
          </View>

          <Lbl theme={theme}>Subject Code *</Lbl>
          <TextInput
            style={inputStyle(theme)}
            value={form.code}
            onChangeText={v => setForm({ ...form, code: v })}
            placeholder="105501"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
          />

          <Lbl theme={theme}>Subject Name *</Lbl>
          <TextInput
            style={inputStyle(theme)}
            value={form.name}
            onChangeText={v => setForm({ ...form, name: v })}
            placeholder="Artificial Intelligence"
            placeholderTextColor={theme.textMuted}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Lbl theme={theme}>Semester</Lbl>
              <TextInput
                style={inputStyle(theme)}
                value={form.semester}
                onChangeText={v => setForm({ ...form, semester: v })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Lbl theme={theme}>Credits</Lbl>
              <TextInput
                style={inputStyle(theme)}
                value={form.credits}
                onChangeText={v => setForm({ ...form, credits: v })}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          <Lbl theme={theme}>Session</Lbl>
          <TextInput
            style={inputStyle(theme)}
            value={form.session}
            onChangeText={v => setForm({ ...form, session: v })}
            placeholder="2025-26"
            placeholderTextColor={theme.textMuted}
          />

          <Lbl theme={theme}>Assign Teacher *</Lbl>
          {teachers.length === 0 ? (
            <Text style={{ color: theme.danger, marginTop: 8, fontWeight: '600' }}>
              Koi teacher nahi. Pehle teacher add karo.
            </Text>
          ) : teachers.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.teacherOpt,
                { backgroundColor: theme.card, borderColor: theme.border },
                form.teacher_id === t.id && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setForm({ ...form, teacher_id: t.id })}
            >
              <Text style={{ color: form.teacher_id === t.id ? '#fff' : theme.text, fontWeight: '700' }}>{t.name}</Text>
              <Text style={{ color: form.teacher_id === t.id ? 'rgba(255,255,255,0.85)' : theme.textMuted, fontSize: 11, marginTop: 2 }}>{t.email}</Text>
            </TouchableOpacity>
          ))}

          <AnimatedButton onPress={addSubject} color={theme.primary} style={{ marginTop: 24 }}>
            Create Subject
          </AnimatedButton>
          <TouchableOpacity onPress={() => setModal(false)} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ color: theme.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const inputStyle = (theme) => ({
  backgroundColor: theme.card, color: theme.text, borderColor: theme.border,
  padding: 14, borderRadius: Radius.md, borderWidth: 1, fontSize: 15, minHeight: 48,
});

const Lbl = ({ children, theme }) => (
  <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 6, color: theme.textSecondary }}>{children}</Text>
);

const styles = StyleSheet.create({
  titleCard: { padding: 18, borderRadius: Radius.lg, marginBottom: 16, ...Shadow.md },
  titleText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  titleSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  count: { fontSize: 13, fontWeight: '600' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, ...Shadow.sm },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  codeBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: Radius.sm, marginRight: 12, minWidth: 52, alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700' },
  cardMeta: { fontSize: 11, marginTop: 2 },
  empty: { textAlign: 'center', padding: 40 },
  hint: { padding: 10, borderRadius: Radius.md, marginBottom: 10, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  sessionBanner: {
    padding: 12, borderRadius: Radius.md, marginBottom: 8,
    alignItems: 'center',
  },
  sessionTxt: { fontSize: 12, fontWeight: '800' },
  teacherOpt: { padding: 12, borderRadius: Radius.md, borderWidth: 1, marginBottom: 6 },
});
