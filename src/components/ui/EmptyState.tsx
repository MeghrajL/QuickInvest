import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

interface EmptyStateProps {
  message: string;
  suggestion?: string;
}

export function EmptyState({ message, suggestion }: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {suggestion && (
        <ThemedText style={styles.suggestion} themeColor="textSecondary">
          {suggestion}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  suggestion: {
    fontSize: 14,
    textAlign: 'center',
  },
});
