
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

const EXAMPLE_HABITS = [
  { name: 'Exercise', emoji: '💪', minimumAction: '1 push-up' },
  { name: 'Read', emoji: '📚', minimumAction: '1 page' },
  { name: 'Meditate', emoji: '🧘', minimumAction: '1 minute' },
  { name: 'Write', emoji: '✍️', minimumAction: '1 sentence' },
  { name: 'Learn', emoji: '🎓', minimumAction: '1 lesson' },
  { name: 'Create', emoji: '🎨', minimumAction: '1 sketch' },
];

const EMOJI_OPTIONS = ['💪', '📚', '🧘', '✍️', '🎓', '🎨', '🏃', '🎵', '🍎', '💧', '😴', '🧠'];

interface HabitInput {
  name: string;
  emoji: string;
  minimumAction: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { createHabits } = useHabits();
  const [step, setStep] = useState(1);
  const [habits, setHabits] = useState<HabitInput[]>([
    { name: '', emoji: '💪', minimumAction: '' },
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const updateHabit = (index: number, field: keyof HabitInput, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], [field]: value };
    setHabits(newHabits);
  };

  const addHabit = () => {
    if (habits.length < 3) {
      setHabits([...habits, { name: '', emoji: '📚', minimumAction: '' }]);
    }
  };

  const removeHabit = (index: number) => {
    if (habits.length > 1) {
      setHabits(habits.filter((_, i) => i !== index));
    }
  };

  const applyExample = (example: typeof EXAMPLE_HABITS[0], index: number) => {
    updateHabit(index, 'name', example.name);
    updateHabit(index, 'emoji', example.emoji);
    updateHabit(index, 'minimumAction', example.minimumAction);
  };

  const handleFinish = async () => {
    const validHabits = habits.filter(
      (h) => h.name.trim() && h.minimumAction.trim()
    );

    if (validHabits.length === 0) {
      console.log('Please add at least one habit');
      return;
    }

    try {
      setIsCreating(true);
      console.log('[Onboarding] Creating habits:', validHabits);
      await createHabits(validHabits);
      console.log('[Onboarding] Habits created successfully, navigating to home');
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('[Onboarding] Failed to create habits:', error);
      // Show error to user
      alert('Failed to create habits. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = habits.some((h) => h.name.trim() && h.minimumAction.trim());

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Setup Your Habits',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>The Philosophy</Text>
            <Text style={styles.subtitle}>
              You don&apos;t need perfect days.{'\n'}
              You just need non-zero days.
            </Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                • Complete at least one tiny action per day{'\n'}
                • Miss a day and your streak resets{'\n'}
                • Progress over perfection
              </Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(2)}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Create Your Habits</Text>
            <Text style={styles.subtitle}>
              Choose up to 3 micro-habits.{'\n'}
              Keep them small and achievable.
            </Text>

            {/* Example Habits */}
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Quick Examples:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {EXAMPLE_HABITS.map((example, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.exampleChip}
                    onPress={() => applyExample(example, habits.length - 1)}
                  >
                    <Text style={styles.exampleEmoji}>{example.emoji}</Text>
                    <Text style={styles.exampleText}>{example.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Habit Inputs */}
            {habits.map((habit, index) => (
              <View key={index} style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <Text style={styles.habitNumber}>Habit {index + 1}</Text>
                  {habits.length > 1 && (
                    <TouchableOpacity onPress={() => removeHabit(index)}>
                      <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Emoji Selector */}
                <Text style={styles.inputLabel}>Choose an emoji:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                  {EMOJI_OPTIONS.map((emoji, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.emojiOption,
                        habit.emoji === emoji && styles.emojiOptionSelected,
                      ]}
                      onPress={() => updateHabit(index, 'emoji', emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.inputLabel}>Habit name:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Exercise"
                  placeholderTextColor={colors.textSecondary}
                  value={habit.name}
                  onChangeText={(text) => updateHabit(index, 'name', text)}
                />

                <Text style={styles.inputLabel}>Minimum action:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 1 push-up"
                  placeholderTextColor={colors.textSecondary}
                  value={habit.minimumAction}
                  onChangeText={(text) => updateHabit(index, 'minimumAction', text)}
                />
              </View>
            ))}

            {habits.length < 3 && (
              <TouchableOpacity style={styles.addButton} onPress={addHabit}>
                <Text style={styles.addButtonText}>+ Add Another Habit</Text>
              </TouchableOpacity>
            )}

            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ Warning: Miss any day and your streak resets to 0
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, !canProceed && styles.primaryButtonDisabled]}
              onPress={handleFinish}
              disabled={!canProceed || isCreating}
            >
              <Text style={styles.primaryButtonText}>
                {isCreating ? 'Creating...' : 'Start My Journey'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 28,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 28,
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  exampleChip: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exampleEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  exampleText: {
    fontSize: 14,
    color: colors.text,
  },
  habitCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  removeButton: {
    fontSize: 14,
    color: colors.highlight,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  emojiScroll: {
    marginBottom: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiOptionSelected: {
    backgroundColor: colors.primary,
  },
  emojiText: {
    fontSize: 24,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.highlight,
  },
  warningText: {
    fontSize: 14,
    color: colors.highlight,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
