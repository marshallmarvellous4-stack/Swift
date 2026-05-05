import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Hospital } from "@/data/hospitals";
import { useColors } from "@/hooks/useColors";

const TYPE_COLORS: Record<string, string> = {
  "General Hospital": "#3B82F6",
  "Private Clinic": "#A855F7",
  "Teaching Hospital": "#22C55E",
  "Specialist Hospital": "#F59E0B",
};

interface HospitalCardProps {
  hospital: Hospital;
}

export function HospitalCard({ hospital }: HospitalCardProps) {
  const colors = useColors();
  const router = useRouter();
  const typeColor = TYPE_COLORS[hospital.type] ?? colors.primary;

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
      onPress={() => router.push(`/hospital/${hospital.id}` as never)}
    >
      <Image
        source={{ uri: hospital.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + "20" }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>{hospital.type}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.foreground }]}>{hospital.rating}</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {hospital.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {hospital.location}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {hospital.openingHours}
          </Text>
        </View>

        <View style={styles.services}>
          {hospital.services.slice(0, 3).map((s) => (
            <View key={s} style={[styles.serviceTag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.serviceText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {s}
              </Text>
            </View>
          ))}
          {hospital.services.length > 3 && (
            <View style={[styles.serviceTag, { backgroundColor: colors.muted }]}>
              <Text style={[styles.serviceText, { color: colors.mutedForeground }]}>
                +{hospital.services.length - 3}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/hospital/${hospital.id}` as never)}
          >
            <Text style={styles.btnText}>View Details</Text>
          </Pressable>
          <Pressable
            style={[styles.outlineBtn, { borderColor: colors.secondary }]}
            onPress={() => {}}
          >
            <Ionicons name="navigate-outline" size={14} color={colors.secondary} />
            <Text style={[styles.outlineBtnText, { color: colors.secondary }]}>Directions</Text>
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
    height: 130,
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
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeText: {
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
  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  serviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  btn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    gap: 4,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
