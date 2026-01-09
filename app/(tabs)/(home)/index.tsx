
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useHabits } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { habits, todayCheckIn, progress, loading, completeToday } = useHabits();
  const [isCompleting, setIsCompleting] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleCheckIn = async () => {
    if (todayCheckIn?.completed || isCompleting) return;

    try {
      setIsCompleting(true);
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Button animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await completeToday();
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const xpPercentage = (progress.currentXP / progress.xpForNextLevel) * 100;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show onboarding if no habits
  if (habits.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.onboardingContainer}>
          <Text style={styles.onboardingTitle}>Welcome to Non-Zero Days</Text>
          <Text style={styles.onboardingSubtitle}>
            You don&apos;t need perfect days.{'\n'}You just need non-zero days.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/onboarding')}
          >
            <Text style={styles.startButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Streak Counter */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{progress.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        {progress.currentStreak > 0 && (
          <Text style={styles.streakWarning}>
            Don&apos;t break the chain! Check in today.
          </Text>
        )}
      </View>

      {/* XP Progress Bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.levelText}>Level {progress.currentLevel}</Text>
          <Text style={styles.xpText}>
            {progress.currentXP} / {progress.xpForNextLevel} XP
          </Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBarFill, { width: `${xpPercentage}%` }]} />
        </View>
      </View>

      {/* Today's Habits */}
      <View style={styles.habitsSection}>
        <Text style={styles.sectionTitle}>Today&apos;s Habits</Text>
        {habits.map((habit, index) => (
          <View key={index} style={styles.habitItem}>
            <Text style={styles.habitEmoji}>{habit.emoji}</Text>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitAction}>{habit.minimumAction}</Text>
            </View>
            {todayCheckIn?.completed && (
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={24}
                color={colors.accent}
              />
            )}
          </View>
        ))}
      </View>

      {/* Check-in Button */}
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.checkInButton,
            todayCheckIn?.completed && styles.checkInButtonCompleted,
          ]}
          onPress={handleCheckIn}
          disabled={todayCheckIn?.completed || isCompleting}
        >
          <Text style={styles.checkInButtonText}>
            {todayCheckIn?.completed
              ? '✓ Completed Today'
              : isCompleting
              ? 'Checking In...'
              : 'I Did Something Today'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.totalDays}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{progress.longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  loadingText: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
  },
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  onboardingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  onboardingSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 28,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
  },
  startButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.highlight,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  streakLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  streakWarning: {
    fontSize: 14,
    color: colors.highlight,
    marginTop: 8,
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  xpText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  xpBarContainer: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  habitsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  habitEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  habitAction: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  checkInButton: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 16px rgba(99, 102, 241, 0.4)',
    elevation: 8,
  },
  checkInButtonCompleted: {
    backgroundColor: colors.accent,
  },
  checkInButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
