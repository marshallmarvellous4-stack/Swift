import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface SettingsRow {
  icon: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  action?: () => void;
  toggle?: { value: boolean; onChange: (v: boolean) => void };
  danger?: boolean;
}

function SettingsSection({ title, rows }: { title: string; rows: SettingsRow[] }) {
  const colors = useColors();
  return (
    <View style={{ gap: 4 }}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {rows.map((row, idx) => (
          <Pressable
            key={row.label}
            style={[
              styles.row,
              { borderBottomColor: colors.border },
              idx < rows.length - 1 && styles.rowBorder,
            ]}
            onPress={row.toggle ? undefined : row.action}
          >
            <View style={[styles.rowIcon, { backgroundColor: row.iconColor + "18" }]}>
              <Ionicons name={row.icon as never} size={18} color={row.danger ? "#EF4444" : row.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: row.danger ? "#EF4444" : colors.foreground }]}>{row.label}</Text>
              {row.subtitle && <Text style={[styles.rowSubtitle, { color: colors.mutedForeground }]}>{row.subtitle}</Text>}
            </View>
            {row.toggle ? (
              <Switch
                value={row.toggle.value}
                onValueChange={row.toggle.onChange}
                trackColor={{ true: "#22C55E", false: undefined }}
              />
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [biometric, setBiometric] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const sections = [
    {
      title: "ACCOUNT",
      rows: [
        {
          icon: "person-outline", iconColor: "#3B82F6", label: "Personal Information",
          subtitle: user?.fullName ?? "—",
          action: () => Alert.alert("Personal Information", "Edit personal info form coming soon."),
        },
        {
          icon: "shield-outline", iconColor: "#22C55E", label: "Privacy",
          subtitle: "Data & privacy settings",
          action: () => Alert.alert("Privacy", "Privacy settings coming soon."),
        },
        {
          icon: "lock-closed-outline", iconColor: "#A855F7", label: "Security",
          subtitle: "Password & 2FA",
          action: () => Alert.alert("Security", "Security settings coming soon."),
        },
        {
          icon: "finger-print-outline", iconColor: "#F59E0B", label: "Biometric Login",
          subtitle: biometric ? "Enabled" : "Disabled",
          toggle: { value: biometric, onChange: setBiometric },
        },
      ] as SettingsRow[],
    },
    {
      title: "PREFERENCES",
      rows: [
        {
          icon: "notifications-outline", iconColor: "#06B6D4", label: "Notifications",
          subtitle: notifications ? "Push notifications on" : "Push notifications off",
          toggle: { value: notifications, onChange: setNotifications },
        },
        {
          icon: "moon-outline", iconColor: "#6366F1", label: "Dark Mode",
          subtitle: darkMode ? "Dark" : "Light",
          toggle: { value: darkMode, onChange: setDarkMode },
        },
        {
          icon: "language-outline", iconColor: "#F59E0B", label: "Language",
          subtitle: "English",
          action: () => Alert.alert("Language", "Language selection coming soon."),
        },
      ] as SettingsRow[],
    },
    {
      title: "SUPPORT",
      rows: [
        {
          icon: "help-circle-outline", iconColor: "#3B82F6", label: "Help & Support",
          subtitle: "FAQs, chat support",
          action: () => Alert.alert("Help & Support", "Support chat coming soon."),
        },
        {
          icon: "information-circle-outline", iconColor: "#64748B", label: "About SwiftCare",
          subtitle: "Version 1.0.0",
          action: () => Alert.alert("About SwiftCare", "SwiftCare v1.0.0\n\nAI-assisted healthcare access for everyone.\n\n⚠️ SwiftCare does not replace professional medical advice."),
        },
      ] as SettingsRow[],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <SettingsSection key={section.title} title={section.title} rows={section.rows} />
        ))}

        {/* Logout */}
        <Pressable
          style={[styles.logoutBtn, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel" },
              {
                text: "Sign Out", style: "destructive",
                onPress: async () => {
                  await logout();
                  router.back();
                },
              },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          ⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const, flex: 1, marginLeft: 4 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const, letterSpacing: 0.8, textTransform: "uppercase" as const, paddingHorizontal: 4, marginBottom: 4 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 14, fontFamily: "Inter_500Medium", fontWeight: "500" as const },
  rowSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { color: "#EF4444", fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },
});
