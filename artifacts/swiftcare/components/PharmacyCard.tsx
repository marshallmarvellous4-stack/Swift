import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Pharmacy } from "@/data/pharmacies";
import { useColors } from "@/hooks/useColors";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export function PharmacyCard({ pharmacy }: PharmacyCardProps) {
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
      onPress={() => router.push(`/pharmacy/${pharmacy.id}` as never)}
    >
      <Image source={{ uri: pharmacy.image }} style={styles.image} resizeMode="cover" />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: pharmacy.isVerified
                  ? colors.primary + "18"
                  : colors.warning + "18",
              },
            ]}
          >
            <Ionicons
              name={pharmacy.isVerified ? "shield-checkmark" : "shield-outline"}
              size={12}
              color={pharmacy.isVerified ? colors.primary : colors.warning}
            />
            <Text
              style={[
                styles.badgeText,
                { color: pharmacy.isVerified ? colors.primary : colors.warning },
              ]}
            >
              {pharmacy.isVerified ? "NAFDAC Verified" : "Unverified"}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.foreground }]}>{pharmacy.rating}</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {pharmacy.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{pharmacy.location}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{pharmacy.openingHours}</Text>
        </View>

        <View style={[styles.safetyNote, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "40" }]}>
          <Ionicons name="warning-outline" size={13} color={colors.warning} />
          <Text style={[styles.safetyText, { color: colors.warning }]}>
            Only take medicines as prescribed by a qualified healthcare professional.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.prescriptionBtn, { borderColor: colors.accent }]}
            onPress={() => {}}
          >
            <Ionicons name="document-attach-outline" size={14} color={colors.accent} />
            <Text style={[styles.prescriptionText, { color: colors.accent }]}>Upload Rx</Text>
          </Pressable>
          <Pressable
            style={[styles.medicinesBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/pharmacy/${pharmacy.id}` as never)}
          >
            <Text style={styles.medicinesBtnText}>View Medicines</Text>
          </Pressable>
        </View>
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
  safetyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  safetyText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  prescriptionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  prescriptionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  medicinesBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  medicinesBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
