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
import { DOCTORS } from "@/data/doctors";
import { useColors } from "@/hooks/useColors";

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const doctor = DOCTORS.find((d) => d.id === id);

  if (!doctor) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>
          Doctor not found
        </Text>
      </View>
    );
  }

  function handleBook() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/consultation/booking" as never,
      params: { doctorId: doctor!.id },
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[styles.heroSection, { backgroundColor: colors.primary }]}>
          <View
            style={[
              styles.topBar,
              { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 },
            ]}
          >
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backBtn,
                { backgroundColor: "rgba(255,255,255,0.2)", opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
          </View>

          <Image
            source={{ uri: doctor.image }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.heroName}>{doctor.name}</Text>
          <Text style={styles.heroSpecialty}>{doctor.specialty}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{doctor.experience}</Text>
              <Text style={styles.statLabel}>Years Exp.</Text>
            </View>
            <View style={[styles.statDivider]} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{doctor.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{doctor.reviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Location</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{doctor.location}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Availability</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{doctor.availability}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Consultation Fee</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                ₦{doctor.fee.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.bioText, { color: colors.mutedForeground }]}>
              {doctor.bio}
            </Text>
          </View>

          <View style={[styles.disclaimerCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.
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
          style={({ pressed }) => [
            styles.bookBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleBook}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.bookBtnText}>Book Consultation</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  heroSection: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  topBar: {
    alignSelf: "stretch",
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 12,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  heroSpecialty: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 16,
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  content: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
    textAlign: "right",
    flexShrink: 1,
    maxWidth: "55%",
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
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
    padding: 16,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 50,
  },
  bookBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
});
