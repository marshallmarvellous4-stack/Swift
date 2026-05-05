import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DOCTORS } from "@/data/doctors";
import { ARTICLES } from "@/data/education";
import { HOSPITALS } from "@/data/hospitals";
import { LABS } from "@/data/labs";
import { PHARMACIES } from "@/data/pharmacies";
import { useColors } from "@/hooks/useColors";

type ResultType = "doctor" | "article" | "hospital" | "lab" | "pharmacy";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
}

const TYPE_META: Record<ResultType, { label: string; icon: string; color: string }> = {
  doctor:   { label: "Doctor",   icon: "medkit-outline",    color: "#22C55E" },
  hospital: { label: "Hospital", icon: "business-outline",  color: "#3B82F6" },
  lab:      { label: "Lab",      icon: "flask-outline",     color: "#A855F7" },
  pharmacy: { label: "Pharmacy", icon: "medical-outline",   color: "#F59E0B" },
  article:  { label: "Article",  icon: "book-outline",      color: "#0EA5E9" },
};

const FILTER_TYPES: { key: ResultType | "all"; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "doctor",   label: "Doctors" },
  { key: "hospital", label: "Hospitals" },
  { key: "lab",      label: "Labs" },
  { key: "pharmacy", label: "Pharmacy" },
  { key: "article",  label: "Articles" },
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<ResultType | "all">("all");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const doctorResults: SearchResult[] = DOCTORS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
    ).map((d) => ({
      id: d.id, type: "doctor" as const,
      title: d.name, subtitle: `${d.specialty} · ${d.location}`,
    }));

    const hospitalResults: SearchResult[] = HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q) ||
        h.services.some((s) => s.toLowerCase().includes(q))
    ).map((h) => ({
      id: h.id, type: "hospital" as const,
      title: h.name, subtitle: `${h.type} · ${h.location}`,
    }));

    const labResults: SearchResult[] = LABS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.availableTests.some((t) => t.name.toLowerCase().includes(q))
    ).map((l) => ({
      id: l.id, type: "lab" as const,
      title: l.name, subtitle: `Lab · ${l.location}`,
    }));

    const pharmacyResults: SearchResult[] = PHARMACIES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    ).map((p) => ({
      id: p.id, type: "pharmacy" as const,
      title: p.name, subtitle: `Pharmacy · ${p.location}`,
    }));

    const articleResults: SearchResult[] = ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
    ).map((a) => ({
      id: a.id, type: "article" as const,
      title: a.title, subtitle: `${a.category} · ${a.readTime} min read`,
    }));

    const all = [...doctorResults, ...hospitalResults, ...labResults, ...pharmacyResults, ...articleResults];
    if (filterType === "all") return all;
    return all.filter((r) => r.type === filterType);
  }, [query, filterType]);

  function handlePress(result: SearchResult) {
    const routes: Record<ResultType, string> = {
      doctor:   `/doctor/${result.id}`,
      hospital: `/hospital/${result.id}`,
      lab:      `/lab/${result.id}`,
      pharmacy: `/pharmacy/${result.id}`,
      article:  `/article/${result.id}`,
    };
    router.push(routes[result.type] as never);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.searchRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search doctors, hospitals, labs..."
              placeholderTextColor={colors.mutedForeground}
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>

        <FlatList
          data={FILTER_TYPES}
          horizontal
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const active = filterType === item.key;
            return (
              <Pressable
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFilterType(item.key)}
              >
                <Text style={[styles.filterText, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />

        {query.trim().length > 0 && (
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </Text>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            {query.length === 0 ? (
              <>
                <Ionicons name="search-outline" size={52} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Search SwiftCare</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Find doctors, hospitals, labs, pharmacies, and health articles
                </Text>
                <View style={styles.categoryRow}>
                  {(["Malaria", "Fever", "Lagos Doctors", "Abuja Hospital", "Blood Test"] as string[]).map((hint) => (
                    <Pressable
                      key={hint}
                      style={[styles.hintChip, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}
                      onPress={() => setQuery(hint)}
                    >
                      <Text style={[styles.hintText, { color: colors.primary }]}>{hint}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle-outline" size={52} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Try different keywords or adjust the filter above
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const meta = TYPE_META[item.type];
          return (
            <Pressable
              style={({ pressed }) => [
                styles.resultItem,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={() => handlePress(item)}
            >
              <View style={[styles.resultIcon, { backgroundColor: meta.color + "18" }]}>
                <Ionicons name={meta.icon as never} size={20} color={meta.color} />
              </View>
              <View style={styles.resultContent}>
                <Text style={[styles.resultTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.resultSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: meta.color + "18" }]}>
                <Text style={[styles.typeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, gap: 10, paddingBottom: 10 },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingTop: 10, gap: 8,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  filterText: {
    fontSize: 12, fontWeight: "500" as const, fontFamily: "Inter_500Medium",
  },
  resultCount: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    paddingHorizontal: 16,
  },
  list: { padding: 14, gap: 8 },
  empty: { alignItems: "center", paddingVertical: 56, gap: 12, paddingHorizontal: 32 },
  emptyTitle: {
    fontSize: 18, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 20,
  },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 },
  hintChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  hintText: { fontSize: 13, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  resultItem: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 12, borderWidth: 1, gap: 12, marginBottom: 8,
  },
  resultIcon: {
    width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  resultContent: { flex: 1, gap: 3 },
  resultTitle: {
    fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold",
  },
  resultSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  typeBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  typeText: { fontSize: 11, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
});
