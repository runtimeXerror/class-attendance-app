import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Linking, Share, Pressable, Animated, Easing } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { useTheme } from '../lib/ThemeContext';
import { clearAuth, getAuth } from '../lib/api';
import { Radius, Shadow } from '../lib/theme';
import AppLogo from './AppLogo';
import Icon from './Icon';

export default function Navbar({ subtitle }) {
  const { theme, isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const hbRotate = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.timing(hbRotate, {
      toValue: menuOpen ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(slideIn, {
      toValue: menuOpen ? 0 : 300,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  const rotateDeg = hbRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Class Attendance App — built by Vishal Kumar for RRSDCE Begusarai!',
      });
    } catch {}
  };

  const goHome = async () => {
    setMenuOpen(false);
    // Go to role-specific dashboard if logged in, else home
    const { role } = await getAuth();
    if (role === 'superadmin') router.replace('/superadmin/dashboard');
    else if (role) router.replace(`/${role}/dashboard`);
    else router.replace('/');
  };

  const doLogout = async () => {
    setMenuOpen(false);
    await clearAuth();
    router.replace('/');
  };

  const menuItems = [
    { icon: 'home',   label: 'Home', action: goHome },
    { icon: 'info',   label: 'About App', action: () => { setMenuOpen(false); router.push('/about-app'); } },
    { icon: 'users',  label: 'About Developers', action: () => { setMenuOpen(false); router.push('/about'); } },
    { icon: 'edit',   label: 'Write a Review', action: () => Linking.openURL('https://play.google.com/store') },
    { icon: 'share',  label: 'Share this App', action: shareApp },
    { icon: 'logout', label: 'Logout', action: doLogout, danger: true },
  ];

  return (
    <>
      <View style={[styles.navbar, { backgroundColor: theme.navbar }]}>
        <View style={styles.logoBox}>
          <AppLogo size={32} animate={false} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandName}>Class Attendance</Text>
          {subtitle ? <Text style={styles.brandSub}>{subtitle}</Text> : null}
        </View>

        {/* Theme toggle icon */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={toggle}
          activeOpacity={0.6}
        >
          <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>

        {/* Animated hamburger/cross */}
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setMenuOpen(!menuOpen)}
          activeOpacity={0.6}
        >
          <Animated.Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', transform: [{ rotate: rotateDeg }] }}>
            {menuOpen ? '✕' : '☰'}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <Animated.View
            style={[
              styles.drawer,
              { backgroundColor: theme.card, transform: [{ translateX: slideIn }] },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.appName, { color: theme.primary }]}>CLASS ATTENDANCE</Text>
              </View>

              <ScrollView>
                {menuItems.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.menuItem,
                      { backgroundColor: isDark ? 'rgba(129,140,248,0.08)' : '#F8FAFC' },
                    ]}
                    onPress={item.action}
                    activeOpacity={0.6}
                  >
                    <View style={[
                      styles.menuIconBox,
                      { backgroundColor: item.danger ? theme.dangerLight : theme.primaryLight },
                    ]}>
                      <Icon
                        name={item.icon}
                        color={item.danger ? theme.danger : theme.primary}
                        size={20}
                      />
                    </View>
                    <Text style={[styles.menuLabel, { color: item.danger ? theme.danger : theme.text }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.bottomLinks}>
                  <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/privacy'); }}>
                    <Text style={[styles.bottomLink, { color: theme.primary }]}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={[styles.dot, { color: theme.textMuted }]}> · </Text>
                  <TouchableOpacity onPress={() => { setMenuOpen(false); router.push('/disclaimer'); }}>
                    <Text style={[styles.bottomLink, { color: theme.primary }]}>Disclaimer</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={[styles.footerTxt, { color: theme.textMuted }]}>Developed by Vishal Kumar</Text>
                  <Text style={[styles.footerSub, { color: theme.textMuted }]}>Design to Development</Text>
                </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 44, paddingHorizontal: 14, paddingBottom: 14, ...Shadow.md,
  },
  logoBox: {
    width: 42, height: 42, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  logoEmoji: { fontSize: 20 },
  brandName: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  brandSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },

  iconBtn: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 6,
  },
  hamburgerBtn: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    position: 'absolute', top: 88, right: 10,
    width: 280, maxHeight: '70%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  drawerHeader: {
    padding: 16, borderBottomWidth: 1,
    alignItems: 'center',
  },
  appName: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },

  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    marginHorizontal: 10, marginTop: 8,
    borderRadius: Radius.md,
  },
  menuIconBox: {
    width: 32, height: 32, borderRadius: Radius.sm,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { fontSize: 14, fontWeight: '600' },

  divider: { height: 1, marginHorizontal: 16, marginTop: 14, marginBottom: 10 },
  bottomLinks: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingVertical: 4,
  },
  bottomLink: { fontSize: 13, fontWeight: '700' },
  dot: { fontSize: 13 },

  footer: { padding: 14, alignItems: 'center' },
  footerTxt: { fontSize: 11, fontWeight: '600' },
  footerSub: { fontSize: 10, marginTop: 2 },
});

// Blue verified tick component for reuse
export const VerifiedTick = ({ size = 14, color }) => (
  <Text style={{ color: color || '#3B82F6', fontSize: size, marginLeft: 4 }}>✓</Text>
);
