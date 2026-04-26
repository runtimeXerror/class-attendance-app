import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Radius } from '../lib/theme';

/**
 * SearchBar — reusable search input with clear button
 * Props: value, onChangeText, placeholder, theme
 */
export default function SearchBar({ value, onChangeText, placeholder = 'Search...', theme }) {
  return (
    <View style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={{ fontSize: 15, marginHorizontal: 10 }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text }]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={{ color: theme.textMuted, fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1,
    marginBottom: 10, paddingRight: 6,
    minHeight: 44,
  },
  input: { flex: 1, paddingVertical: 10, paddingRight: 10, fontSize: 14 },
  clearBtn: { padding: 8 },
});
