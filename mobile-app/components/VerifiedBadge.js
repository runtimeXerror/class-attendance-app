import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';

// X (Twitter) style verified badge with starburst/scalloped edges
// Tap shows: "Verified account — verified by Class Attendance, RRSDCE Begusarai"
export default function VerifiedBadge({ size = 14, org = 'RRSDCE Begusarai' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.6}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={{ marginLeft: 4 }}
      >
        {/* Scalloped/starburst shape using overlapping rotated squares */}
        <View style={{
          width: size + 2, height: size + 2,
          justifyContent: 'center', alignItems: 'center',
        }}>
          {/* 8-point star using two rotated rounded squares */}
          <View style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: size * 0.3,
            backgroundColor: '#1D9BF0',
            transform: [{ rotate: '0deg' }],
          }} />
          <View style={{
            position: 'absolute',
            width: size, height: size,
            borderRadius: size * 0.3,
            backgroundColor: '#1D9BF0',
            transform: [{ rotate: '45deg' }],
          }} />
          {/* Checkmark */}
          <Text style={{
            color: '#fff',
            fontSize: size * 0.62,
            fontWeight: '900',
            zIndex: 2,
            lineHeight: size * 0.9,
          }}>✓</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.bigBadge}>
              <View style={{
                position: 'absolute', width: 48, height: 48,
                borderRadius: 14, backgroundColor: '#1D9BF0',
              }} />
              <View style={{
                position: 'absolute', width: 48, height: 48,
                borderRadius: 14, backgroundColor: '#1D9BF0',
                transform: [{ rotate: '45deg' }],
              }} />
              <Text style={styles.bigCheck}>✓</Text>
            </View>
            <Text style={styles.title}>Verified account</Text>
            <Text style={styles.desc}>
              This account is verified by{'\n'}
              <Text style={{ fontWeight: '800', color: '#1D9BF0' }}>Class Attendance</Text>
              {'\n'}<Text style={{ fontSize: 13, color: '#64748B' }}>Organisation: {org}</Text>
            </Text>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 24,
    alignItems: 'center', width: '100%', maxWidth: 320,
  },
  bigBadge: {
    width: 80, height: 80,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  bigCheck: { color: '#fff', fontSize: 30, fontWeight: '900', zIndex: 2 },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  desc: { fontSize: 14, color: '#334155', textAlign: 'center', lineHeight: 22 },
  closeBtn: {
    marginTop: 18, paddingHorizontal: 28, paddingVertical: 10,
    backgroundColor: '#1D9BF0', borderRadius: 999,
  },
  closeTxt: { color: '#fff', fontWeight: '700' },
});
