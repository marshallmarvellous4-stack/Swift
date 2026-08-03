/**
 * VerificationBanner — shown at the top of every tab screen for users whose
 * email has not yet been confirmed. Tapping it navigates to the OTP screen.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export function VerificationBanner() {
  const { user } = useAuth();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isVerified || dismissed) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 10,
          paddingBottom: 10,
          backgroundColor: "#FEF3C7",
          borderBottomColor: "#FDE68A",
        },
      ]}
    >
      <Pressable
        style={styles.inner}
        onPress={() => router.push("/auth/verify-email" as never)}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="mail-unread-outline" size={18} color="#92400E" />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Verify your email address</Text>
          <Text style={styles.sub}>
            Tap here to enter your 6-digit code and unlock full access.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#92400E" />
      </Pressable>

      <Pressable
        style={styles.dismissBtn}
        onPress={() => setDismissed(true)}
        hitSlop={8}
      >
        <Ionicons name="close" size={16} color="#A16207" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 24,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    color: "#92400E",
    marginBottom: 1,
  },
  sub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#A16207",
    lineHeight: 16,
  },
  dismissBtn: {
    position: "absolute",
    top: 8,
    right: 0,
    padding: 4,
  },
});
