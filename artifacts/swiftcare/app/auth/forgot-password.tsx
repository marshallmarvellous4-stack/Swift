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
import { ApiError, apiFetch } from "@/utils/api";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const BG = "#F8F9FA";
const HEADING = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const RED = "#DC2626";

export default function ForgotPasswordScreen() {
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
      style={styles.container}
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
        <Ionicons name="arrow-back" size={24} color={HEADING} />
      </Pressable>

      {/* Header */}
      <View style={styles.topSection}>
        <View style={styles.iconCircle}>
          <View style={styles.iconInner}>
            <Ionicons name="key-outline" size={28} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.sub}>
          {sent
            ? "If an account exists for that email, a reset code has been sent."
            : "Enter your email address and we'll send you a reset code."}
        </Text>
      </View>

      {!sent ? (
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrap, emailError ? styles.inputWrapError : null]}>
              <Ionicons name="mail-outline" size={18} color={MUTED} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={MUTED}
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
              <View style={styles.fieldError}>
                <Ionicons name="alert-circle-outline" size={13} color={RED} />
                <Text style={styles.fieldErrorText}>{emailError}</Text>
              </View>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              !isLoading && styles.primaryBtnActive,
              { opacity: pressed && !isLoading ? 0.85 : 1 },
            ]}
            onPress={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <Ionicons name="reload-outline" size={18} color={MUTED} />
                <Text style={[styles.btnText, styles.btnTextDisabled]}>Sending…</Text>
              </View>
            ) : (
              <Text style={[styles.btnText, styles.btnTextActive]}>Send Reset Code</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          {/* Success notice */}
          <View style={styles.successBox}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={20} color={GREEN} />
            </View>
            <Text style={styles.successText}>
              Check your inbox for the 6-digit reset code.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnActive,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleContinue}
          >
            <Text style={[styles.btnText, styles.btnTextActive]}>Enter Reset Code</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={() => setSent(false)}
          >
            <Text style={styles.secondaryBtnText}>Try a different email</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 24,
    padding: 4,
  },

  /* ── Header ── */
  topSection: {
    alignItems: "center",
    marginBottom: 36,
    gap: 10,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    color: HEADING,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    color: MUTED,
    paddingHorizontal: 16,
  },

  /* ── Form ── */
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    color: HEADING,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    ...Platform.select({
      native: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      web: { boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
      default: {},
    }),
  } as const,
  inputWrapError: { borderColor: RED },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: HEADING,
  },
  fieldError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  fieldErrorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: RED,
  },

  /* ── Button ── */
  primaryBtn: {
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#E5E7EB",
  },
  primaryBtnActive: {
    backgroundColor: GREEN,
    ...Platform.select({
      native: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      web: { boxShadow: "0 4px 12px rgba(22,163,74,0.30)" },
      default: {},
    }),
  } as const,
  btnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  btnTextActive: { color: "#FFFFFF" },
  btnTextDisabled: { color: MUTED },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  secondaryBtn: { alignItems: "center", paddingVertical: 8 },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },

  /* ── Success notice ── */
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    backgroundColor: GREEN_LIGHT,
    borderColor: "#BBF7D0",
  },
  successIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#166534",
    lineHeight: 20,
  },
});
