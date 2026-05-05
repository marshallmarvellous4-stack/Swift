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
import { useColors } from "@/hooks/useColors";

type ResultType = "doctor" | "article";
interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
}

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const doctorResults: SearchResult[] = DOCTORS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
    ).map((d) => ({
      id: d.id,
      type: "doctor" as const,
      title: d.name,
      subtitle: `${d.specialty} · ${d.location}`,
    }));

    const articleResults: SearchResult[] = ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
    ).map((a) => ({
      id: a.id,
      type: "article" as const,
      title: a.title,
      subtitle: `${a.category} · ${a.readTime} min read`,
    }));

    return [...doctorResults, ...articleResults];
  }, [query]);

  function handlePress(result: SearchResult) {
    if (result.type === "doctor") {
      router.push(`/doctor/${result.id}` as never);
    } else {
      router.push(`/article/${result.id}` as never);
    }
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
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search doctors, health topics..."
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
                <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Search SwiftCare
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Find doctors, health articles, and more
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No results found
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Try different keywords
                </Text>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.resultItem,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => handlePress(item)}
          >
            <View
              style={[
                styles.resultIcon,
                {
                  backgroundColor:
                    item.type === "doctor"
                      ? colors.primary + "18"
                      : colors.secondary + "18",
                },
              ]}
            >
              <Ionicons
                name={item.type === "doctor" ? "person-outline" : "book-outline"}
                size={20}
                color={item.type === "doctor" ? colors.primary : colors.secondary}
              />
            </View>
            <View style={styles.resultContent}>
              <Text
                style={[styles.resultTitle, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[styles.resultSubtitle, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {item.subtitle}
              </Text>
            </View>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.type === "doctor"
                      ? colors.primary + "18"
                      : colors.secondary + "18",
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color:
                      item.type === "doctor" ? colors.primary : colors.secondary,
                  },
                ]}
              >
                {item.type === "doctor" ? "Doctor" : "Article"}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  list: {
    padding: 16,
    gap: 10,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
    gap: 3,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  resultSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
