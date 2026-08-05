import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 6;

export default function ResetPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const passwordRef = useRef<TextInput | null>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  function handleOtpInput(value: string, index: number) {
    setErrors((e) => ({ ...e, otp: undefined }));
    const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH - index);
    if (cleaned.length > 1) {
      const next = [...otp];
      for (let i = 0; i < cleaned.length; i++) {
        if (index + i < OTP_LENGTH) next[index + i] = cleaned[i];
      }
      setOtp(next);
      const nextIndex = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      if (nextIndex === OTP_LENGTH - 1 && cleaned.length >= OTP_LENGTH - index) {
        setTimeout(() => passwordRef.current?.focus(), 50);
      } else {
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const digit = cleaned.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (digit && index === OTP_LENGTH - 1) {
      setTimeout(() => passwordRef.current?.focus(), 50);
    }
  }

  function handleOtpKeyPress(e: { nativeEvent: { key: string } }, index: number) {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  function validate(): boolean {
    const e: typeof errors = {};
    const code = otp.join("");
    if (code.length < OTP_LENGTH) e.otp = "Please enter the full 6-digit code";
    if (!newPassword) e.newPassword = "Password is required";
    else if (newPassword.length < 8) e.newPassword = "Password must be at least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleReset() {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: email ?? "",
          otp: otp.join(""),
          newPassword,
        }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (err instanceof ApiError) {
        if (err.message.toLowerCase().includes("code") || err.message.toLowerCase().includes("otp")) {
          setErrors((e) => ({ ...e, otp: err.message }));
          setOtp(Array(OTP_LENGTH).fill(""));
          setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } else {
          setErrors((e) => ({ ...e, newPassword: err.message }));
        }
      } else {
        setErrors((e) => ({ ...e, otp: "Something went wrong. Please try again." }));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.successContainer,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 24,
              paddingBottom: insets.bottom + 32,
            },
          ]}
        >
          <View style={[styles.successIcon, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Password Reset!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your password has been updated. You can now sign in with your new password.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, marginTop: 8 },
            ]}
            onPress={() => router.replace("/auth/login" as never)}
          >
            <Text style={[styles.primaryBtnText, { color: "#fff" }]}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    );
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
          <Ionicons name="lock-open-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
            {email ?? "your email"}
          </Text>
        </Text>
      </View>

      <View style={styles.form}>
        {/* OTP inputs */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Reset Code</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                style={[
                  styles.otpBox,
                  {
                    borderColor: digit
                      ? colors.primary
                      : errors.otp
                      ? colors.destructive
                      : colors.border,
                    backgroundColor: colors.muted,
                    color: colors.foreground,
                  },
                ]}
                value={digit}
                onChangeText={(v) => handleOtpInput(v, i)}
                onKeyPress={(e) => handleOtpKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                textAlign="center"
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>
          {errors.otp && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errors.otp}
            </Text>
          )}
        </View>

        {/* New password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>New Password</Text>
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: errors.newPassword ? colors.destructive : colors.border,
                backgroundColor: colors.muted,
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              ref={passwordRef}
              style={[styles.input, { color: colors.foreground }]}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.mutedForeground}
              value={newPassword}
              onChangeText={(v) => {
                setNewPassword(v);
                setErrors((e) => ({ ...e, newPassword: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
            />
            <Pressable onPress={() => setShowPassword((s) => !s)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
          {errors.newPassword && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errors.newPassword}
            </Text>
          )}
        </View>

        {/* Confirm password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Confirm Password</Text>
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: errors.confirmPassword ? colors.destructive : colors.border,
                backgroundColor: colors.muted,
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Repeat new password"
              placeholderTextColor={colors.mutedForeground}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setErrors((e) => ({ ...e, confirmPassword: undefined }));
              }}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="go"
              onSubmitEditing={handleReset}
            />
            <Pressable onPress={() => setShowConfirm((s) => !s)}>
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
          {errors.confirmPassword && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errors.confirmPassword}
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
          onPress={handleReset}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.primaryBtnText,
              { color: isLoading ? colors.mutedForeground : "#fff" },
            ]}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Text>
        </Pressable>
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
  otpRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
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
  // Success state
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
