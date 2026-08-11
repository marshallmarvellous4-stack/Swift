import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/context/AuthContext";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const BG = "#F8F9FA";
const HEADING = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const RED = "#DC2626";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.replace("/(tabs)" as never);
      } else {
        Alert.alert("Login Failed", result.error ?? "Incorrect email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
            <Ionicons name="medkit" size={28} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.sub}>Sign in to your SwiftCare account</Text>
      </View>

      <View style={styles.form}>
        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <View
            style={[
              styles.inputWrap,
              errors.email ? styles.inputWrapError : null,
            ]}
          >
            <Ionicons name="mail-outline" size={18} color={MUTED} />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={MUTED}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && (
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle-outline" size={13} color={RED} />
              <Text style={styles.fieldErrorText}>{errors.email}</Text>
            </View>
          )}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.inputWrap,
              errors.password ? styles.inputWrapError : null,
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={MUTED} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={MUTED}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="current-password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={MUTED}
              />
            </Pressable>
          </View>
          {errors.password && (
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle-outline" size={13} color={RED} />
              <Text style={styles.fieldErrorText}>{errors.password}</Text>
            </View>
          )}
        </View>

        {/* Forgot password */}
        <Pressable
          style={({ pressed }) => [styles.forgotRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.push("/auth/forgot-password" as never)}
        >
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>

        {/* Sign In button */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            !isLoading && styles.primaryBtnActive,
            { opacity: pressed && !isLoading ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <Ionicons name="reload-outline" size={18} color={MUTED} />
              <Text style={[styles.btnText, styles.btnTextDisabled]}>Signing In…</Text>
            </View>
          ) : (
            <Text style={[styles.btnText, styles.btnTextActive]}>Sign In</Text>
          )}
        </Pressable>

        {/* Register link */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Don't have an account? </Text>
          <Pressable onPress={() => router.replace("/auth/register" as never)}>
            <Text style={styles.switchLink}>Create account</Text>
          </Pressable>
        </View>
      </View>
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
    color: MUTED,
    textAlign: "center",
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
  inputWrapError: {
    borderColor: RED,
  },
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

  /* ── Forgot ── */
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    color: GREEN,
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

  /* ── Switch ── */
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: MUTED,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    color: GREEN,
  },
});
