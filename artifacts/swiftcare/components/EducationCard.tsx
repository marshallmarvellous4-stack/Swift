import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Article } from "@/data/education";
import { useColors } from "@/hooks/useColors";

interface EducationCardProps {
  article: Article;
}

const CATEGORY_COLORS: Record<string, string> = {
  Prevention: "#22C55E",
  "Mental Health": "#A855F7",
  Nutrition: "#F59E0B",
  Vaccination: "#3B82F6",
  "First Aid": "#EF4444",
  "Chronic Disease": "#0EA5E9",
};

export function EducationCard({ article }: EducationCardProps) {
  const colors = useColors();
  const router = useRouter();
  const categoryColor = CATEGORY_COLORS[article.category] ?? colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => router.push(`/article/${article.id}` as never)}
    >
      <Image
        source={{ uri: article.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {article.category}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={[styles.summary, { color: colors.mutedForeground }]} numberOfLines={2}>
          {article.summary}
        </Text>
        <View style={styles.footer}>
          <View style={styles.readTime}>
            <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {article.readTime} min read
            </Text>
          </View>
          <View style={styles.readMore}>
            <Text style={[styles.readMoreText, { color: colors.primary }]}>Read</Text>
            <Ionicons name="arrow-forward" size={13} color={colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    padding: 14,
    gap: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  readTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
