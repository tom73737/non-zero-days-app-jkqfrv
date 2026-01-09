
// API Response Types - Match backend OpenAPI spec

export interface Habit {
  id: string;
  name: string;
  emoji: string | null;
  minimumAction: string;
  isActive: boolean;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  date: string;
  completed: boolean;
}

// API response from POST /api/checkin
export interface CheckInResponse {
  currentStreak: number;
  longestStreak: number;
  level: number;
  totalXp: number;
  progressToNextLevel: number;
  totalDaysCompleted: number;
  xpAwarded: number;
}

// API response from GET /api/progress
export interface ProgressResponse {
  currentStreak: number;
  longestStreak: number;
  level: number;
  totalXp: number;
  progressToNextLevel: number;
  totalDaysCompleted: number;
  lastCheckinDate: string | null;
  canCheckinToday: boolean;
}

// Frontend display type
export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  currentXP: number;
  currentLevel: number;
  xpForNextLevel: number;
}

// API response from GET /api/progress/history
export interface CheckInHistory {
  checkinDate: string;
  completedAt: string;
}
