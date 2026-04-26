import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Easing, Modal, Pressable, Linking, Share,
} from 'react-native';
import { router } from 'expo-router';
import { getAuth } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { Radius, Shadow } from '../lib/theme';
import AppLogo from '../components/AppLogo';
import Icon from '../components/Icon';
import Typewriter from '../components/Typewriter';

const roles = [
  { key: 'superadmin', label: 'Super Admin', icon: '👨‍💻', desc: 'Manage everything' },
  { key: 'admin',      label: 'Admin',       icon: '👨‍💼', desc: 'Manage a branch' },
  { key: 'teacher',    label: 'Teacher',     icon: '👨‍🏫', desc: 'Mark attendance' },
  { key: 'student',    label: 'Student',     icon: '🎓', desc: 'Track yours' },
];

export default function Home() {
  const { theme, isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const slideIn = useRef(new Animated.Value(300)).current;
  const hbRotate = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;   // logo float up/down

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    // Continuous up-down float animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Auto redirect if already logged in (30-day token)
    (async () => {
      const { token, role } = await getAuth();
      if (token && role) {
        const target = role === 'superadmin' ? '/superadmin/dashboard' : `/${role}/dashboard`;
        router.replace(target);
      }
    })();
  }, []);

  useEffect(() => {
    Animated.timing(hbRotate, { toValue: menuOpen ? 1 : 0, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(slideIn, { toValue: menuOpen ? 0 : 300, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [menuOpen]);

  const rotateDeg = hbRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  const shareApp = async () => {
    try {
      await Share.share({ message: 'Check out Class Attendance App — built by Vishal Kumar for RRSDCE Begusarai!' });
    } catch {}
  };

  const menuItems = [
    { icon: 'home',        label: 'Home',            action: () => setMenuOpen(false) },
    { icon: 'info',        label: 'About App',       action: () => { setMenuOpen(false); router.push('/about-app'); } },
    { icon: 'users',       label: 'About Developers', action: () => { setMenuOpen(false); router.push('/about'); } },
    { icon: 'edit',        label: 'Write a Review',  action: () => Linking.openURL('https://play.google.com/store') },
    { icon: 'share',       label: 'Share this App',  action: shareApp },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {/* HERO */}
          <View style={[styles.heroWrap, { backgroundColor: theme.primary }]}>
            {/* Top-right icons */}
            <View style={styles.heroIcons}>
              <TouchableOpacity style={styles.heroIcon} onPress={toggle} activeOpacity={0.6}>
                <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroIcon} onPress={() => setMenuOpen(true)} activeOpacity={0.6}>
                <Animated.Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', transform: [{ rotate: rotateDeg }] }}>☰</Animated.Text>
              </TouchableOpacity>
            </View>

            {/* Centered logo — BIG, no inner box (logo is already transparent) */}
            {/* Logo with continuous up-down float motion */}
            <Animated.View style={{ transform: [{ translateY: floatY }], marginBottom: 14 }}>
              <AppLogo size={150} />
            </Animated.View>

            {/* App name */}
            <Text style={styles.appName}>Class Attendance</Text>

            {/* Typewriter tagline */}
            <View style={styles.typeWrap}>
              <Typewriter
                words={[
                  'Teacher Mark attendance',
                  'Student Monitor your attendance',
                  'Simple. Smart. Seamless.',
                ]}
                style={styles.typeText}
                typeSpeed={60}
                deleteSpeed={30}
                pauseAfterType={1000}
              />
            </View>
          </View>

          {/* MIDDLE — role picker */}
          <View style={styles.content}>
            <Text style={[styles.q1, { color: theme.text }]}>Who are you?</Text>
            <Text style={[styles.q2, { color: theme.textMuted }]}>Select your role to continue</Text>

            <View style={styles.roleGrid}>
              {roles.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => router.push(`/login?role=${r.key}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleLabel, { color: theme.text }]}>{r.label}</Text>
                  <Text style={[styles.roleDesc, { color: theme.textMuted }]}>{r.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <Text style={[styles.footerOrg, { color: theme.primary }]}>@RRSDCE Begusarai</Text>
            <Text style={[styles.footerVer, { color: theme.textMuted }]}>v1.2.0</Text>
            <Text style={[styles.footerDev, { color: theme.textMuted }]}>Developed by Vishal Kumar</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Hamburger Drawer */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Animated.View style={[styles.drawer, { backgroundColor: theme.card, transform: [{ translateX: slideIn }] }]}>
            <Pressable onPress={() => {}}>
              <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
                <AppLogo size={44} />
                <Text style={[styles.drawerTitle, { color: theme.primary }]}>CLASS ATTENDANCE</Text>
                <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>v1.2.0</Text>
              </View>
              <ScrollView>
                {menuItems.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.menuItem, { backgroundColor: isDark ? 'rgba(96,165,250,0.08)' : '#F8FAFC' }]}
                    onPress={item.action}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: theme.primaryLight }]}>
                      <Icon name={item.icon} color={theme.primary} size={20} />
                    </View>
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <View style={styles.bottomLinks}>
                  <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/privacy'); }}>
                    <Text style={[styles.bottomLink, { color: theme.primary }]}>Privacy</Text>
                  </TouchableOpacity>
                  <Text style={{ color: theme.textMuted }}> · </Text>
                  <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/disclaimer'); }}>
                    <Text style={[styles.bottomLink, { color: theme.primary }]}>Disclaimer</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.footerBox}>
                  <Text style={[styles.footerTxt, { color: theme.textMuted }]}>Developed by Vishal Kumar</Text>
                  <Text style={[styles.footerSub, { color: theme.textMuted }]}>Design to Development</Text>
                </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    paddingTop: 70, paddingBottom: 50, paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    position: 'relative',
    minHeight: 340,
  },
  heroIcons: {
    position: 'absolute', top: 50, right: 16,
    flexDirection: 'row', gap: 8, zIndex: 10,
  },
  heroIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoWrap: {
    width: 120, height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  typeWrap: { marginTop: 12, minHeight: 30, justifyContent: 'center' },
  typeText: {
    color: '#fff', fontSize: 15, fontWeight: '600',
    letterSpacing: 0.3, textAlign: 'center',
  },

  content: { padding: 24, paddingTop: 28 },
  q1: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  q2: { fontSize: 13, marginTop: 6, marginBottom: 22, textAlign: 'center' },

  roleGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12, justifyContent: 'center',
  },
  roleCard: {
    width: '47%', padding: 18,
    borderRadius: Radius.lg, borderWidth: 1.5,
    alignItems: 'center', ...Shadow.sm,
    minHeight: 130,
  },
  roleIcon: { fontSize: 34, marginBottom: 10 },
  roleLabel: { fontSize: 14, fontWeight: '800' },
  roleDesc: { fontSize: 10, marginTop: 4, textAlign: 'center' },

  footerOrg: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 28 },
  footerVer: { fontSize: 11, textAlign: 'center', marginTop: 4 },
  footerDev: { fontSize: 11, textAlign: 'center', marginTop: 2 },

  // Drawer
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    position: 'absolute', top: 80, right: 10,
    width: 280, maxHeight: '80%',
    borderRadius: Radius.lg, overflow: 'hidden',
    ...Shadow.lg,
  },
  drawerHeader: { padding: 16, borderBottomWidth: 1, alignItems: 'center' },
  drawerTitle: { fontSize: 14, fontWeight: '800', letterSpacing: 1, marginTop: 6 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    marginHorizontal: 10, marginTop: 6,
    borderRadius: Radius.md,
  },
  menuIconBox: {
    width: 32, height: 32, borderRadius: Radius.sm,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuLabel: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: 16, marginTop: 14, marginBottom: 10 },
  bottomLinks: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  bottomLink: { fontSize: 13, fontWeight: '700' },
  footerBox: { padding: 14, alignItems: 'center' },
  footerTxt: { fontSize: 11, fontWeight: '600' },
  footerSub: { fontSize: 10, marginTop: 2 },
});
