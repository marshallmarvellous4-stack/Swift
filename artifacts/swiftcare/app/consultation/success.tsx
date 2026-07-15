import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DOCTORS } from "@/data/doctors";
import { useColors } from "@/hooks/useColors";

export default function PaymentSuccessScreen() {
  const { doctorId, date, time, consultationId } =
    useLocalSearchParams<{ doctorId: string; date: string; time: string; consultationId: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const doctor = DOCTORS.find((d) => d.id === doctorId);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Booking not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }}>

        {/* Success Icon */}
        <Animated.View style={[styles.successRing, { borderColor: colors.primary + "30", transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.successCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={52} color="#fff" />
          </View>
        </Animated.View>

        <Animated.View style={{ alignItems: "center", opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Booking Confirmed!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your consultation has been confirmed.{"\n"}A confirmation has been sent to your email.
          </Text>

          {/* Consultation ID */}
          <View style={[styles.idBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Consultation ID</Text>
            <Text style={[styles.idValue, { color: colors.primary }]}>#{consultationId}</Text>
          </View>

          {/* Booking Details Card */}
          <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Consultant</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{doctor.name}</Text>
              </View>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Date</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{date}</Text>
              </View>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Time</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{time}</Text>
              </View>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#22C55E" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Status</Text>
                <Text style={[styles.statusConfirmed]}>Confirmed</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.footer,
          { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8 },
          { opacity: fadeAnim },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: "/consultation/chat" as never,
              params: { doctorId, consultationId },
            });
          }}
          style={({ pressed }) => [styles.chatBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
          <Text style={styles.chatBtnText}>Open Chat</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.replace("/(tabs)" as never);
          }}
          style={({ pressed }) => [styles.homeBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.homeBtnText, { color: colors.foreground }]}>Back to Home</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 12, alignItems: "center", justifyContent: "center", marginBottom: 28 },
  successCircle: { width: 106, height: 106, borderRadius: 53, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", fontWeight: "700" as const, textAlign: "center", marginBottom: 10 },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  idBadge: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, borderWidth: 1, marginBottom: 20 },
  idLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  idValue: { fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  detailCard: { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  detailLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  detailDivider: { height: 1, marginHorizontal: 14 },
  statusConfirmed: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: "#22C55E" },
  footer: { padding: 16, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  chatBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  chatBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  homeBtn: { alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 50, borderWidth: 1.5 },
  homeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
