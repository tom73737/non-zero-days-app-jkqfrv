
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function PremiumScreen() {
  const router = useRouter();

  const features = [
    {
      icon: 'star',
      title: 'Up to 6 Habits',
      description: 'Double your habit capacity from 3 to 6',
    },
    {
      icon: 'shield-checkmark',
      title: 'Streak Freeze',
      description: 'Save your streak once per month if you miss a day',
    },
    {
      icon: 'color-palette',
      title: 'Custom Themes',
      description: 'Personalize your app with beautiful color schemes',
    },
    {
      icon: 'trending-up',
      title: 'Advanced Stats',
      description: 'Detailed analytics and progress insights',
    },
  ];

  const handlePurchase = (plan: 'lifetime' | 'monthly') => {
    console.log('[Premium] Purchase initiated:', plan);
    // TODO: Backend Integration - Integrate Superwall paywall here
    // This will be implemented by the backend integration agent
    alert('Premium purchase coming soon! This will be integrated with Superwall.');
  };

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          title: 'Go Premium',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.badge}>⭐ PREMIUM</Text>
          <Text style={styles.title}>Unlock Your Full Potential</Text>
          <Text style={styles.subtitle}>
            Take your habit journey to the next level with premium features
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <IconSymbol
                  ios_icon_name={feature.icon}
                  android_material_icon_name={feature.icon}
                  size={28}
                  color={colors.secondary}
                />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingSection}>
          <Text style={styles.pricingTitle}>Choose Your Plan</Text>

          <TouchableOpacity
            style={styles.pricingCard}
            onPress={() => handlePurchase('lifetime')}
          >
            <View style={styles.pricingHeader}>
              <View>
                <Text style={styles.pricingLabel}>BEST VALUE</Text>
                <Text style={styles.pricingName}>Lifetime Access</Text>
              </View>
              <Text style={styles.pricingPrice}>£2.99</Text>
            </View>
            <Text style={styles.pricingDescription}>
              One-time payment. Yours forever.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricingCard, styles.pricingCardSecondary]}
            onPress={() => handlePurchase('monthly')}
          >
            <View style={styles.pricingHeader}>
              <View>
                <Text style={styles.pricingName}>Monthly</Text>
              </View>
              <Text style={styles.pricingPrice}>£0.99/mo</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Cancel anytime. Billed monthly.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guaranteeCard}>
          <IconSymbol
            ios_icon_name="checkmark.shield.fill"
            android_material_icon_name="verified-user"
            size={32}
            color={colors.accent}
          />
          <Text style={styles.guaranteeText}>
            7-day money-back guarantee. No questions asked.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>Maybe Later</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: colors.secondary,
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: 24,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  pricingCardSecondary: {
    borderColor: colors.primary,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 4,
  },
  pricingName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricingPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  pricingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  guaranteeText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 16,
    flex: 1,
    lineHeight: 20,
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
