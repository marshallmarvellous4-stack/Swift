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
import { PHARMACIES } from "@/data/pharmacies";
import { useColors } from "@/hooks/useColors";

const SAMPLE_MEDICINES = [
  { name: "Paracetamol 500mg", category: "Analgesic / Antipyretic", price: 300, inStock: true },
  { name: "Amoxicillin 250mg", category: "Antibiotic", price: 850, inStock: true },
  { name: "Coartem (Artemether/Lumefantrine)", category: "Antimalarial", price: 1800, inStock: true },
  { name: "Metformin 500mg", category: "Antidiabetic", price: 600, inStock: true },
  { name: "Amlodipine 5mg", category: "Antihypertensive", price: 750, inStock: false },
  { name: "Oral Rehydration Salt (ORS)", category: "Rehydration", price: 200, inStock: true },
  { name: "Vitamin C 1000mg", category: "Supplement", price: 500, inStock: true },
  { name: "Multivitamin Tablets", category: "Supplement", price: 1200, inStock: true },
];

export default function PharmacyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const pharmacy = PHARMACIES.find((p) => p.id === id);
  if (!pharmacy) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Pharmacy not found</Text>
      </View>
    );
  }

  function handlePrescription() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Upload Prescription",
      "This feature will allow you to upload a prescription image. A pharmacist will review and process your order.",
      [{ text: "OK" }]
    );
  }

  function handleOrder(medicineName: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "⚠️ Medical Safety Notice",
      `Medicines should only be taken according to professional medical advice or a valid prescription.\n\nDo you have a valid prescription for ${medicineName}?`,
      [
        { text: "No, Cancel", style: "cancel" },
        {
          text: "Yes, Order",
          onPress: () =>
            Alert.alert("Order Placed", "Your order has been received. The pharmacy will contact you for delivery or pickup."),
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
          <Image source={{ uri: pharmacy.image }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.overlay} />
          <Pressable
            style={[styles.backBtn, { top: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.heroContent}>
            <View
              style={[
                styles.verifiedBadge,
                {
                  backgroundColor: pharmacy.isVerified ? colors.primary : colors.warning,
                },
              ]}
            >
              <Ionicons
                name={pharmacy.isVerified ? "shield-checkmark" : "shield-outline"}
                size={12}
                color="#fff"
              />
              <Text style={styles.verifiedText}>
                {pharmacy.isVerified ? "NAFDAC Verified" : "Unverified"}
              </Text>
            </View>
            <Text style={styles.heroName}>{pharmacy.name}</Text>
            <View style={styles.heroMeta}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={styles.heroMetaText}>{pharmacy.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.safetyBanner, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "40" }]}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={[styles.safetyText, { color: colors.warning }]}>
              Medicines should only be taken according to professional medical advice or a valid prescription. Self-medication can be dangerous.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Hours</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{pharmacy.openingHours}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="call-outline" size={18} color={colors.secondary} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Contact</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{pharmacy.contact}</Text>
            </View>
          </View>

          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
            <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{pharmacy.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Services</Text>
            <View style={styles.servicesWrap}>
              {pharmacy.services.map((s) => (
                <View key={s} style={[styles.serviceTag, { backgroundColor: colors.primary + "12" }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <Text style={[styles.serviceText, { color: colors.foreground }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available Medicines</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              Prescription required for marked items
            </Text>
            {SAMPLE_MEDICINES.map((med) => (
              <View
                key={med.name}
                style={[styles.medRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.medIcon, { backgroundColor: colors.accent + "18" }]}>
                  <Ionicons name="medical-outline" size={18} color={colors.accent} />
                </View>
                <View style={styles.medInfo}>
                  <Text style={[styles.medName, { color: colors.foreground }]}>{med.name}</Text>
                  <Text style={[styles.medCategory, { color: colors.mutedForeground }]}>{med.category}</Text>
                </View>
                <View style={styles.medRight}>
                  <Text style={[styles.medPrice, { color: colors.primary }]}>₦{med.price}</Text>
                  {med.inStock ? (
                    <Pressable
                      style={[styles.orderBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleOrder(med.name)}
                    >
                      <Text style={styles.orderBtnText}>Order</Text>
                    </Pressable>
                  ) : (
                    <View style={[styles.outOfStock, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.outOfStockText, { color: colors.mutedForeground }]}>Out of stock</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.disclaimerCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              SwiftCare does not replace professional medical advice. Always consult a qualified doctor before taking any medication.
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
          style={[styles.rxBtn, { borderColor: colors.accent }]}
          onPress={handlePrescription}
        >
          <Ionicons name="document-attach-outline" size={18} color={colors.accent} />
          <Text style={[styles.rxBtnText, { color: colors.accent }]}>Upload Prescription</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  imageContainer: { position: "relative" },
  heroImage: { width: "100%", height: 220 },
  overlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backBtn: {
    position: "absolute", left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  heroContent: { position: "absolute", bottom: 14, left: 16, right: 16, gap: 6 },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  verifiedText: { color: "#fff", fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  heroName: { color: "#fff", fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular" },
  content: { padding: 16, gap: 16 },
  safetyBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  safetyText: { fontSize: 13, fontFamily: "Inter_500Medium", fontWeight: "500" as const, flex: 1, lineHeight: 19 },
  infoRow: { flexDirection: "row", gap: 10 },
  infoCard: {
    flex: 1, alignItems: "center", gap: 6, padding: 14, borderRadius: 12, borderWidth: 1,
  },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  descCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -4 },
  bodyText: { fontSize: 14, lineHeight: 22, fontFamily: "Inter_400Regular" },
  servicesWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  serviceTag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10,
  },
  serviceText: { fontSize: 13, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  medRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 12, borderRadius: 12, borderWidth: 1,
  },
  medIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  medInfo: { flex: 1, gap: 3 },
  medName: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  medCategory: { fontSize: 12, fontFamily: "Inter_400Regular" },
  medRight: { alignItems: "flex-end", gap: 6 },
  medPrice: { fontSize: 13, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  orderBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  orderBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  outOfStock: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  outOfStockText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  disclaimerCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1,
  },
  disclaimerText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 16 },
  bottomBar: { padding: 16, paddingTop: 12, borderTopWidth: 1 },
  rxBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 15, borderRadius: 50, borderWidth: 1.5,
  },
  rxBtnText: { fontSize: 15, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
