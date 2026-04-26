import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { Radius } from '../lib/theme';
import Navbar from '../components/Navbar';

export default function Disclaimer() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="Disclaimer" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.title, { color: theme.text }]}>⚠️ Disclaimer</Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>Effective April 2026</Text>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.body, { color: theme.textSecondary }]}>
            The information provided by <Text style={{ fontWeight: '700', color: theme.text }}>Class Attendance App</Text> is for academic administration purposes only.
            {'\n\n'}
            This app is a student-developed project for RRSDCE Begusarai. While we strive for accuracy, the app is provided "as is" without warranty.
            {'\n\n'}
            <Text style={{ fontWeight: '700', color: theme.text }}>Official Records:</Text> Attendance data is meant to support, not replace, the official college records. For official purposes (exam eligibility, transcripts), refer to the college office.
            {'\n\n'}
            <Text style={{ fontWeight: '700', color: theme.text }}>Accuracy:</Text> If you notice discrepancies, contact your teacher or branch admin immediately.
            {'\n\n'}
            <Text style={{ fontWeight: '700', color: theme.text }}>Limitations:</Text> We are not liable for any loss arising from use of this app (data loss, network issues, technical failures).
          </Text>
        </View>

        <View style={[styles.hint, { backgroundColor: theme.warningLight }]}>
          <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
            © RRSDCE Begusarai{'\n'}Developed by Vishal Kumar{'\n'}Design to Development
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800' },
  date: { fontSize: 12, marginTop: 4, marginBottom: 20 },
  section: { padding: 16, borderRadius: Radius.md, marginBottom: 16, borderWidth: 1 },
  body: { fontSize: 13, lineHeight: 22 },
  hint: { padding: 16, borderRadius: Radius.md },
});
