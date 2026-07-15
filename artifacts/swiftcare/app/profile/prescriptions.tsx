import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PRESCRIPTIONS, Prescription } from "@/data/healthData";
import { useColors } from "@/hooks/useColors";

function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.rxBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.rxText, { color: colors.primary }]}>Rx</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.doctorName, { color: colors.foreground }]}>{prescription.doctorName}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{prescription.date}</Text>
        </View>
        <Pressable
          style={[styles.downloadBtn, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
          onPress={() => Alert.alert("Download PDF", "In a production app, this would download the prescription as a PDF.")}
        >
          <Ionicons name="download-outline" size={14} color={colors.primary} />
          <Text style={[styles.downloadText, { color: colors.primary }]}>PDF</Text>
        </Pressable>
      </View>

      <View style={[styles.divider, { borderTopColor: colors.border }]} />

      {prescription.medicines.map((med, idx) => (
        <View key={idx} style={[styles.medRow, { borderBottomColor: colors.border, borderBottomWidth: idx < prescription.medicines.length - 1 ? 1 : 0 }]}>
          <View style={[styles.medIcon, { backgroundColor: "#22C55E15" }]}>
            <Ionicons name="medical-outline" size={16} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.medName, { color: colors.foreground }]}>{med.name}</Text>
            <View style={styles.medMeta}>
              <View style={[styles.metaBadge, { backgroundColor: "#3B82F615" }]}>
                <Text style={[styles.metaBadgeText, { color: "#3B82F6" }]}>{med.dosage}</Text>
              </View>
              <View style={[styles.metaBadge, { backgroundColor: "#A855F715" }]}>
                <Text style={[styles.metaBadgeText, { color: "#A855F7" }]}>{med.duration}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      {prescription.notes ? (
        <View style={[styles.notesRow, { backgroundColor: "#F59E0B08", borderColor: "#F59E0B30" }]}>
          <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
          <Text style={[styles.notesText, { color: colors.mutedForeground }]}>{prescription.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function PrescriptionsScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Prescriptions</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{PRESCRIPTIONS.length}</Text>
        </View>
      </View>
      <FlatList
        data={PRESCRIPTIONS}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PrescriptionCard prescription={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
            <Ionicons name="document-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No prescriptions yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const, flex: 1, marginLeft: 4 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countText: { fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rxBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rxText: { fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const, fontStyle: "italic" as const },
  doctorName: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  date: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  downloadBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 50, borderWidth: 1 },
  downloadText: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  divider: { borderTopWidth: 1, marginHorizontal: 14 },
  medRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  medIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  medName: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, marginBottom: 5 },
  medMeta: { flexDirection: "row", gap: 6 },
  metaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  metaBadgeText: { fontSize: 10, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  notesRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", margin: 14, marginTop: 0, padding: 10, borderRadius: 10, borderWidth: 1 },
  notesText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
