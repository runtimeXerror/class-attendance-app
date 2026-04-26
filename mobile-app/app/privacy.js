import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { Radius } from '../lib/theme';
import Navbar from '../components/Navbar';

export default function Privacy() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Privacy Policy" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: theme.text }]}>Privacy Policy</Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>Last updated: April 2026</Text>

        <Section theme={theme} title="1. Information We Collect">
          We collect only what is needed to run the attendance system:
          {'\n\n'}• Reg No + DOB (student login)
          {'\n'}• Email + password (admin/teacher login)
          {'\n'}• Attendance records (P/A with date)
          {'\n'}• Name, phone (if provided)
        </Section>

        <Section theme={theme} title="2. How We Use Information">
          Your data is used only for:
          {'\n\n'}• Authenticating login
          {'\n'}• Displaying attendance
          {'\n'}• Generating reports
          {'\n'}• Internal college communication
        </Section>

        <Section theme={theme} title="3. Data Storage">
          All data is stored securely on college-managed servers. Passwords are hashed with bcrypt.
          We do not share data with third parties.
        </Section>

        <Section theme={theme} title="4. Your Rights">
          You can request your data, correct errors, or delete your account via your branch admin.
        </Section>

        <Section theme={theme} title="5. Contact">
          For privacy concerns, contact your Branch Admin or email developer@rrsdce.edu.in
        </Section>

        <Text style={[styles.footer, { color: theme.textMuted }]}>© 2026 RRSDCE Begusarai</Text>
      </ScrollView>
    </View>
  );
}

const Section = ({ theme, title, children }) => (
  <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <Text style={[styles.h, { color: theme.primary }]}>{title}</Text>
    <Text style={[styles.p, { color: theme.textSecondary }]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800' },
  date: { fontSize: 12, marginTop: 4, marginBottom: 20 },
  section: { padding: 16, borderRadius: Radius.md, marginBottom: 12, borderWidth: 1 },
  h: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  p: { fontSize: 13, lineHeight: 20 },
  footer: { textAlign: 'center', fontSize: 11, marginTop: 20 },
});
