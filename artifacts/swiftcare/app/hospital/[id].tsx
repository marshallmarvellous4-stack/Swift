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
import { HOSPITALS } from "@/data/hospitals";
import { useColors } from "@/hooks/useColors";

const TYPE_COLORS: Record<string, string> = {
  "General Hospital": "#3B82F6",
  "Private Clinic": "#A855F7",
  "Teaching Hospital": "#22C55E",
  "Specialist Hospital": "#F59E0B",
};

export default function HospitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const hospital = HOSPITALS.find((h) => h.id === id);
  if (!hospital) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Hospital not found</Text>
      </View>
    );
  }

  const typeColor = TYPE_COLORS[hospital.type] ?? colors.primary;

  function handleBook() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Book Appointment",
      `Book an appointment at ${hospital.name}?\n\nContact: ${hospital.contact}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Book",
          onPress: () =>
            Alert.alert("Booking Requested", "Your appointment request has been sent. The hospital will contact you shortly."),
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: hospital.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.overlay} />
          <Pressable
            style={[
              styles.backBtn,
              { top: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={[styles.heroContent, { bottom: 16 }]}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeText}>{hospital.type}</Text>
            </View>
            <Text style={styles.heroName}>{hospital.name}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroMetaText}>{hospital.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={[styles.stat, { borderColor: colors.border }]}>
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{hospital.rating}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{hospital.reviews} reviews</Text>
            </View>
            <View style={[styles.stat, { borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground, textAlign: "center" }]}>
                {hospital.openingHours}
              </Text>
            </View>
            <View style={[styles.stat, { borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={18} color={colors.secondary} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground, textAlign: "center" }]}>
                {hospital.contact}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{hospital.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Services Offered</Text>
            <View style={styles.serviceGrid}>
              {hospital.services.map((s) => (
                <View key={s} style={[styles.serviceTag, { backgroundColor: colors.primary + "12" }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <Text style={[styles.serviceText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.disclaimerCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately or call emergency services.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
          },
        ]}
      >
        <Pressable
          style={[styles.dirBtn, { borderColor: colors.secondary }]}
          onPress={() => Alert.alert("Directions", "This feature will open Google Maps.")}
        >
          <Ionicons name="navigate-outline" size={18} color={colors.secondary} />
          <Text style={[styles.dirBtnText, { color: colors.secondary }]}>Directions</Text>
        </Pressable>
        <Pressable
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={handleBook}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageContainer: { position: "relative" },
  heroImage: { width: "100%", height: 260 },
  overlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    position: "absolute",
    left: 16, right: 16,
    gap: 6,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  typeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  heroName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  serviceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  serviceText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  dirBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  dirBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  bookBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
});
