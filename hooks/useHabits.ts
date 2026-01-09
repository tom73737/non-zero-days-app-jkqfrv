
import { useState, useEffect } from 'react';
import { Habit, CheckIn, UserProgress, ProgressResponse, CheckInResponse } from '@/types/habit';
import { authenticatedGet, authenticatedPost } from '@/utils/api';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    currentXP: 0,
    currentLevel: 1,
    xpForNextLevel: 100,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[useHabits] Loading data from API...');

      // Fetch habits from API
      const habitsData = await authenticatedGet<Habit[]>('/api/habits');
      console.log('[useHabits] Habits loaded:', habitsData);
      setHabits(habitsData);

      // Fetch user progress (includes check-in status)
      const progressData = await authenticatedGet<ProgressResponse>('/api/progress');
      console.log('[useHabits] Progress loaded:', progressData);

      // Convert API response to frontend format
      setProgress({
        currentStreak: progressData.currentStreak,
        longestStreak: progressData.longestStreak,
        totalDays: progressData.totalDaysCompleted,
        currentXP: progressData.totalXp,
        currentLevel: progressData.level,
        xpForNextLevel: progressData.progressToNextLevel,
      });

      // Set today's check-in status
      const today = new Date().toISOString().split('T')[0];
      setTodayCheckIn({
        id: progressData.lastCheckinDate || '',
        date: today,
        completed: !progressData.canCheckinToday, // If can't check in, it means already completed
      });
    } catch (error) {
      console.error('[useHabits] Failed to load habits data:', error);
      // Set default values on error
      setHabits([]);
      setProgress({
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        currentXP: 0,
        currentLevel: 1,
        xpForNextLevel: 100,
      });
      const today = new Date().toISOString().split('T')[0];
      setTodayCheckIn({
        id: '',
        date: today,
        completed: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const completeToday = async () => {
    try {
      console.log('[useHabits] Submitting check-in to API...');

      // Submit check-in to API
      const checkInData = await authenticatedPost<CheckInResponse>('/api/checkin', {});
      console.log('[useHabits] Check-in completed:', checkInData);

      // Update local state with API response
      const today = new Date().toISOString().split('T')[0];
      setTodayCheckIn({
        id: today,
        date: today,
        completed: true,
      });

      // Update progress with API response
      setProgress({
        currentStreak: checkInData.currentStreak,
        longestStreak: checkInData.longestStreak,
        totalDays: checkInData.totalDaysCompleted,
        currentXP: checkInData.totalXp,
        currentLevel: checkInData.level,
        xpForNextLevel: checkInData.progressToNextLevel,
      });

      console.log('[useHabits] XP gained:', checkInData.xpAwarded);
      console.log('[useHabits] New level:', checkInData.level);
    } catch (error) {
      console.error('[useHabits] Failed to complete check-in:', error);
      throw error;
    }
  };

  const createHabits = async (newHabits: Omit<Habit, 'id' | 'createdAt' | 'isActive'>[]) => {
    try {
      console.log('[useHabits] Creating habits via API:', newHabits);

      // Create each habit via API (API expects one habit at a time)
      const createdHabits: Habit[] = [];
      for (const habit of newHabits) {
        const createdHabit = await authenticatedPost<Habit>('/api/habits', {
          name: habit.name,
          minimumAction: habit.minimumAction,
          emoji: habit.emoji || null,
        });
        createdHabits.push(createdHabit);
        console.log('[useHabits] Habit created:', createdHabit);
      }

      setHabits(createdHabits);
      console.log('[useHabits] All habits created successfully');
    } catch (error) {
      console.error('[useHabits] Failed to create habits:', error);
      throw error;
    }
  };

  return {
    habits,
    todayCheckIn,
    progress,
    loading,
    completeToday,
    createHabits,
    refreshData: loadData,
  };
}
