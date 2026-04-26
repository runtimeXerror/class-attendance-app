import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, ScrollView, Platform,
  TouchableOpacity, Animated, Easing, KeyboardAvoidingView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api, saveAuth, toLocalDateString } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { Radius, Shadow } from '../lib/theme';
import { AnimatedButton } from '../components/Animated';
import AppLogo from '../components/AppLogo';

const roleInfo = {
  superadmin: { label: 'Super Admin', icon: '👨‍💻', desc: 'System administration access' },
  admin:      { label: 'Admin',       icon: '👨‍💼', desc: 'Branch admin access' },
  teacher:    { label: 'Teacher',     icon: '👨‍🏫', desc: 'Faculty access' },
  student:    { label: 'Student',     icon: '🎓',   desc: 'Student access' },
};

export default function LoginPage() {
  const { theme } = useTheme();
  const { role } = useLocalSearchParams();
  const info = roleInfo[role] || roleInfo.admin;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState(new Date(2005, 0, 1));
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
    // Continuous float on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const handleLogin = async () => {
    setLoading(true);
    try {
      let body;
      if (role === 'student') {
        if (!regNo) { Alert.alert('Oops', 'Registration Number required'); setLoading(false); return; }
        body = { role, reg_no: regNo, dob: toLocalDateString(dob) };
      } else {
        if (!email || !password) { Alert.alert('Oops', 'Email and password required'); setLoading(false); return; }
        body = { role, email, password };
      }
      const res = await api.post('/api/login', body);
      await saveAuth(res.data);
      if (res.data.must_change_password) {
        Alert.alert(
          '💡 Change Your Password',
          "Looks like you're using a default password.\nFor security, change it from Settings.",
          [{ text: 'Got it' }]
        );
      }
      const target = res.data.role === 'superadmin' ? '/superadmin/dashboard' : `/${res.data.role}/dashboard`;
      router.replace(target);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.detail || err.message || 'Could not connect');
    }
    setLoading(false);
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (event.type === 'set' && selectedDate) setDob(selectedDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: theme.bg }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {/* HERO */}
          <View style={[styles.hero, { backgroundColor: theme.primary }]}>
            {/* Single clean back arrow - no boxed bg, no overlap */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.5}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ translateY: floatY }], marginBottom: 12 }}>
              <AppLogo size={90} />
            </Animated.View>
            <Text style={styles.heroTitle}>Login to continue</Text>
            <Text style={styles.heroRole}>{info.icon} {info.label}</Text>
          </View>

          {/* Form */}
          <View style={styles.content}>
            <View style={[styles.roleBanner, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.roleBannerTxt, { color: theme.primary }]}>{info.desc}</Text>
            </View>

            {role === 'student' ? (
              <>
                <FL theme={theme}>Registration Number</FL>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  value={regNo} onChangeText={setRegNo}
                  placeholder="e.g. 23105125023"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  autoComplete="username"
                  textContentType="username"
                />
                <FL theme={theme}>Date of Birth</FL>
                <TouchableOpacity
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: 'center' }]}
                  onPress={() => setShowPicker(true)} activeOpacity={0.7}
                >
                  <Text style={{ color: theme.text, fontSize: 15 }}>
                    📅  {toLocalDateString(dob)}
                  </Text>
                </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={dob} mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            ) : (
              <>
                <FL theme={theme}>Email</FL>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  value={email} onChangeText={setEmail}
                  placeholder="email@rrsdce.edu"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <FL theme={theme}>Password</FL>
                {/* Password field — autoComplete & textContentType let Android/Chrome offer save */}
                <View style={[styles.pwdWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.pwdInput, { color: theme.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={!showPwd}
                    autoComplete="password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPwd(!showPwd)}
                    style={styles.eyeBtn}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 18 }}>{showPwd ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <AnimatedButton onPress={handleLogin} disabled={loading} color={theme.primary} style={{ marginTop: 24 }}>
              {loading ? 'Signing in...' : `Login as ${info.label}  →`}
            </AnimatedButton>

            <Text style={[styles.hint, { color: theme.textMuted }]}>
              🔒 Logged in sessions stay active for 30 days
            </Text>

            <Text style={[styles.footer, { color: theme.textMuted }]}>
              @RRSDCE Begusarai • v1.2.0{'\n'}Developed by Vishal Kumar
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const FL = ({ children, theme }) => (
  <Text style={[styles.label, { color: theme.textSecondary }]}>{children}</Text>
);

const styles = StyleSheet.create({
  hero: {
    paddingTop: 70, paddingBottom: 36, paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 44, left: 14,
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: {
    color: '#fff', fontSize: 38, fontWeight: '300',
    lineHeight: 38, marginTop: -4,
  },
  heroLogoWrap: {
    width: 76, height: 76, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroRole: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 6, fontWeight: '700' },

  content: { padding: 24 },
  roleBanner: { padding: 12, borderRadius: Radius.md, marginBottom: 16, alignItems: 'center' },
  roleBannerTxt: { fontSize: 13, fontWeight: '700' },

  label: { fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: { padding: 14, borderRadius: Radius.md, borderWidth: 1, fontSize: 15, minHeight: 50 },

  pwdWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: Radius.md, minHeight: 50, paddingRight: 6,
  },
  pwdInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 10 },

  hint: { textAlign: 'center', marginTop: 16, fontSize: 11, fontStyle: 'italic' },
  footer: { textAlign: 'center', marginTop: 28, fontSize: 11, lineHeight: 16 },
});
