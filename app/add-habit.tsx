
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useHabits } from '@/hooks/useHabits';
import * as Haptics from 'expo-haptics';

const EMOJI_OPTIONS = ['💪', '📚', '🧘', '✍️', '🎓', '🎨', '🏃', '🎵', '🍎', '💧', '😴', '🧠', '🎯', '🌱', '🔥', '⚡'];

export default function AddHabitScreen() {
  const router = useRouter();
  const { habits, createHabits } = useHabits();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💪');
  const [minimumAction, setMinimumAction] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const canAddHabit = habits.length < 3;
  const canSave = name.trim() && minimumAction.trim();

  const handleSave = async () => {
    if (!canSave || !canAddHabit) return;

    try {
      setIsCreating(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      await createHabits([{ name, emoji, minimumAction }]);
      
      console.log('[AddHabit] Habit created successfully');
      router.back();
    } catch (error) {
      console.error('[AddHabit] Failed to create habit:', error);
      alert('Failed to create habit. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!canAddHabit) {
    return (
      <>
        <Stack.Screen
          options={{
            presentation: 'modal',
            title: 'Add Habit',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={styles.container}>
          <View style={styles.limitReachedContainer}>
            <Text style={styles.limitEmoji}>🔒</Text>
            <Text style={styles.limitTitle}>Habit Limit Reached</Text>
            <Text style={styles.limitText}>
              You&apos;ve reached the maximum of 3 habits in the free version.
            </Text>
            <Text style={styles.limitSubtext}>
              Upgrade to Premium to unlock up to 6 habits, streak freeze, and custom themes.
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                router.back();
                router.push('/premium');
              }}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          title: 'Add Habit',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create a New Habit</Text>
        <Text style={styles.subtitle}>
          Keep it small and achievable. Remember: progress over perfection.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Choose an emoji:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
            {EMOJI_OPTIONS.map((emojiOption, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.emojiOption,
                  emoji === emojiOption && styles.emojiOptionSelected,
                ]}
                onPress={() => {
                  setEmoji(emojiOption);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={styles.emojiText}>{emojiOption}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Habit name:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Exercise"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          <Text style={styles.label}>Minimum action:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1 push-up"
            placeholderTextColor={colors.textSecondary}
            value={minimumAction}
            onChangeText={setMinimumAction}
            maxLength={100}
          />

          <Text style={styles.helperText}>
            Make it so easy you can&apos;t say no. The goal is consistency, not intensity.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || isCreating}
        >
          <Text style={styles.saveButtonText}>
            {isCreating ? 'Creating...' : 'Create Habit'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 24 : 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  limitReachedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  limitEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  limitTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  limitText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  limitSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 12,
  },
  emojiScroll: {
    marginBottom: 8,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiOptionSelected: {
    backgroundColor: colors.primary,
  },
  emojiText: {
    fontSize: 28,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: colors.card,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
