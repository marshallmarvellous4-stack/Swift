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
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
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
          <Ionicons name="medkit" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome Back</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Sign in to your SwiftCare account
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: errors.email ? colors.destructive : colors.border,
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
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          {errors.email && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errors.email}
            </Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: errors.password ? colors.destructive : colors.border,
                backgroundColor: colors.muted,
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedForeground}
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
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
          {errors.password && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errors.password}
            </Text>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.forgotRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.push("/auth/forgot-password" as never)}
        >
          <Text style={[styles.forgotLink, { color: colors.primary }]}>
            Forgot password?
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: isLoading ? colors.muted : colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={[styles.primaryBtnText, { color: isLoading ? colors.mutedForeground : "#fff" }]}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </Pressable>

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
            Don't have an account?
          </Text>
          <Pressable onPress={() => router.replace("/auth/register" as never)}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>
              Create account
            </Text>
          </Pressable>
        </View>
      </View>
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
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
