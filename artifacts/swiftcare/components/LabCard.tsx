import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Lab } from "@/data/labs";
import { useColors } from "@/hooks/useColors";

interface LabCardProps {
  lab: Lab;
}

export function LabCard({ lab }: LabCardProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => router.push(`/lab/${lab.id}` as never)}
    >
      <Image source={{ uri: lab.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.topRow}>
          {lab.isAccredited && (
            <View style={[styles.badge, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>Accredited</Text>
            </View>
          )}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.foreground }]}>{lab.rating}</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {lab.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{lab.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{lab.openingHours}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="pricetag-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{lab.priceRange}</Text>
        </View>

        <Text style={[styles.testsLabel, { color: colors.mutedForeground }]}>
          Available tests:
        </Text>
        <View style={styles.tests}>
          {lab.availableTests.slice(0, 4).map((t) => (
            <View key={t.name} style={[styles.testTag, { backgroundColor: colors.secondary + "12" }]}>
              <Text style={[styles.testText, { color: colors.secondary }]}>{t.name}</Text>
            </View>
          ))}
          {lab.availableTests.length > 4 && (
            <View style={[styles.testTag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.testText, { color: colors.mutedForeground }]}>
                +{lab.availableTests.length - 4} more
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={[styles.bookBtn, { backgroundColor: colors.secondary }]}
          onPress={() => router.push(`/lab/${lab.id}` as never)}
        >
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text style={styles.bookBtnText}>Book a Test</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 120,
  },
  body: {
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  name: {
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  testsLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
    marginTop: 2,
  },
  tests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  testTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  testText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
