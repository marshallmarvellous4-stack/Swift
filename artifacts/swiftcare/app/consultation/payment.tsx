import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DOCTORS } from "@/data/doctors";
import { useColors } from "@/hooks/useColors";

const PAYMENT_METHODS = [
  { key: "debit", label: "Debit Card", icon: "card-outline", desc: "Visa, Mastercard, Verve" },
  { key: "paystack", label: "Paystack", icon: "flash-outline", desc: "Pay via Paystack checkout" },
  { key: "flutterwave", label: "Flutterwave", icon: "swap-horizontal-outline", desc: "Pay via Flutterwave" },
  { key: "transfer", label: "Bank Transfer", icon: "business-outline", desc: "Direct bank transfer" },
  { key: "wallet", label: "Wallet", icon: "wallet-outline", desc: "Coming Soon", disabled: true },
];

function generateConsultationId() {
  return "SC" + Date.now().toString(36).toUpperCase().slice(-6);
}

export default function PaymentScreen() {
  const { doctorId, consultationType, date, time, reason } =
    useLocalSearchParams<{ doctorId: string; consultationType: string; date: string; time: string; reason: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const doctor = DOCTORS.find((d) => d.id === doctorId);
  const [selectedMethod, setSelectedMethod] = useState("debit");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Payment data not found</Text>
      </View>
    );
  }

  const SERVICE_FEE = Math.round(doctor.fee * 0.1);
  const TOTAL = doctor.fee + SERVICE_FEE;

  function formatCardNumber(text: string) {
    const clean = text.replace(/\D/g, "").slice(0, 16);
    return clean.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(text: string) {
    const clean = text.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) return clean.slice(0, 2) + "/" + clean.slice(2);
    return clean;
  }

  async function handlePay() {
    if (selectedMethod === "debit") {
      if (!cardName.trim()) return;
      if (cardNumber.replace(/\s/g, "").length < 16) return;
      if (expiry.length < 5) return;
      if (cvv.length < 3) return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2200));
    setLoading(false);
    const consultationId = generateConsultationId();
    router.replace({
      pathname: "/consultation/success" as never,
      params: { doctorId, date, time, consultationId, paymentMethod: selectedMethod },
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Payment</Text>
        <View style={[styles.secureBadge, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name="lock-closed" size={12} color={colors.primary} />
          <Text style={[styles.secureText, { color: colors.primary }]}>Secure</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120, gap: 16 }}>

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Text style={styles.orderTitle}>Order Summary</Text>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>{doctor.name}</Text>
            <Text style={styles.orderValue}>₦{doctor.fee.toLocaleString()}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Service Fee</Text>
            <Text style={styles.orderValue}>₦{SERVICE_FEE.toLocaleString()}</Text>
          </View>
          <View style={styles.orderDivider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalValue}>₦{TOTAL.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>PAYMENT METHOD</Text>
          <View style={{ gap: 10 }}>
            {PAYMENT_METHODS.map((m) => {
              const active = selectedMethod === m.key;
              return (
                <Pressable
                  key={m.key}
                  style={[styles.methodRow, { backgroundColor: active ? colors.primary + "10" : colors.background, borderColor: active ? colors.primary : colors.border },
                    m.disabled && { opacity: 0.45 },
                  ]}
                  onPress={() => { if (!m.disabled) { Haptics.selectionAsync(); setSelectedMethod(m.key); } }}
                  disabled={m.disabled}
                >
                  <View style={[styles.methodIcon, { backgroundColor: active ? colors.primary : colors.muted }]}>
                    <Ionicons name={m.icon as never} size={18} color={active ? "#fff" : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodLabel, { color: colors.foreground }]}>{m.label}</Text>
                    <Text style={[styles.methodDesc, { color: colors.mutedForeground }]}>{m.desc}</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: active ? colors.primary : colors.border }]}>
                    {active && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Debit Card Form */}
        {selectedMethod === "debit" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>CARD DETAILS</Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Cardholder Name</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Full name on card"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="words"
                />
              </View>
              <View>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Card Number</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor={colors.mutedForeground}
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Expiry Date</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.mutedForeground}
                    value={expiry}
                    onChangeText={(t) => setExpiry(formatExpiry(t))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CVV</Text>
                  <TextInput
                    style={[styles.fieldInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="•••"
                    placeholderTextColor={colors.mutedForeground}
                    value={cvv}
                    onChangeText={(t) => setCvv(t.replace(/\D/g, "").slice(0, 4))}
                    keyboardType="numeric"
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedMethod !== "debit" && selectedMethod !== "wallet" && (
          <View style={[styles.redirectNotice, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.redirectText, { color: colors.primary }]}>
              You will be redirected to {PAYMENT_METHODS.find(m => m.key === selectedMethod)?.label} to complete your payment securely.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8 }]}>
        <Pressable
          onPress={handlePay}
          disabled={loading}
          style={({ pressed }) => [styles.payBtn, { backgroundColor: loading ? colors.primary + "80" : colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Pay ₦{TOTAL.toLocaleString()}</Text>
            </>
          )}
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
  secureBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  secureText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardTitle: { fontSize: 11, fontFamily: "Inter_700Bold", fontWeight: "700" as const, letterSpacing: 1 },
  orderTitle: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold", fontWeight: "700" as const, marginBottom: 4, opacity: 0.85 },
  orderRow: { flexDirection: "row", justifyContent: "space-between" },
  orderLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular" },
  orderValue: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  orderDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.25)", marginVertical: 4 },
  orderTotalLabel: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  orderTotalValue: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  methodRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  methodIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  methodDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  cardRow: { flexDirection: "row", gap: 12 },
  redirectNotice: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  redirectText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  footer: { padding: 16, paddingTop: 12, borderTopWidth: 1 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  payBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
});
