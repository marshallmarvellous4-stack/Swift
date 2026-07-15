import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
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

const TYPE_LABELS: Record<string, string> = {
  chat: "Chat Consultation",
  voice: "Voice Call",
  video: "Video Call",
};
const TYPE_ICONS: Record<string, string> = {
  chat: "chatbubble-ellipses-outline",
  voice: "call-outline",
  video: "videocam-outline",
};

function SummaryRow({ icon, label, value, colors }: { icon: string; label: string; value: string; colors: any }) {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryIcon, { backgroundColor: colors.primary + "15" }]}>
        <Ionicons name={icon as never} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function BookingSummaryScreen() {
  const { doctorId, consultationType, date, time, reason } =
    useLocalSearchParams<{ doctorId: string; consultationType: string; date: string; time: string; reason: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const doctor = DOCTORS.find((d) => d.id === doctorId);
  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Booking data not found</Text>
      </View>
    );
  }

  const SERVICE_FEE = Math.round(doctor.fee * 0.1);
  const TOTAL = doctor.fee + SERVICE_FEE;

  function handleProceed() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/consultation/payment" as never,
      params: { doctorId, consultationType, date, time, reason },
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120, gap: 16 }}>

        {/* Consultant Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>CONSULTANT</Text>
          <View style={styles.consultantRow}>
            <View style={[styles.consultantInitial, { backgroundColor: colors.primary }]}>
              <Text style={styles.consultantInitialText}>{doctor.name.charAt(3)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.consultantName, { color: colors.foreground }]}>{doctor.name}</Text>
              <Text style={[styles.consultantSpecialty, { color: colors.mutedForeground }]}>{doctor.specialty}</Text>
            </View>
            <View style={[styles.onlineBadge, { backgroundColor: "#22C55E" + "20" }]}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Available</Text>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>APPOINTMENT DETAILS</Text>
          <View style={{ gap: 14 }}>
            <SummaryRow icon={TYPE_ICONS[consultationType] ?? "medkit-outline"} label="Consultation Type" value={TYPE_LABELS[consultationType] ?? consultationType} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
            <SummaryRow icon="calendar-outline" label="Date" value={date} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
            <SummaryRow icon="time-outline" label="Time" value={time} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
            <SummaryRow icon="document-text-outline" label="Reason" value={reason.length > 80 ? reason.substring(0, 80) + "..." : reason} colors={colors} />
          </View>
        </View>

        {/* Fee Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>PAYMENT BREAKDOWN</Text>
          <View style={{ gap: 12 }}>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.foreground }]}>Consultation Fee</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>₦{doctor.fee.toLocaleString()}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.foreground }]}>Service Fee (10%)</Text>
              <Text style={[styles.feeValue, { color: colors.foreground }]}>₦{SERVICE_FEE.toLocaleString()}</Text>
            </View>
            <View style={[styles.feeDivider, { backgroundColor: colors.border }]} />
            <View style={styles.feeRow}>
              <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₦{TOTAL.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            Your payment is secure and protected. Consultation fee is refundable if cancelled 2 hours before the appointment.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backFooterBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.backFooterText, { color: colors.foreground }]}>Back</Text>
        </Pressable>
        <Pressable
          onPress={handleProceed}
          style={({ pressed }) => [styles.proceedBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.proceedBtnText}>Proceed to Payment</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardTitle: { fontSize: 11, fontFamily: "Inter_700Bold", fontWeight: "700" as const, letterSpacing: 1 },
  consultantRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  consultantInitial: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  consultantInitialText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  consultantName: { fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  consultantSpecialty: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  onlineBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  onlineText: { fontSize: 11, color: "#22C55E", fontFamily: "Inter_600SemiBold" },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  summaryIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 1 },
  rowLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  rowValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowDivider: { height: 1 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  feeLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  feeValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  feeDivider: { height: 1 },
  totalLabel: { fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  totalValue: { fontSize: 20, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  disclaimer: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  disclaimerText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  footer: { padding: 16, paddingTop: 12, borderTopWidth: 1, flexDirection: "row", gap: 10 },
  backFooterBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 50, borderWidth: 1.5 },
  backFooterText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  proceedBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  proceedBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
});
