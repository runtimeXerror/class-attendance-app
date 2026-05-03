import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import { AnimatedButton, AnimatedCard } from '../../components/Animated';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function Teachers() {
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email: '', name: '', phone: '' });

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/teachers');
      setTeachers(res.data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ email: '', name: '', phone: '' });
    setModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ email: t.email, name: t.name, phone: t.phone || '' });
    setModal(true);
  };

  const saveTeacher = async () => {
    if (editing) {
      try {
        await api.patch(`/api/admin/teachers/${editing.id}`, {
          name: form.name, phone: form.phone,
        });
        setModal(false);
        fetchTeachers();
        Alert.alert('✓ Updated', 'Teacher details updated');
      } catch (e) {
        Alert.alert('Error', e.response?.data?.detail || e.message);
      }
      return;
    }
    if (!form.email || !form.name) { Alert.alert('Oops', 'Email and Name required'); return; }
    try {
      const res = await api.post('/api/admin/teachers', form);
      setModal(false);
      fetchTeachers();
      // Three outcomes from the backend:
      //   1. Brand-new + email sent  → no password on screen, just confirmation
      //   2. Brand-new + email FAILED → password shown so HOD can share manually
      //   3. Existing teacher (linked to this branch) → no email, no password
      if (res.data.email_sent) {
        Alert.alert(
          '✓ Teacher Created',
          `Credentials have been emailed to ${res.data.email}.\n\n` +
          `The teacher should check their inbox (and spam folder) and change the password on first login.`
        );
      } else if (res.data.default_password) {
        Alert.alert(
          '⚠ Email Not Sent — Share Manually',
          `Email: ${res.data.email}\n` +
          `Default Password: ${res.data.default_password}\n\n` +
          `SMTP is not configured on the backend, so the credentials email could not be sent automatically.\n` +
          `Please share these details with the teacher securely.`
        );
      } else {
        Alert.alert(
          '✓ Linked to Your Branch',
          res.data.message || `${res.data.name} already had an account from another branch — no new email sent. They use the same login.`
        );
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const confirmDelete = (t) => {
    Alert.alert(
      'Delete Teacher',
      `Remove ${t.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/admin/teachers/${t.id}`);
              fetchTeachers();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        },
      ]
    );
  };

  const showOptions = (t) => {
    Alert.alert(
      t.name,
      `${t.email}\n${t.phone || 'No phone'}`,
      [
        { text: '✏️ Edit', onPress: () => openEdit(t) },
        { text: '🗑️ Delete', style: 'destructive', onPress: () => confirmDelete(t) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Manage Teachers" />

      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.count, { color: theme.textSecondary }]}>{teachers.length} teachers</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={openAdd}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={teachers}
          keyExtractor={item => String(item.id)}
          onRefresh={fetchTeachers}
          refreshing={loading}
          renderItem={({ item }) => (
            <AnimatedCard
              onPress={() => showOptions(item)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
              <View style={[styles.avatar, { backgroundColor: theme.success }]}>
                <Text style={{ fontSize: 18 }}>👨‍🏫</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.cardName, { color: theme.text }]}>{item.name}</Text>
                  {item.is_verified && <VerifiedBadge size={13} />}
                </View>
                <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>📧 {item.email}</Text>
                {item.phone ? <Text style={[styles.cardMeta, { color: theme.textMuted }]}>📞 {item.phone}</Text> : null}
              </View>
            </AnimatedCard>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.textMuted }]}>No teachers. Tap + Add</Text>}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            <View style={[styles.hint, { backgroundColor: theme.warningLight }]}>
              <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
                💡 Tap any teacher to Edit or Delete
              </Text>
            </View>
          }
        />
      </View>

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editing ? `Edit: ${editing.name}` : 'Add Teacher'}
          </Text>

          {/* Per v1.2 spec: Name → Email → Phone */}
          <Lbl theme={theme}>Full Name *</Lbl>
          <TextInput style={inputStyle(theme)} value={form.name} onChangeText={v => setForm({ ...form, name: v })} placeholder="Prof. Shubham Kumar" placeholderTextColor={theme.textMuted} />

          <Lbl theme={theme}>Email *</Lbl>
          <TextInput
            style={[inputStyle(theme), editing && { opacity: 0.5 }]}
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
            placeholder="teacher@college.edu"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!editing}
          />
          {editing && <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4 }}>Email cannot be changed</Text>}

          <Lbl theme={theme}>Phone (optional)</Lbl>
          <TextInput style={inputStyle(theme)} value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" placeholderTextColor={theme.textMuted} />

          <AnimatedButton onPress={saveTeacher} color={theme.primary} style={{ marginTop: 24 }}>
            {editing ? 'Update' : 'Save & Send Credentials'}
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
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardMeta: { fontSize: 11, marginTop: 2 },
  empty: { textAlign: 'center', padding: 40 },
  hint: { padding: 10, borderRadius: Radius.md, marginBottom: 10, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  info: { marginTop: 16, padding: 14, borderRadius: Radius.md },
});
