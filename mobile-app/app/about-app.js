import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { Radius, Shadow } from '../lib/theme';
import Navbar from '../components/Navbar';
import AppLogo from '../components/AppLogo';

export default function AboutApp() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="About App" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.hero, { backgroundColor: theme.primary }]}>
          <AppLogo size={110} style={{ marginBottom: 10 }} />
          <Text style={styles.heroTitle}>Class Attendance</Text>
          <Text style={styles.heroVer}>Version 1.2.0</Text>
        </View>

        <Section theme={theme} title="📌 About">
          Class Attendance is a mobile-first attendance management system built exclusively for RRSDCE Begusarai.
          It brings real-time transparency to attendance marking, letting students, teachers, admins, and
          super admins work together on a single secure platform.
        </Section>

        <Section theme={theme} title="✨ Features">
          • Role-based access (Super Admin, Branch Admin, Teacher, Student){'\n'}
          • Batch-wise student management{'\n'}
          • Real-time attendance marking{'\n'}
          • Subject-wise percentage tracking{'\n'}
          • Detailed analytics with present/absent breakdown{'\n'}
          • Excel export for reports{'\n'}
          • Dark mode support{'\n'}
          • Verified profile badges
        </Section>

        <Section theme={theme} title="🏫 Institution">
          Rashtrakavi Ramdhari Singh Dinkar College of Engineering (RRSDCE){'\n'}
          Begusarai, Bihar{'\n'}
          Affiliated with Bihar Engineering University
        </Section>

        <Section theme={theme} title="🛠️ Built With">
          • React Native (Expo){'\n'}
          • FastAPI (Python){'\n'}
          • SQLite / Supabase{'\n'}
          • JWT Authentication
        </Section>

        <View style={[styles.footer, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.footerTxt, { color: theme.primary }]}>
            Made with ❤ from Begusarai, Bihar
          </Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>
            Design to Development by Vishal Kumar
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const Section = ({ theme, title, children }) => (
  <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <Text style={[styles.secTitle, { color: theme.primary }]}>{title}</Text>
    <Text style={[styles.secBody, { color: theme.textSecondary }]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: { padding: 24, borderRadius: Radius.lg, alignItems: 'center', marginBottom: 16, ...Shadow.md },
  logoWrap: {
    width: 92, height: 92, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroVer: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
  section: { padding: 16, borderRadius: Radius.md, marginBottom: 12, borderWidth: 1 },
  secTitle: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
  secBody: { fontSize: 13, lineHeight: 22 },
  footer: { padding: 18, borderRadius: Radius.md, alignItems: 'center', marginTop: 8 },
  footerTxt: { fontSize: 14, fontWeight: '700' },
  footerSub: { fontSize: 12, marginTop: 4 },
});
