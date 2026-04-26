import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, Modal, TextInput,
  TouchableOpacity, FlatList, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { api, getAuth } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import ScreenFadeIn from '../../components/ScreenFadeIn';
import { AnimatedButton, AnimatedCard } from '../../components/Animated';
import VerifiedBadge from '../../components/VerifiedBadge';
import SearchBar from '../../components/SearchBar';

export default function SuperAdminDashboard() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [stats, setStats] = useState(null);
  const [activeView, setActiveView] = useState(null);  // 'branches', 'admins', etc.
  const [viewData, setViewData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);

  // Admin Add/Edit modal
  const [adminModal, setAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', name: '', branch_id: null, phone: '' });

  // Branch Add/Edit modal
  const [branchModal, setBranchModal] = useState(false);
  const [branchForm, setBranchForm] = useState({ name: '', code: '' });
  const [editingBranch, setEditingBranch] = useState(null);

  // Batch Add/Edit modal
  const [batchModal, setBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({ start_year: '', end_year: '', current_semester: '1' });
  const [editingBatch, setEditingBatch] = useState(null);

  const load = async () => {
    const auth = await getAuth();
    if (auth.role !== 'superadmin') { router.replace('/'); return; }
    setName(auth.name);
    try {
      const [s, b, bt] = await Promise.all([
        api.get('/api/superadmin/stats'),
        api.get('/api/branches'),
        api.get('/api/batches'),
      ]);
      setStats(s.data);
      setBranches(b.data);
      setBatches(bt.data);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const openView = async (key) => {
    setActiveView(key);
    setViewData([]);
    setSearchText('');
    try {
      let data = [];
      if (key === 'branches') data = branches;
      else if (key === 'admins') data = (await api.get('/api/superadmin/admins')).data;
      else if (key === 'teachers') data = (await api.get('/api/superadmin/all-teachers')).data;
      else if (key === 'students') data = (await api.get('/api/superadmin/all-students')).data;
      else if (key === 'subjects') data = (await api.get('/api/superadmin/all-subjects')).data;
      else if (key === 'batches') data = batches;
      setViewData(data);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return viewData;
    const q = searchText.toLowerCase();
    return viewData.filter(item => {
      const searchable = [
        item.name, item.email, item.code, item.reg_no,
        item.branch_code, item.branch_name, item.teacher_name, item.batch,
      ].filter(Boolean).map(s => String(s).toLowerCase()).join(' ');
      return searchable.includes(q);
    });
  }, [viewData, searchText]);

  // ===== ADMIN CRUD =====
  const createAdmin = async () => {
    if (!adminForm.email || !adminForm.name || !adminForm.branch_id) {
      Alert.alert('Oops', 'All required fields missing');
      return;
    }
    try {
      const res = await api.post('/api/superadmin/admins', adminForm);
      setAdminModal(false);
      setAdminForm({ email: '', name: '', branch_id: null, phone: '' });
      load();
      openView('admins');
      Alert.alert(
        '✓ Admin Created',
        `${res.data.message}\n\nEmail: ${res.data.email}\nDefault password: ${res.data.default_password}\n\n(Admin will be forced to change on first login)`
      );
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const deleteAdmin = (a) => {
    Alert.alert('Delete Admin', `Delete ${a.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/superadmin/admins/${a.id}`);
            load();
            openView('admins');
          } catch (e) {
            Alert.alert('Error', e.response?.data?.detail || e.message);
          }
        },
      },
    ]);
  };

  // ===== BRANCH CRUD =====
  const saveBranch = async () => {
    if (!branchForm.name || !branchForm.code) {
      Alert.alert('Oops', 'Name and code required');
      return;
    }
    try {
      if (editingBranch) {
        await api.patch(`/api/superadmin/branches/${editingBranch.id}`, branchForm);
      } else {
        await api.post('/api/superadmin/branches', branchForm);
      }
      setBranchModal(false);
      setBranchForm({ name: '', code: '' });
      setEditingBranch(null);
      load();
      openView('branches');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const deleteBranch = (b) => {
    Alert.alert('Delete Branch', `Delete ${b.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/superadmin/branches/${b.id}`);
            load();
            openView('branches');
          } catch (e) {
            Alert.alert('Error', e.response?.data?.detail || e.message);
          }
        },
      },
    ]);
  };

  // ===== BATCH CRUD =====
  const saveBatch = async () => {
    const sy = parseInt(batchForm.start_year);
    const ey = parseInt(batchForm.end_year);
    const cs = parseInt(batchForm.current_semester);
    if (!sy || !ey) {
      Alert.alert('Oops', 'Start and end year required');
      return;
    }
    try {
      if (editingBatch) {
        await api.patch(`/api/superadmin/batches/${editingBatch.id}`, { current_semester: cs });
      } else {
        await api.post('/api/superadmin/batches', {
          start_year: sy, end_year: ey, current_semester: cs,
        });
      }
      setBatchModal(false);
      setBatchForm({ start_year: '', end_year: '', current_semester: '1' });
      setEditingBatch(null);
      load();
      openView('batches');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
  };

  const deleteBatch = (b) => {
    Alert.alert('Delete Batch', `Delete ${b.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/superadmin/batches/${b.id}`);
            load();
            openView('batches');
          } catch (e) {
            Alert.alert('Error', e.response?.data?.detail || e.message);
          }
        },
      },
    ]);
  };

  // ===== CARDS (3 rows × 2 cols = 6 cards) =====
  const cards = [
    { key: 'branches', label: 'Branches', icon: '🏫', count: stats?.total_branches || 0, color: theme.info },
    { key: 'admins',   label: 'Admins',   icon: '👨‍💼', count: stats?.total_admins || 0,   color: theme.primary },
    { key: 'teachers', label: 'Teachers', icon: '👨‍🏫', count: stats?.total_teachers || 0, color: theme.success },
    { key: 'students', label: 'Students', icon: '🎓', count: stats?.total_students || 0, color: theme.warning },
    { key: 'subjects', label: 'Subjects', icon: '📚', count: stats?.total_subjects || 0, color: theme.accent },
    { key: 'batches',  label: 'Batches',  icon: '📅', count: stats?.total_batches || 0,  color: theme.danger },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Super Admin Portal" />
      <ScreenFadeIn direction="right" duration={380}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <Text style={styles.helloLabel}>Welcome back,</Text>
          <Text style={styles.helloName}>{name}</Text>
          <Text style={styles.helloRole}>Super Administrator • All Departments</Text>
        </View>

        {/* 3 rows × 2 cols clickable cards */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Overview</Text>
        <View style={styles.cardsGrid}>
          {cards.map(c => (
            <TouchableOpacity
              key={c.key}
              onPress={() => openView(c.key)}
              activeOpacity={0.7}
              style={[styles.bigCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.cardIconBox, { backgroundColor: c.color + '22' }]}>
                <Text style={{ fontSize: 24 }}>{c.icon}</Text>
              </View>
              <Text style={[styles.bigCardValue, { color: theme.text }]}>{c.count}</Text>
              <Text style={[styles.bigCardLabel, { color: theme.textMuted }]}>{c.label}</Text>
              <Text style={[styles.bigCardTap, { color: c.color }]}>Tap to manage →</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.hint, { backgroundColor: theme.warningLight }]}>
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>
            💡 Tap any card to view details and manage
          </Text>
        </View>
      </ScrollView>
      </ScreenFadeIn>

      {/* ===== DRILL-DOWN MODAL ===== */}
      <Modal visible={!!activeView} animationType="slide" onRequestClose={() => setActiveView(null)}>
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <Navbar subtitle={activeView ? activeView.charAt(0).toUpperCase() + activeView.slice(1) : ''} />
          <View style={{ flex: 1, padding: 14 }}>
            <View style={styles.drillHeader}>
              <TouchableOpacity onPress={() => setActiveView(null)} style={styles.drillBackBtn} activeOpacity={0.6}>
                <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>← Back</Text>
              </TouchableOpacity>
              <Text style={[styles.drillTitle, { color: theme.text }]} numberOfLines={1}>
                {activeView && activeView.charAt(0).toUpperCase() + activeView.slice(1)}
              </Text>
              <View style={styles.drillAddSlot}>
                {(activeView === 'admins' || activeView === 'branches' || activeView === 'batches') ? (
                  <TouchableOpacity
                    style={[styles.addIconBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      if (activeView === 'admins') setAdminModal(true);
                      if (activeView === 'branches') { setEditingBranch(null); setBranchForm({ name: '', code: '' }); setBranchModal(true); }
                      if (activeView === 'batches') { setEditingBatch(null); setBatchForm({ start_year: '', end_year: '', current_semester: '1' }); setBatchModal(true); }
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>+</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder={`Search ${activeView}...`}
              theme={theme}
            />

            <FlatList
              data={filteredData}
              keyExtractor={(item, i) => String(item.id || i)}
              renderItem={({ item }) => renderItem(item, activeView, theme, {
                deleteAdmin, deleteBranch, deleteBatch,
                editBranch: (b) => { setEditingBranch(b); setBranchForm({ name: b.name, code: b.code }); setBranchModal(true); },
                editBatch: (b) => { setEditingBatch(b); setBatchForm({ start_year: String(b.start_year), end_year: String(b.end_year), current_semester: String(b.current_semester) }); setBatchModal(true); },
              })}
              ListEmptyComponent={<Text style={{ color: theme.textMuted, textAlign: 'center', padding: 40 }}>No items</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* ===== ADD ADMIN MODAL ===== */}
      <Modal visible={adminModal} animationType="slide" onRequestClose={() => setAdminModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Add Branch Admin</Text>
          <Text style={[styles.modalSub, { color: theme.textMuted }]}>
            A default password will be auto-generated & emailed. Admin will change it on first login.
          </Text>

          <Lbl theme={theme}>Full Name *</Lbl>
          <TextInput style={inputStyle(theme)} value={adminForm.name} onChangeText={v => setAdminForm({ ...adminForm, name: v })} placeholder="Ramesh Kumar" placeholderTextColor={theme.textMuted} />

          <Lbl theme={theme}>Email *</Lbl>
          <TextInput
            style={inputStyle(theme)}
            value={adminForm.email}
            onChangeText={v => setAdminForm({ ...adminForm, email: v })}
            placeholder="admin@rrsdce.edu"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Lbl theme={theme}>Branch *</Lbl>
          {branches.map(b => (
            <TouchableOpacity
              key={b.id}
              style={[styles.branchOpt, { backgroundColor: theme.card, borderColor: theme.border },
                adminForm.branch_id === b.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setAdminForm({ ...adminForm, branch_id: b.id })}
            >
              <Text style={{ color: adminForm.branch_id === b.id ? '#fff' : theme.text, fontWeight: '600' }}>
                {b.code} — {b.name}
              </Text>
            </TouchableOpacity>
          ))}

          <Lbl theme={theme}>Phone (optional)</Lbl>
          <TextInput style={inputStyle(theme)} value={adminForm.phone} onChangeText={v => setAdminForm({ ...adminForm, phone: v })} keyboardType="phone-pad" placeholderTextColor={theme.textMuted} />

          <AnimatedButton onPress={createAdmin} color={theme.primary} style={{ marginTop: 24 }}>
            Create Admin (Auto Password)
          </AnimatedButton>
          <TouchableOpacity onPress={() => setAdminModal(false)} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ color: theme.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* ===== ADD/EDIT BRANCH MODAL ===== */}
      <Modal visible={branchModal} animationType="slide" onRequestClose={() => setBranchModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editingBranch ? `Edit: ${editingBranch.name}` : 'Add Branch'}
          </Text>
          <Lbl theme={theme}>Branch Name *</Lbl>
          <TextInput style={inputStyle(theme)} value={branchForm.name} onChangeText={v => setBranchForm({ ...branchForm, name: v })} placeholder="Civil Engineering" placeholderTextColor={theme.textMuted} />
          <Lbl theme={theme}>Branch Code *</Lbl>
          <TextInput
            style={inputStyle(theme)}
            value={branchForm.code}
            onChangeText={v => setBranchForm({ ...branchForm, code: v })}
            placeholder="CE"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
          />
          <AnimatedButton onPress={saveBranch} color={theme.primary} style={{ marginTop: 24 }}>
            {editingBranch ? 'Update Branch' : 'Add Branch'}
          </AnimatedButton>
          <TouchableOpacity onPress={() => setBranchModal(false)} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ color: theme.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* ===== ADD/EDIT BATCH MODAL ===== */}
      <Modal visible={batchModal} animationType="slide" onRequestClose={() => setBatchModal(false)}>
        <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {editingBatch ? `Edit: ${editingBatch.name}` : 'Add Batch'}
          </Text>
          {!editingBatch && (
            <>
              <Lbl theme={theme}>Start Year *</Lbl>
              <TextInput style={inputStyle(theme)} value={batchForm.start_year} onChangeText={v => setBatchForm({ ...batchForm, start_year: v })} keyboardType="numeric" placeholder="2025" placeholderTextColor={theme.textMuted} />
              <Lbl theme={theme}>End Year *</Lbl>
              <TextInput style={inputStyle(theme)} value={batchForm.end_year} onChangeText={v => setBatchForm({ ...batchForm, end_year: v })} keyboardType="numeric" placeholder="2029" placeholderTextColor={theme.textMuted} />
            </>
          )}
          <Lbl theme={theme}>Current Semester *</Lbl>
          <TextInput style={inputStyle(theme)} value={batchForm.current_semester} onChangeText={v => setBatchForm({ ...batchForm, current_semester: v })} keyboardType="numeric" placeholder="1 to 8" placeholderTextColor={theme.textMuted} />
          <AnimatedButton onPress={saveBatch} color={theme.primary} style={{ marginTop: 24 }}>
            {editingBatch ? 'Update Semester' : 'Add Batch'}
          </AnimatedButton>
          <TouchableOpacity onPress={() => setBatchModal(false)} style={{ padding: 14, alignItems: 'center' }}>
            <Text style={{ color: theme.textMuted }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

// === render row per type ===
function renderItem(item, type, theme, actions) {
  const base = {
    padding: 14, borderRadius: Radius.md, marginBottom: 8,
    borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card,
  };

  if (type === 'branches') {
    return (
      <TouchableOpacity
        style={base}
        onPress={() => Alert.alert(
          item.name,
          'Choose action:',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Edit', onPress: () => actions.editBranch(item) },
            { text: 'Delete', style: 'destructive', onPress: () => actions.deleteBranch(item) },
          ]
        )}
      >
        <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15 }}>{item.code}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  if (type === 'admins') {
    return (
      <TouchableOpacity
        style={base}
        onPress={() => Alert.alert(
          item.name,
          `${item.email}\n${item.branch_code}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => actions.deleteAdmin(item) },
          ]
        )}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.branch_code}</Text>
          </View>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14, flex: 1 }}>{item.name}</Text>
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>{item.email}</Text>
      </TouchableOpacity>
    );
  }

  if (type === 'teachers') {
    return (
      <View style={base}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.success, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.branch_code}</Text>
          </View>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14, flex: 1 }}>{item.name}</Text>
          {item.is_verified && <VerifiedBadge size={12} />}
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 4 }}>{item.email}</Text>
      </View>
    );
  }

  if (type === 'students') {
    return (
      <View style={base}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.warning, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.branch_code}</Text>
          </View>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13, flex: 1 }}>{item.name}</Text>
          {item.is_verified && <VerifiedBadge size={11} />}
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>
          {item.reg_no} • Batch {item.batch} • Sem {item.semester} • {item.student_type.replace('_', ' ')}
        </Text>
      </View>
    );
  }

  if (type === 'subjects') {
    return (
      <View style={base}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{item.code}</Text>
          </View>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13, flex: 1 }}>{item.name}</Text>
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>
          {item.branch_code} • Batch {item.batch} • Sem {item.semester} • {item.credits} credits
        </Text>
        {item.teacher_name && (
          <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 2 }}>
            👨‍🏫 {item.teacher_name}
          </Text>
        )}
      </View>
    );
  }

  if (type === 'batches') {
    return (
      <TouchableOpacity
        style={base}
        onPress={() => Alert.alert(
          `Session: ${item.name}`,
          `Current Semester: ${item.current_semester}\nYears: ${item.start_year}–${item.end_year}`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update Sem', onPress: () => actions.editBatch(item) },
            { text: 'Delete', style: 'destructive', onPress: () => actions.deleteBatch(item) },
          ]
        )}
      >
        <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15 }}>Session: {item.name}</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
          Current Sem: {item.current_semester}
        </Text>
      </TouchableOpacity>
    );
  }

  return null;
}

const inputStyle = (theme) => ({
  backgroundColor: theme.card, color: theme.text, borderColor: theme.border,
  padding: 14, borderRadius: Radius.md, borderWidth: 1, fontSize: 15, minHeight: 48,
});

const Lbl = ({ children, theme }) => (
  <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 6, color: theme.textSecondary }}>{children}</Text>
);

const styles = StyleSheet.create({
  hero: { padding: 20, borderRadius: Radius.lg, marginBottom: 16, ...Shadow.md },
  helloLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  helloName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  helloRole: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  bigCard: {
    width: '48%', padding: 16, borderRadius: Radius.lg,
    alignItems: 'center', borderWidth: 1, ...Shadow.sm,
  },
  cardIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  bigCardValue: { fontSize: 26, fontWeight: '800' },
  bigCardLabel: { fontSize: 12, marginTop: 2, fontWeight: '700' },
  bigCardTap: { fontSize: 10, marginTop: 8, fontWeight: '700' },

  hint: { padding: 12, borderRadius: Radius.md, marginTop: 16, alignItems: 'center' },

  drillHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 14, paddingHorizontal: 4, minHeight: 40,
  },
  drillBackBtn: { width: 70, paddingVertical: 4 },
  drillAddSlot: { width: 70, alignItems: 'flex-end' },
  drillTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800' },
  addIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  modalSub: { fontSize: 12, marginBottom: 14, lineHeight: 18 },
  branchOpt: { padding: 12, borderRadius: Radius.md, borderWidth: 1, marginBottom: 6 },
});
