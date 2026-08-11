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
import { ApiError, apiFetch } from "@/utils/api";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const BG = "#F8F9FA";
const HEADING = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const RED = "#DC2626";
const OTP_LENGTH = 6;

export default function ResetPasswordScreen() {
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

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.successContainer,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 24,
              paddingBottom: insets.bottom + 32,
            },
          ]}
        >
          <View style={styles.successIconCircle}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successSub}>
            Your password has been updated. You can now sign in with your new password.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnActive,
              { opacity: pressed ? 0.85 : 1, marginTop: 8 },
            ]}
            onPress={() => router.replace("/auth/login" as never)}
          >
            <Text style={[styles.btnText, styles.btnTextActive]}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
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
            <Ionicons name="lock-open-outline" size={28} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.sub}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={styles.emailHighlight}>{email ?? "your email"}</Text>
        </Text>
      </View>

      <View style={styles.form}>
        {/* OTP row */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reset Code</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                style={[
                  styles.otpBox,
                  digit && styles.otpBoxFilled,
                  !!errors.otp && styles.otpBoxError,
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
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle-outline" size={13} color={RED} />
              <Text style={styles.fieldErrorText}>{errors.otp}</Text>
            </View>
          )}
        </View>

        {/* New password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={[styles.inputWrap, errors.newPassword ? styles.inputWrapError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color={MUTED} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={MUTED}
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
                color={MUTED}
              />
            </Pressable>
          </View>
          {errors.newPassword && (
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle-outline" size={13} color={RED} />
              <Text style={styles.fieldErrorText}>{errors.newPassword}</Text>
            </View>
          )}
        </View>

        {/* Confirm password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={[styles.inputWrap, errors.confirmPassword ? styles.inputWrapError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color={MUTED} />
            <TextInput
              style={styles.input}
              placeholder="Repeat new password"
              placeholderTextColor={MUTED}
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
                color={MUTED}
              />
            </Pressable>
          </View>
          {errors.confirmPassword && (
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle-outline" size={13} color={RED} />
              <Text style={styles.fieldErrorText}>{errors.confirmPassword}</Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            !isLoading && styles.primaryBtnActive,
            { opacity: pressed && !isLoading ? 0.85 : 1 },
          ]}
          onPress={handleReset}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <Ionicons name="reload-outline" size={18} color={MUTED} />
              <Text style={[styles.btnText, styles.btnTextDisabled]}>Resetting…</Text>
            </View>
          ) : (
            <Text style={[styles.btnText, styles.btnTextActive]}>Reset Password</Text>
          )}
        </Pressable>
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
    textAlign: "center",
    lineHeight: 22,
    color: MUTED,
    paddingHorizontal: 16,
  },
  emailHighlight: {
    color: GREEN,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
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

  /* ── OTP ── */
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: BORDER,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    fontWeight: "700" as const,
    color: HEADING,
    ...Platform.select({
      native: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      web: { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
      default: {},
    }),
  } as const,
  otpBoxFilled: { borderColor: GREEN },
  otpBoxError: { borderColor: RED },

  /* ── Inputs ── */
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

  /* ── Success state ── */
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    color: HEADING,
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    color: MUTED,
    paddingHorizontal: 16,
  },
});
