import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useColors } from "@/hooks/useColors";
import { ApiError, apiFetch } from "@/utils/api";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  }

  async function handleSend() {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch (err) {
      // Always show "sent" to avoid email enumeration — errors only for network issues
      if (err instanceof ApiError && err.status === 0) {
        setEmailError("Cannot reach the server. Check your connection.");
      } else {
        // Even on unexpected server errors, show success to avoid enumeration
        setSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinue() {
    router.push({
      pathname: "/auth/reset-password" as never,
      params: { email: email.trim().toLowerCase() },
    });
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32,
        paddingHorizontal: 24,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
      </Pressable>

      <View style={styles.topSection}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name="key-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Forgot Password?</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {sent
            ? "If an account exists for that email, a reset code has been sent."
            : "Enter your email address and we'll send you a reset code."}
        </Text>
      </View>

      {!sent ? (
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: emailError ? colors.destructive : colors.border,
                  backgroundColor: colors.muted,
                },
              ]}
            >
              <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setEmailError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
            </View>
            {emailError && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {emailError}
              </Text>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: isLoading ? colors.muted : colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.primaryBtnText,
                { color: isLoading ? colors.mutedForeground : "#fff" },
              ]}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <View
            style={[
              styles.successBox,
              { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.successText, { color: colors.primary }]}>
              Check your inbox for the 6-digit reset code.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleContinue}
          >
            <Text style={[styles.primaryBtnText, { color: "#fff" }]}>
              Enter Reset Code
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => setSent(false)}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>
              Try a different email
            </Text>
          </Pressable>
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginBottom: 24, alignSelf: "flex-start" },
  topSection: {
    alignItems: "center",
    marginBottom: 32,
    gap: 10,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
