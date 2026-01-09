
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_TIME_KEY = '@notification_time';
const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkNotificationPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      const time = await AsyncStorage.getItem(NOTIFICATION_TIME_KEY);
      
      if (enabled !== null) {
        setNotificationsEnabled(enabled === 'true');
      }
      
      if (time !== null) {
        setNotificationTime(new Date(time));
      } else {
        // Default to 8 PM
        const defaultTime = new Date();
        defaultTime.setHours(20, 0, 0, 0);
        setNotificationTime(defaultTime);
      }
    } catch (error) {
      console.error('[Settings] Failed to load settings:', error);
    }
  };

  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'web') {
      setHasPermission(false);
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Notifications are not available on web.');
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in your device settings to receive daily reminders.'
      );
    }
    
    return granted;
  };

  const scheduleNotification = async (time: Date) => {
    if (Platform.OS === 'web') return;

    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!notificationsEnabled) return;

      // Schedule daily notification
      const trigger = {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      };

      const motivationalMessages = [
        "Don't let today be a zero.",
        "One small action keeps the streak alive.",
        "Just do something.",
        "Your streak is waiting for you.",
        "Make today count.",
        "Progress over perfection.",
        "Don't break the chain.",
      ];

      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Non-Zero Days',
          body: randomMessage,
          sound: true,
        },
        trigger,
      });

      console.log('[Settings] Notification scheduled for', time.toLocaleTimeString());
    } catch (error) {
      console.error('[Settings] Failed to schedule notification:', error);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
    }

    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, value.toString());
    
    if (value) {
      await scheduleNotification(notificationTime);
    } else {
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    }
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    
    if (selectedTime) {
      setNotificationTime(selectedTime);
      await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, selectedTime.toISOString());
      
      if (notificationsEnabled) {
        await scheduleNotification(selectedTime);
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          title: 'Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={24}
                color={colors.primary}
              />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Daily Reminder</Text>
                <Text style={styles.settingDescription}>
                  Get reminded to check in every day
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.card, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>

          {notificationsEnabled && (
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="access-time"
                  size={24}
                  color={colors.secondary}
                />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Reminder Time</Text>
                  <Text style={styles.settingDescription}>
                    {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={notificationTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Premium Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => router.push('/premium')}
          >
            <View style={styles.premiumHeader}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={32}
                color={colors.secondary}
              />
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumDescription}>
                  Unlock more habits, streak freeze, and themes
                </Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Non-Zero Days v1.0.0
            </Text>
            <Text style={styles.infoSubtext}>
              You don&apos;t need perfect days. You just need non-zero days.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Close</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  changeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  changeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  premiumCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumText: {
    marginLeft: 16,
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: colors.card,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
