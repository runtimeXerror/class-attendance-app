import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api, toLocalDateString } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import { AnimatedButton, AnimatedCard } from '../../components/Animated';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function Students() {
  const { theme } = useTheme();
  const { batchId, batchName, semester } = useLocalSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    reg_no: '', name: '',
    current_semester: semester || '5',
    student_type: 'regular', phone: ''
  });
  const [dob, setDob] = useState(new Date(2005, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/students?batch_id=${batchId}`);
      setStudents(res.data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ reg_no: '', name: '', current_semester: semester || '5', student_type: 'regular', phone: '' });
    setDob(new Date(2005, 0, 1));
    setModal(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({
      reg_no: student.reg_no,
      name: student.name,
      current_semester: String(student.current_semester),
      student_type: student.student_type,
      phone: student.phone || ''
    });
    if (student.date_of_birth) {
      const [y, m, d] = student.date_of_birth.split('-');
      setDob(new Date(+y, +m - 1, +d));
    }
    setModal(true);
  };

  const saveStudent = async () => {
    if (!form.reg_no || !form.name) { Alert.alert('Oops', 'Reg No and Name required'); return; }
    try {
      if (editing) {
        await api.patch(`/api/admin/students/${editing.id}`, {
          reg_no: form.reg_no,
          name: form.name,
          date_of_birth: toLocalDateString(dob),
          current_semester: parseInt(form.current_semester),
          student_type: form.student_type,
          phone: form.phone,
        });
        Alert.alert('Updated', 'Student updated');
      } else {
        await api.post('/api/admin/students', {
          reg_no: form.reg_no,
          name: form.name,
          batch_id: parseInt(batchId),
          date_of_birth: toLocalDateString(dob),
          current_semester: parseInt(form.current_semester),
          student_type: form.student_type,
          phone: form.phone,
        });
        Alert.alert('✓ Added', 'Student added');
      }
      setModal(false);
      fetchStudents();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const confirmDelete = (student) => {
    Alert.alert(
      'Delete Student',
      `Remove ${student.name} (${student.reg_no})?\nAll attendance records will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/admin/students/${student.id}`);
              fetchStudents();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        },
      ]
    );
  };

  const showOptions = (student) => {
    Alert.alert(
      student.name,
      `${student.reg_no} • Sem ${student.current_semester} • ${student.student_type}`,
      [
        { text: '✏️ Edit', onPress: () => openEdit(student) },
        { text: '🗑️ Delete', style: 'destructive', onPress: () => confirmDelete(student) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const typeColor = (type) => {
    if (type === 'back_year') return { bg: theme.warningLight, color: theme.warning };
    if (type === 'lateral_entry') return { bg: theme.infoLight, color: theme.info };
    return { bg: theme.successLight, color: theme.success };
  };

  const typeLabel = (type) => {
    if (type === 'back_year') return 'Back';
    if (type === 'lateral_entry') return 'LE';
    return 'Regular';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle={`Students • ${batchName}`} />

      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.count, { color: theme.textSecondary }]}>
            {students.length} students
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={openAdd}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={students}
          keyExtractor={item => String(item.id)}
          onRefresh={fetchStudents}
          refreshing={loading}
          renderItem={({ item, index }) => {
            const tc = typeColor(item.student_type);
            return (
              <AnimatedCard
                onPress={() => showOptions(item)}
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
              >
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
                    {item.is_verified && <VerifiedBadge size={13} />}
                  </View>
                  <Text style={[styles.cardReg, { color: theme.textSecondary }]}>{item.reg_no}</Text>
                </View>
                <View style={[styles.typePill, { backgroundColor: tc.bg }]}>
                  <Text style={[styles.typeTxt, { color: tc.color }]}>{typeLabel(item.student_type)}</Text>
                </View>
              </AnimatedCard>
            );
          }}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No students. Tap + Add</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            <View style={[styles.hint, { backgroundColor: theme.warningLight }]}>
              <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
                💡 Tap any student card to Edit or Delete
              </Text>
            </View>
          }
        />
      </View>

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editing ? `Edit: ${editing.name}` : `Add Student to ${batchName}`}
          </Text>

          <Lbl theme={theme}>Registration Number *</Lbl>
          <TextInput
            style={inputStyle(theme)}
            value={form.reg_no}
            onChangeText={v => setForm({ ...form, reg_no: v })}
            placeholder="23105125023"
            placeholderTextColor={theme.textMuted}
          />

          <Lbl theme={theme}>Full Name *</Lbl>
          <TextInput style={inputStyle(theme)} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Full Name" placeholderTextColor={theme.textMuted} />

          <Lbl theme={theme}>Date of Birth *</Lbl>
          <TouchableOpacity style={[inputStyle(theme), { justifyContent: 'center' }]} onPress={() => setShowPicker(true)}>
            <Text style={{ color: theme.text, fontSize: 15 }}>📅  {toLocalDateString(dob)}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={dob} mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => {
                setShowPicker(Platform.OS === 'ios');
                if (e.type === 'set' && d) setDob(d);
              }}
              maximumDate={new Date()}
            />
          )}

          <Lbl theme={theme}>Current Semester</Lbl>
          <TextInput style={inputStyle(theme)} value={form.current_semester} onChangeText={v => setForm({ ...form, current_semester: v })} keyboardType="numeric" placeholderTextColor={theme.textMuted} />

          <Lbl theme={theme}>Student Type</Lbl>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'regular', label: 'Regular' },
              { key: 'lateral_entry', label: 'Lateral Entry' },
              { key: 'back_year', label: 'Back Year' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.pill,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  form.student_type === t.key && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setForm({ ...form, student_type: t.key })}
              >
                <Text style={{ color: form.student_type === t.key ? '#fff' : theme.textSecondary, fontSize: 11, fontWeight: '600' }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Lbl theme={theme}>Phone (optional)</Lbl>
          <TextInput style={inputStyle(theme)} value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" placeholderTextColor={theme.textMuted} />

          <AnimatedButton onPress={saveStudent} color={theme.primary} style={{ marginTop: 24 }}>
            {editing ? 'Update' : 'Save'}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  count: { fontSize: 13, fontWeight: '600' },
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, ...Shadow.sm },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardName: { fontSize: 14, fontWeight: '700' },
  cardReg: { fontSize: 11, marginTop: 2 },
  typePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  typeTxt: { fontSize: 10, fontWeight: '800' },
  empty: { textAlign: 'center', padding: 40 },
  hint: { padding: 10, borderRadius: Radius.md, marginBottom: 10, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  pill: { flex: 1, padding: 10, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center' },
});
