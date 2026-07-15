import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HEALTH_RECORDS, HealthRecord } from "@/data/healthData";
import { useColors } from "@/hooks/useColors";

const STATUS_COLORS = { Normal: "#22C55E", Review: "#F59E0B", Critical: "#EF4444" };

function RecordCard({ record }: { record: HealthRecord }) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[record.status];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: record.iconColor + "18" }]}>
        <Ionicons name={record.icon as never} size={22} color={record.iconColor} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.recordType, { color: colors.foreground }]}>{record.type}</Text>
        <Text style={[styles.recordFacility, { color: colors.mutedForeground }]}>{record.facility}</Text>
        <Text style={[styles.recordDate, { color: colors.mutedForeground }]}>{record.date}</Text>
      </View>
      <View style={styles.rightCol}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{record.status}</Text>
        </View>
        <Pressable
          style={[styles.viewBtn, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
          onPress={() => Alert.alert("Health Record", `Viewing ${record.type} from ${record.date}.\n\nIn a full implementation, this would open the record PDF or detail view.`)}
        >
          <Text style={[styles.viewBtnText, { color: colors.primary }]}>View</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HealthRecordsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [filter, setFilter] = useState<string>("All");
  const categories = ["All", "Blood Test", "Eye Examination", "Prescription", "Vaccination", "MRI Scan", "X-Ray"];
  const filtered = filter === "All" ? HEALTH_RECORDS : HEALTH_RECORDS.filter((r) => r.type === filter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Health Records</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{HEALTH_RECORDS.length}</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(c) => c}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 14 }}
            renderItem={({ item }) => {
              const active = filter === item;
              return (
                <Pressable
                  style={[styles.chip, { backgroundColor: active ? colors.primary : colors.muted, borderColor: active ? colors.primary : colors.border }]}
                  onPress={() => setFilter(item)}
                >
                  <Text style={[styles.chipText, { color: active ? "#fff" : colors.mutedForeground }]}>{item}</Text>
                </Pressable>
              );
            }}
          />
        }
        renderItem={({ item }) => <RecordCard record={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
            <Ionicons name="document-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No records found</Text>
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
  card: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  iconWrap: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recordType: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  recordFacility: { fontSize: 12, fontFamily: "Inter_400Regular" },
  recordDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rightCol: { alignItems: "flex-end", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  viewBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
