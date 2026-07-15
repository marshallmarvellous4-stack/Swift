import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function ComingSoonScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const router = useRouter();
  const colors = useColors();
  const screenTitle = title ?? "Feature";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{screenTitle}</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name="construct-outline" size={52} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Coming Soon</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {screenTitle} is currently under development and will be available in a future update. Stay tuned!
        </Text>
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.btnText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  iconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", fontWeight: "700" as const, textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  btn: { marginTop: 8, paddingHorizontal: 32, paddingVertical: 13, borderRadius: 50 },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
});
