import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { api, getAuth } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import ScreenFadeIn from '../../components/ScreenFadeIn';
import { AnimatedCard } from '../../components/Animated';
import useExitOnBack from '../../lib/useExitOnBack';

export default function AdminDashboard() {
  useExitOnBack();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      if (auth.role !== 'admin') { router.replace('/'); return; }
      setName(auth.name);
      setBranchName(auth.branch_name || '');
      setBranchCode(auth.branch_code || '');
      try {
        const res = await api.get('/api/batches');
        setBatches(res.data);
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    })();
  }, []);

  const tiles = [
    { title: 'Students', desc: 'Manage student records', icon: '🎓', route: '/admin/students', bg: theme.infoLight },
    { title: 'Teachers', desc: 'Add/manage teachers', icon: '👨‍🏫', route: '/admin/teachers', bg: theme.successLight },
    { title: 'Subjects', desc: 'Create & assign subjects', icon: '📚', route: '/admin/subjects', bg: theme.primaryLight },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle={`${branchCode} Branch Admin`} />
      <ScreenFadeIn direction="right" duration={380}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <Text style={styles.helloLabel}>Welcome back,</Text>
          <Text style={styles.helloName}>{name}</Text>
          <Text style={styles.helloBranch}>{branchName} ({branchCode})</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Batch</Text>
        <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>Choose the batch to manage</Text>

        <View style={styles.batchGrid}>
          {batches.map(b => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.batchCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedBatch?.id === b.id && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setSelectedBatch(b)}
              activeOpacity={0.7}
            >
              <Text style={{
                fontSize: 22, fontWeight: '800',
                color: selectedBatch?.id === b.id ? '#fff' : theme.text,
              }}>{b.name}</Text>
              <Text style={{
                fontSize: 11, marginTop: 6, fontWeight: '700',
                color: selectedBatch?.id === b.id ? 'rgba(255,255,255,0.95)' : theme.primary,
              }}>
                Semester {b.current_semester || '-'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedBatch ? (
          <>
            {/* Enhanced detail card — Batch, Branch, Semester (per spec) */}
            <View style={[styles.batchDetailCard, { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: 2 }]}>
              <View style={styles.batchDetailRow}>
                <Text style={[styles.batchDetailLabel, { color: theme.textMuted }]}>Batch</Text>
                <Text style={[styles.batchDetailVal, { color: theme.text }]}>{selectedBatch.name}</Text>
              </View>
              <View style={[styles.batchDivider, { backgroundColor: theme.border }]} />
              <View style={styles.batchDetailRow}>
                <Text style={[styles.batchDetailLabel, { color: theme.textMuted }]}>Branch</Text>
                <Text style={[styles.batchDetailVal, { color: theme.text }]}>{branchCode}</Text>
              </View>
              <View style={[styles.batchDivider, { backgroundColor: theme.border }]} />
              <View style={styles.batchDetailRow}>
                <Text style={[styles.batchDetailLabel, { color: theme.textMuted }]}>Current Semester</Text>
                <Text style={[styles.batchDetailVal, { color: theme.primary }]}>{selectedBatch.current_semester || '-'}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Manage</Text>
            {tiles.map(t => (
              <AnimatedCard
                key={t.title}
                onPress={() => router.push({
                  pathname: t.route,
                  params: { batchId: selectedBatch.id, batchName: selectedBatch.name, semester: selectedBatch.current_semester }
                })}
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
              >
                <View style={[styles.actionIconBox, { backgroundColor: t.bg }]}>
                  <Text style={{ fontSize: 24 }}>{t.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>{t.title}</Text>
                  <Text style={[styles.actionDesc, { color: theme.textMuted }]}>{t.desc}</Text>
                </View>
                <Text style={[styles.actionArrow, { color: theme.primary }]}>→</Text>
              </AnimatedCard>
            ))}
          </>
        ) : (
          <View style={[styles.hint, { backgroundColor: theme.warningLight }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>👆 Select a batch to continue</Text>
          </View>
        )}
      </ScrollView>
      </ScreenFadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 20, borderRadius: Radius.lg, marginBottom: 20, ...Shadow.md },
  helloLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  helloName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  helloBranch: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sectionDesc: { fontSize: 12, marginBottom: 14 },
  batchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  batchCard: { width: '47%', padding: 20, borderRadius: Radius.lg, borderWidth: 1.5, alignItems: 'center', ...Shadow.sm },

  // New: big batch detail card showing Batch/Branch/Semester
  batchDetailCard: {
    padding: 16, borderRadius: Radius.lg, marginTop: 14,
    ...Shadow.md,
  },
  batchDetailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  batchDetailLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  batchDetailVal: { fontSize: 18, fontWeight: '800' },
  batchDivider: { height: 1 },

  activeBatchBanner: { padding: 12, borderRadius: Radius.md, marginTop: 10, alignItems: 'center' },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, borderRadius: Radius.md },
  actionIconBox: { width: 50, height: 50, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  actionTitle: { fontSize: 16, fontWeight: '700' },
  actionDesc: { fontSize: 12, marginTop: 2 },
  actionArrow: { fontSize: 22, fontWeight: '800' },
  hint: { padding: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: 20 },
});
