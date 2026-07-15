import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Doctor } from "@/data/doctors";
import { useColors } from "@/hooks/useColors";

interface DoctorCardProps {
  doctor: Doctor;
}

const STATUS_CONFIG = {
  online: { color: "#22C55E", label: "Online" },
  busy: { color: "#F59E0B", label: "Busy" },
  offline: { color: "#94A3B8", label: "Offline" },
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  const colors = useColors();
  const router = useRouter();
  const status = STATUS_CONFIG[doctor.status];

  function handleBook() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/consultation/booking" as never,
      params: { doctorId: doctor.id },
    });
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      onPress={() => router.push(`/doctor/${doctor.id}` as never)}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: doctor.image }} style={[styles.avatar, { borderColor: colors.primary + "40" }]} />
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{doctor.name}</Text>
            {doctor.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                <Text style={[styles.verifiedText, { color: colors.primary }]}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={[styles.specialty, { color: colors.primary }]} numberOfLines={1}>{doctor.specialty}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="briefcase-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{doctor.experience} yrs exp</Text>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <View style={[styles.statusChip, { backgroundColor: status.color + "18" }]}>
              <View style={[styles.statusMini, { backgroundColor: status.color }]} />
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>{doctor.rating}</Text>
            <Text style={[styles.reviewsText, { color: colors.mutedForeground }]}>({doctor.reviews} reviews)</Text>
          </View>
        </View>
      </View>

      {/* Languages */}
      <View style={styles.langRow}>
        <Ionicons name="language-outline" size={13} color={colors.mutedForeground} />
        <View style={styles.langChips}>
          {doctor.languages.map((lang) => (
            <View key={lang} style={[styles.langChip, { backgroundColor: colors.muted }]}>
              <Text style={[styles.langText, { color: colors.mutedForeground }]}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Consultation Fee</Text>
          <Text style={[styles.feeValue, { color: colors.primary }]}>₦{doctor.fee.toLocaleString()}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.bookBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleBook}
        >
          <Ionicons name="calendar-outline" size={14} color="#fff" />
          <Text style={styles.bookBtnText}>Book Consultation</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  topRow: { flexDirection: "row", padding: 14, gap: 12, alignItems: "flex-start" },
  avatarWrap: { position: "relative" },
  avatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 2 },
  statusDot: { position: "absolute", bottom: 2, right: 2, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: "#fff" },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  name: { fontSize: 15, fontWeight: "700" as const, fontFamily: "Inter_700Bold", flexShrink: 1 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  verifiedText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  specialty: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dot: { width: 3, height: 3, borderRadius: 2 },
  statusChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  statusMini: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  ratingText: { fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  reviewsText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  langRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingBottom: 12 },
  langChips: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  langChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  langText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  footer: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1,
  },
  feeLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 1 },
  feeValue: { fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  bookBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50,
  },
  bookBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
});
