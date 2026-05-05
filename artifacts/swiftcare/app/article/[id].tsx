import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARTICLES } from "@/data/education";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<string, string> = {
  Prevention: "#22C55E",
  "Mental Health": "#A855F7",
  Nutrition: "#F59E0B",
  Vaccination: "#3B82F6",
  "First Aid": "#EF4444",
  "Chronic Disease": "#0EA5E9",
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const article = ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>
          Article not found
        </Text>
      </View>
    );
  }

  const categoryColor = CATEGORY_COLORS[article.category] ?? colors.primary;
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <Pressable
            style={[
              styles.backBtn,
              {
                backgroundColor: "rgba(0,0,0,0.4)",
                top: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {article.category}
            </Text>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            {article.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {formattedDate}
              </Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {article.readTime} min read
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.articleText, { color: colors.foreground }]}>
            {article.content}
          </Text>

          <View
            style={[
              styles.disclaimerCard,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
            <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
              SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  imageContainer: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 240,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    gap: 14,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
  },
  articleText: {
    fontSize: 15,
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
  },
});
