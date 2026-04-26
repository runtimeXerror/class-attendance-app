import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert, Image,
  TouchableOpacity, ScrollView, Modal, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api, getAuth, saveAuth } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { Radius, Shadow } from '../../lib/theme';
import Navbar from '../../components/Navbar';
import ActionButton from '../../components/ActionButton';
import { AnimatedButton } from '../../components/Animated';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function TeacherProfile() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      if (auth.role !== 'teacher') { router.replace('/'); return; }
      setName(auth.name || '');
      setBranchCode(auth.branch_code || '');
      setProfileImage(auth.profile_image || null);
      try {
        const res = await api.get('/api/teacher/me');
        setEmail(res.data.email || '');
        setPhone(res.data.phone || '');
        setProfileImage(res.data.profile_image || auth.profile_image);
      } catch {}
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,   // enables crop + rotate inline
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      // Save data URL for preview (works in RN). For production, upload via multipart FormData.
      // Here we just persist the uri locally — backend accepts the URL string as profile_image.
      await api.patch('/api/teacher/profile', { profile_image: uri });
      setProfileImage(uri);
      // Update auth storage
      const auth = await getAuth();
      await saveAuth({ ...auth, access_token: auth.token, profile_image: uri });
      Alert.alert('Uploaded', 'Profile picture updated successfully');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    }
    setUploading(false);
    setZoomOpen(false);
  };

  const removeImage = async () => {
    setUploading(true);
    try {
      await api.patch('/api/teacher/profile', { profile_image: '' });
      setProfileImage(null);
      const auth = await getAuth();
      await saveAuth({ ...auth, access_token: auth.token, profile_image: '' });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setUploading(false);
  };

  const getInitials = (n) => {
    if (!n) return 'T';
    const parts = n.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'T';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="My Profile" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Avatar — tap to zoom/change */}
          <TouchableOpacity
            onPress={() => setZoomOpen(true)}
            activeOpacity={0.8}
            style={[styles.avatarWrap, { borderColor: theme.primary }]}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarInitials, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.initialsTxt, { color: theme.primary }]}>{getInitials(name)}</Text>
              </View>
            )}
            <View style={[styles.plusBadge, { backgroundColor: theme.primary }]}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>+</Text>
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            <VerifiedBadge size={15} />
          </View>
          <Text style={[styles.role, { color: theme.primary }]}>TEACHER • {branchCode}</Text>

          <View style={[styles.infoRow, { borderColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Email</Text>
            <Text style={[styles.infoVal, { color: theme.text }]}>{email}</Text>
          </View>
          {phone ? (
            <View style={[styles.infoRow, { borderColor: theme.border }]}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Phone</Text>
              <Text style={[styles.infoVal, { color: theme.text }]}>{phone}</Text>
            </View>
          ) : null}

          <Text style={[styles.tapHint, { color: theme.textMuted }]}>
            Tap your photo to {profileImage ? 'change' : 'add'} profile picture
          </Text>
        </View>
      </ScrollView>

      {/* Zoom / Change modal */}
      <Modal visible={zoomOpen} transparent animationType="fade" onRequestClose={() => setZoomOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setZoomOpen(false)}>
          <Pressable style={[styles.zoomBox, { backgroundColor: theme.card }]} onPress={() => {}}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.zoomImg} resizeMode="contain" />
            ) : (
              <View style={[styles.zoomInitials, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.zoomInitText, { color: theme.primary }]}>{getInitials(name)}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' }}>
              <ActionButton
                label={uploading ? 'Uploading...' : 'Select from Gallery'}
                color={theme.primary}
                onPress={pickImage}
                disabled={uploading}
                size="lg"
              />
              {profileImage && (
                <ActionButton
                  label="Remove"
                  color={theme.danger}
                  onPress={removeImage}
                  disabled={uploading}
                  size="lg"
                />
              )}
            </View>
            <TouchableOpacity onPress={() => setZoomOpen(false)} style={{ padding: 10, marginTop: 8, alignItems: 'center' }}>
              <Text style={{ color: theme.textMuted }}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24, borderRadius: Radius.lg, borderWidth: 1,
    alignItems: 'center', ...Shadow.md,
  },
  avatarWrap: {
    width: 128, height: 128, borderRadius: 26, borderWidth: 3,
    overflow: 'visible', position: 'relative',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 22 },
  avatarInitials: {
    width: '100%', height: '100%', borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  initialsTxt: { fontSize: 48, fontWeight: '800' },
  plusBadge: {
    position: 'absolute', right: -4, bottom: -4,
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    ...Shadow.md,
  },

  name: { fontSize: 22, fontWeight: '800' },
  role: { fontSize: 12, fontWeight: '800', marginTop: 4, letterSpacing: 1 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', paddingVertical: 12, borderTopWidth: 1, marginTop: 14,
  },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoVal: { fontSize: 13, fontWeight: '700' },

  tapHint: { fontSize: 11, marginTop: 14, fontStyle: 'italic' },

  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  zoomBox: {
    borderRadius: 20, padding: 20,
    width: '100%', maxWidth: 360, alignItems: 'center',
  },
  zoomImg: { width: 280, height: 280, borderRadius: 20 },
  zoomInitials: {
    width: 280, height: 280, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  zoomInitText: { fontSize: 110, fontWeight: '800' },
});
