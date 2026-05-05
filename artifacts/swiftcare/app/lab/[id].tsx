import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LABS } from "@/data/labs";
import { useColors } from "@/hooks/useColors";

export default function LabDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const lab = LABS.find((l) => l.id === id);
  if (!lab) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Lab not found</Text>
      </View>
    );
  }

  function handleBook(testName: string, price: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Book Test",
      `Book ${testName} at ${lab!.name}?\n\nPrice: ₦${price.toLocaleString()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Booking",
          onPress: () =>
            Alert.alert("Test Booked!", "Your test booking has been confirmed. Please visit the lab with a valid ID."),
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32,
        }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: lab.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.overlay} />
          <Pressable
            style={[styles.backBtn, { top: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.heroContent}>
            {lab.isAccredited && (
              <View style={[styles.accreditedBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="shield-checkmark" size={12} color="#fff" />
                <Text style={styles.accreditedText}>Accredited Lab</Text>
              </View>
            )}
            <Text style={styles.heroName}>{lab.name}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroMetaText}>{lab.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoRow}>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={18} color={colors.secondary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Hours</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{lab.openingHours}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="pricetag-outline" size={18} color={colors.accent} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Price Range</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{lab.priceRange}</Text>
            </View>
          </View>

          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{lab.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available Tests</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Tap a test to book it
            </Text>
            {lab.availableTests.map((test) => (
              <Pressable
                key={test.name}
                style={({ pressed }) => [
                  styles.testRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={() => handleBook(test.name, test.price)}
              >
                <View style={[styles.testIcon, { backgroundColor: colors.secondary + "18" }]}>
                  <Ionicons name="flask-outline" size={18} color={colors.secondary} />
                </View>
                <View style={styles.testInfo}>
                  <Text style={[styles.testName, { color: colors.foreground }]}>{test.name}</Text>
                  <Text style={[styles.testTurnaround, { color: colors.mutedForeground }]}>
                    Result in {test.turnaround}
                  </Text>
                </View>
                <View style={styles.testRight}>
                  <Text style={[styles.testPrice, { color: colors.primary }]}>
                    ₦{test.price.toLocaleString()}
                  </Text>
                  <View style={[styles.bookChip, { backgroundColor: colors.primary }]}>
                    <Text style={styles.bookChipText}>Book</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={[styles.disclaimerCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              SwiftCare does not replace professional medical advice. Laboratory results should always be interpreted by a qualified healthcare professional.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageContainer: { position: "relative" },
  heroImage: { width: "100%", height: 220 },
  overlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0, height: 120,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backBtn: {
    position: "absolute", left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  heroContent: {
    position: "absolute", bottom: 14, left: 16, right: 16, gap: 6,
  },
  accreditedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  accreditedText: {
    color: "#fff", fontSize: 11,
    fontWeight: "600" as const, fontFamily: "Inter_600SemiBold",
  },
  heroName: {
    color: "#fff", fontSize: 20,
    fontWeight: "700" as const, fontFamily: "Inter_700Bold",
  },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular" },
  content: { padding: 16, gap: 16 },
  infoRow: { flexDirection: "row", gap: 10 },
  infoCard: {
    flex: 1, alignItems: "center", gap: 6,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoValue: {
    fontSize: 12, fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold", textAlign: "center",
  },
  descCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 17, fontWeight: "700" as const, fontFamily: "Inter_700Bold",
  },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -4 },
  bodyText: { fontSize: 14, lineHeight: 22, fontFamily: "Inter_400Regular" },
  testRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  testIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  testInfo: { flex: 1, gap: 3 },
  testName: {
    fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold",
  },
  testTurnaround: { fontSize: 12, fontFamily: "Inter_400Regular" },
  testRight: { alignItems: "flex-end", gap: 6 },
  testPrice: {
    fontSize: 14, fontWeight: "700" as const, fontFamily: "Inter_700Bold",
  },
  bookChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  bookChipText: {
    color: "#fff", fontSize: 11,
    fontWeight: "600" as const, fontFamily: "Inter_600SemiBold",
  },
  disclaimerCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  disclaimerText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 16 },
});
