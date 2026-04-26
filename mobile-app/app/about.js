import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { Radius, Shadow } from '../lib/theme';
import Navbar from '../components/Navbar';
import VerifiedBadge from '../components/VerifiedBadge';

// Photos are in /mobile-app/assets/devs/ folder as vishal.jpg & ayush.jpg
const developers = [
  {
    name: 'Vishal Kumar',
    role: 'Full Stack Developer',
    tags: ['Backend', 'Frontend', 'Design', 'Deployment'],
    branch: 'CSE • 2023-27',
    linkedin: 'https://www.linkedin.com/in/thecuriousvishal/',
    initials: 'VK',
    lead: true,
    image: require('../assets/devs/vishal.jpg'),
  },
  {
    name: 'Ayush Kumar',
    role: 'Frontend Developer + Testing',
    tags: ['Frontend', 'Testing', 'QA'],
    branch: 'CSE • 2023-27',
    linkedin: 'https://www.linkedin.com/in/ayush-kumar-793733309/',
    initials: 'AK',
    lead: false,
    image: require('../assets/devs/ayush.jpg'),
  },
];

export default function About() {
  const { theme } = useTheme();
  const openLink = (url) => Linking.openURL(url).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Navbar subtitle="About Developers" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={[styles.welcomeCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.welcomeTitle}>Welcome to Class Attendance :)</Text>
        </View>

        <View style={[styles.introCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.introTxt, { color: theme.textSecondary }]}>
            This app is developed by the students of{'\n'}
            <Text style={{ color: theme.primary, fontWeight: '800' }}>RRSDCE Begusarai</Text>
          </Text>
        </View>

        <Text style={[styles.teamTitle, { color: theme.primary }]}>Team Class Attendance</Text>

        {developers.map((dev, idx) => (
          <View key={idx} style={[styles.devCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Square with rounded corners (NOT circle) — as requested */}
            <View style={[styles.avatar, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
              {dev.image ? (
                <Image source={dev.image} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <Text style={[styles.avatarInit, { color: theme.primary }]}>{dev.initials}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <Text style={[styles.devName, { color: theme.text }]}>{dev.name}</Text>
              <VerifiedBadge size={14} org="RRSDCE Begusarai" />
            </View>

            <Text style={[styles.devRole, { color: theme.primary }]}>
              {dev.lead ? 'PROJECT LEAD' : 'TEAM MEMBER'}
            </Text>
            <Text style={[styles.devBranch, { color: theme.textMuted }]}>{dev.branch}</Text>

            <View style={styles.tagRow}>
              {dev.tags.map(t => (
                <View key={t} style={[styles.tag, { backgroundColor: theme.warningLight }]}>
                  <Text style={[styles.tagTxt, { color: theme.warning }]}>{t}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.linkedinBtn, { borderColor: theme.border, backgroundColor: '#0077B5' }]}
              onPress={() => openLink(dev.linkedin)}
              activeOpacity={0.7}
            >
              <Text style={styles.linkedinTxt}>in</Text>
            </TouchableOpacity>

            <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>{dev.role}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerTxt, { color: theme.primary, fontWeight: '700' }]}>
            Developed by Vishal Kumar
          </Text>
          <Text style={[styles.footerSub, { color: theme.textMuted }]}>
            Design to Development
          </Text>
          <Text style={[styles.footerCopy, { color: theme.textMuted }]}>
            © 2026 RRSDCE Begusarai
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeCard: { padding: 20, borderRadius: Radius.lg, marginBottom: 12, alignItems: 'center', ...Shadow.md },
  welcomeTitle: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  introCard: { padding: 18, borderRadius: Radius.lg, marginBottom: 20, alignItems: 'center', borderWidth: 1 },
  introTxt: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  teamTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 16, letterSpacing: 0.5 },

  devCard: { padding: 20, borderRadius: Radius.lg, marginBottom: 16, alignItems: 'center', borderWidth: 1, ...Shadow.sm },

  // SQUARE with rounded corners — as per feedback (no circular)
  avatar: {
    width: 110, height: 110, borderRadius: 20,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarInit: { fontSize: 38, fontWeight: '800' },

  devName: { fontSize: 19, fontWeight: '800' },
  devRole: { fontSize: 12, fontWeight: '800', marginTop: 4, letterSpacing: 1 },
  devBranch: { fontSize: 12, marginTop: 2 },

  tagRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  tagTxt: { fontSize: 11, fontWeight: '700' },

  linkedinBtn: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 14,
  },
  linkedinTxt: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: '#fff' },

  roleDesc: { fontSize: 12, marginTop: 8, textAlign: 'center' },

  footer: { padding: 20, alignItems: 'center', marginTop: 8 },
  footerTxt: { fontSize: 14 },
  footerSub: { fontSize: 12, marginTop: 4 },
  footerCopy: { fontSize: 11, marginTop: 12 },
});
