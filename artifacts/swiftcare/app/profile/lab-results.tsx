import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LAB_RESULTS, LabResult } from "@/data/healthData";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["All", "Blood Test", "Urinalysis", "Eye Test", "COVID Test", "Dental"];
const STATUS_COLORS = { Normal: "#22C55E", Abnormal: "#EF4444", Pending: "#F59E0B" };

function LabResultCard({ result }: { result: LabResult }) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[result.status];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconWrap, { backgroundColor: result.iconColor + "15" }]}>
          <Ionicons name={result.icon as never} size={22} color={result.iconColor} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.testName, { color: colors.foreground }]}>{result.testName}</Text>
          <Text style={[styles.lab, { color: colors.mutedForeground }]}>{result.lab}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{result.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{result.status}</Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={[styles.categoryChip, { backgroundColor: colors.muted }]}>
          <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>{result.category}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => Alert.alert("Download", "In production, this would download the lab report as a PDF.")}
          >
            <Ionicons name="download-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Download</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => Share.share({ message: `${result.testName} — ${result.status}\nDate: ${result.date}\nLab: ${result.lab}` })}
          >
            <Ionicons name="share-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.actionText, { color: colors.mutedForeground }]}>Share</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => Alert.alert("Lab Report", `${result.testName}\n\nResult: ${result.status}\nLab: ${result.lab}\nDate: ${result.date}\n\nIn production, the full report with reference values would appear here.`)}
          >
            <Ionicons name="eye-outline" size={14} color="#fff" />
            <Text style={[styles.actionText, { color: "#fff" }]}>View Report</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function LabResultsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? LAB_RESULTS : LAB_RESULTS.filter((r) => r.category === filter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Lab Results</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{LAB_RESULTS.length}</Text>
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FlatList
            horizontal data={CATEGORIES} keyExtractor={(c) => c}
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
        renderItem={({ item }) => <LabResultCard result={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
            <Ionicons name="flask-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No lab results found</Text>
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
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconWrap: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  testName: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  lab: { fontSize: 12, fontFamily: "Inter_400Regular" },
  date: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  categoryChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  categoryText: { fontSize: 10, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 50, borderWidth: 1 },
  actionText: { fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
