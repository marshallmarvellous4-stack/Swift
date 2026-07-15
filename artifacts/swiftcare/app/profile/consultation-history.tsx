import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CONSULTATIONS, Consultation } from "@/data/healthData";
import { useColors } from "@/hooks/useColors";

const STATUS_COLORS = { Completed: "#22C55E", Cancelled: "#EF4444", Pending: "#F59E0B" };
const TYPE_ICONS = { Chat: "chatbubble-outline", Voice: "call-outline", Video: "videocam-outline" };

function SummaryModal({ consultation, onClose }: { consultation: Consultation; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = consultation.summary;
  const rows = [
    { label: "Symptoms", value: s.symptoms, icon: "medkit-outline", color: "#EF4444" },
    { label: "Doctor Notes", value: s.doctorNotes, icon: "create-outline", color: "#3B82F6" },
    { label: "Diagnosis", value: s.diagnosis, icon: "search-outline", color: "#A855F7" },
    { label: "Prescription", value: s.prescription, icon: "document-text-outline", color: "#22C55E" },
    { label: "Lab Requests", value: s.labRequests, icon: "flask-outline", color: "#F59E0B" },
    { label: "Follow-up Date", value: s.followUpDate, icon: "calendar-outline", color: "#06B6D4" },
  ];
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable style={styles.backBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Consultation Summary</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
          <View style={[styles.summaryDocRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: consultation.doctorPhoto }} style={styles.summaryAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryDocName, { color: colors.foreground }]}>{consultation.doctorName}</Text>
              <Text style={[styles.summarySpecialty, { color: colors.primary }]}>{consultation.specialty}</Text>
              <Text style={[styles.summaryDate, { color: colors.mutedForeground }]}>{consultation.date}</Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name={TYPE_ICONS[consultation.type] as never} size={14} color={colors.primary} />
              <Text style={[styles.typeBadgeText, { color: colors.primary }]}>{consultation.type}</Text>
            </View>
          </View>
          {rows.map((row) => (
            <View key={row.label} style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.summaryIcon, { backgroundColor: row.color + "15" }]}>
                <Ionicons name={row.icon as never} size={18} color={row.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function ConsultCard({ consultation }: { consultation: Consultation }) {
  const colors = useColors();
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(false);
  const statusColor = STATUS_COLORS[consultation.status];
  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <Image source={{ uri: consultation.doctorPhoto }} style={[styles.avatar, { borderColor: colors.primary + "40" }]} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.doctorName, { color: colors.foreground }]}>{consultation.doctorName}</Text>
            <Text style={[styles.specialty, { color: colors.primary }]}>{consultation.specialty}</Text>
            <View style={styles.metaRow}>
              <Ionicons name={TYPE_ICONS[consultation.type] as never} size={12} color={colors.mutedForeground} />
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{consultation.type}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>• {consultation.date}</Text>
            </View>
          </View>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: statusColor + "15" }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{consultation.status}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#22C55E15" }]}>
              <Text style={[styles.badgeText, { color: "#16A34A" }]}>{consultation.paymentStatus}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.feeRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.feeText, { color: colors.mutedForeground }]}>Fee paid: <Text style={[styles.feeAmount, { color: colors.foreground }]}>₦{consultation.fee.toLocaleString()}</Text></Text>
          <View style={styles.cardActions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]} onPress={() => setShowSummary(true)}>
              <Ionicons name="document-text-outline" size={13} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Summary</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push({ pathname: "/consultation/booking" as never, params: {} })}
            >
              <Ionicons name="repeat-outline" size={13} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>Book Again</Text>
            </Pressable>
          </View>
        </View>
      </View>
      {showSummary && <SummaryModal consultation={consultation} onClose={() => setShowSummary(false)} />}
    </>
  );
}

export default function ConsultationHistoryScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Consultation History</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{CONSULTATIONS.length}</Text>
        </View>
      </View>
      <FlatList
        data={CONSULTATIONS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ConsultCard consultation={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No consultations yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const, flex: 1, marginLeft: 4 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", padding: 14, gap: 12, alignItems: "flex-start" },
  avatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2 },
  doctorName: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  specialty: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  badges: { gap: 4, alignItems: "flex-end" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  feeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  feeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  feeAmount: { fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 50, borderWidth: 1 },
  actionBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  summaryDocRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  summaryAvatar: { width: 56, height: 56, borderRadius: 28 },
  summaryDocName: { fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  summarySpecialty: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  summaryDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  summaryRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 12, borderWidth: 1 },
  summaryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  summaryValue: { fontSize: 13, fontFamily: "Inter_500Medium", fontWeight: "500" as const, lineHeight: 19, marginTop: 2 },
});
