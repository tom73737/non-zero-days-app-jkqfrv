
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useHabits } from '@/hooks/useHabits';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProgressScreen() {
  const { progress, habits, loading } = useHabits();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Your Progress</Text>

      {/* Level Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{progress.currentLevel}</Text>
        </View>
        <Text style={styles.levelTitle}>Level {progress.currentLevel}</Text>
        <Text style={styles.levelSubtitle}>
          {progress.currentXP} / {progress.xpForNextLevel} XP to next level
        </Text>
        <View style={styles.xpBarContainer}>
          <View
            style={[
              styles.xpBarFill,
              { width: `${(progress.currentXP / progress.xpForNextLevel) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <IconSymbol
            ios_icon_name="flame.fill"
            android_material_icon_name="local-fire-department"
            size={32}
            color={colors.highlight}
          />
          <Text style={styles.statNumber}>{progress.currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statCard}>
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={32}
            color={colors.secondary}
          />
          <Text style={styles.statNumber}>{progress.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>

        <View style={styles.statCard}>
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="calendar-today"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.statNumber}>{progress.totalDays}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>

        <View style={styles.statCard}>
          <IconSymbol
            ios_icon_name="chart.bar.fill"
            android_material_icon_name="bar-chart"
            size={32}
            color={colors.accent}
          />
          <Text style={styles.statNumber}>{habits.length}</Text>
          <Text style={styles.statLabel}>Active Habits</Text>
        </View>
      </View>

      {/* Habits List */}
      <View style={styles.habitsSection}>
        <Text style={styles.sectionTitle}>Your Habits</Text>
        {habits.map((habit, index) => (
          <View key={index} style={styles.habitCard}>
            <Text style={styles.habitEmoji}>{habit.emoji}</Text>
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{habit.name}</Text>
              <Text style={styles.habitAction}>{habit.minimumAction}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationCard}>
        <Text style={styles.motivationText}>
          {progress.currentStreak === 0
            ? "Start your journey today! Every streak begins with day one."
            : progress.currentStreak < 7
            ? "You're building momentum! Keep going."
            : progress.currentStreak < 30
            ? "Amazing progress! You're forming lasting habits."
            : "You're unstoppable! This is who you are now."}
        </Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  levelCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  levelSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  xpBarContainer: {
    width: '100%',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
  habitCard: {
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
  motivationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  motivationText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
});
