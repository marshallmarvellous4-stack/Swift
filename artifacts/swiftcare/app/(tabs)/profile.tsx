import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function GuestView() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.guestContainer,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
        },
      ]}
    >
      <View style={[styles.guestIconWrap, { backgroundColor: colors.primary + "20" }]}>
        <Ionicons name="person-circle-outline" size={72} color={colors.primary} />
      </View>
      <Text style={[styles.guestTitle, { color: colors.foreground }]}>
        Your Health Profile
      </Text>
      <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
        Sign in to access your profile, chat history, and personalized health insights.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push("/auth/login" as never)}
      >
        <Text style={styles.primaryBtnText}>Sign In</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.outlineBtn,
          { borderColor: colors.primary, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => router.push("/auth/register" as never)}
      >
        <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
          Create Account
        </Text>
      </Pressable>

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Your data is stored securely on your device
        </Text>
      </View>
    </View>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
}

function MenuItem({ icon, label, value, danger, onPress }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: danger ? colors.destructive + "18" : colors.primary + "18" }]}>
          <Ionicons
            name={icon as never}
            size={18}
            color={danger ? colors.destructive : colors.primary}
          />
        </View>
        <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
      </View>
      {value && (
        <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text>
      )}
      {!value && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

function ProfileView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  async function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  const initial = user?.fullName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.profileHeader,
          {
            backgroundColor: colors.primary,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          },
        ]}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
        <Text style={styles.profileName}>{user?.fullName}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={[styles.roleBadge]}>
          <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={{ padding: 16, gap: 8 }}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          PERSONAL INFO
        </Text>
        <MenuItem icon="person-outline" label="Full Name" value={user?.fullName} />
        <MenuItem icon="mail-outline" label="Email" value={user?.email} />
        <MenuItem icon="call-outline" label="Phone" value={user?.mobileNumber} />
        <MenuItem icon="people-outline" label="Gender" value={user?.sex} />
        <MenuItem icon="location-outline" label="State" value={user?.stateOfOrigin} />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
          ACTIVITY
        </Text>
        <MenuItem icon="chatbubble-outline" label="Chat History" onPress={() => {}} />
        <MenuItem icon="time-outline" label="Appointment History" onPress={() => {}} />
        <MenuItem icon="document-text-outline" label="Health Records" onPress={() => {}} />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
          ACCOUNT
        </Text>
        <MenuItem icon="shield-outline" label="Privacy & Security" onPress={() => {}} />
        <MenuItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
        <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => {}} />

        <View style={{ marginTop: 8 }}>
          <MenuItem icon="log-out-outline" label="Sign Out" danger onPress={handleLogout} />
        </View>

        <View style={[styles.disclaimerCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <GuestView />;
  return <ProfileView />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  guestContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  guestIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  guestSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  outlineBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
  },
  outlineBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    width: "100%",
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    fontWeight: "500" as const,
  },
  menuValue: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 16,
  },
});
