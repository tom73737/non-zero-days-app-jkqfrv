
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const motivationalMessages = [
      "Don't let today be a zero.",
      "One small action keeps the streak alive.",
      "Just do something.",
      "Your streak is waiting for you.",
      "Make today count.",
      "Progress over perfection.",
      "Don't break the chain.",
      "Every day is a chance to grow.",
      "Small steps lead to big changes.",
      "You've got this!",
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Non-Zero Days',
        body: randomMessage,
        sound: true,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log('[Notifications] Daily reminder scheduled for', `${hour}:${minute}`);
  } catch (error) {
    console.error('[Notifications] Failed to schedule notification:', error);
    throw error;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] All notifications cancelled');
  } catch (error) {
    console.error('[Notifications] Failed to cancel notifications:', error);
  }
}

export async function getScheduledNotifications() {
  if (Platform.OS === 'web') {
    return [];
  }

  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('[Notifications] Failed to get scheduled notifications:', error);
    return [];
  }
}
