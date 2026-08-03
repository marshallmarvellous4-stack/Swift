import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const OTP_LENGTH = 6;

export default function VerifyEmailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, verifyEmail, resendOtp } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [successAnim] = useState(new Animated.Value(0));

  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  // Auto-focus first input on mount
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // If already verified (e.g. restored session), go home
  useEffect(() => {
    if (user?.isVerified) {
      router.replace("/(tabs)" as never);
    }
  }, [user?.isVerified]);

  function handleInput(value: string, index: number) {
    setError(null);
    // Handle paste — spread digits across boxes
    const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH - index);
    if (cleaned.length > 1) {
      const next = [...otp];
      for (let i = 0; i < cleaned.length; i++) {
        if (index + i < OTP_LENGTH) next[index + i] = cleaned[i];
      }
      setOtp(next);
      const nextIndex = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: { nativeEvent: { key: string } }, index: number) {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsVerifying(true);
    try {
      const result = await verifyEmail(code);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Animate success briefly before navigating
        Animated.timing(successAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => router.replace("/(tabs)" as never), 600);
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error ?? "Invalid code. Please try again.");
        // Shake effect: clear inputs and re-focus
        setOtp(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      const result = await resendOtp();
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setResendCooldown(60);
        setOtp(Array(OTP_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        setError(result.error ?? "Could not resend code. Try again.");
      }
    } finally {
      setIsResending(false);
    }
  }

  const codeComplete = otp.every((d) => d !== "");
  const successOpacity = successAnim;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.primary }]}>
            <Ionicons name="mail-outline" size={28} color="#fff" />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Verify your email
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          We sent a 6-digit code to{"\n"}
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
            {user?.email ?? "your email address"}
          </Text>
        </Text>

        {/* OTP inputs */}
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
                    : error
                    ? "#DC2626"
                    : colors.border,
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                },
              ]}
              value={digit}
              onChangeText={(v) => handleInput(v, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH} // allow paste on iOS
              textAlign="center"
              selectTextOnFocus
              caretHidden
            />
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Verify button */}
        <Animated.View style={{ opacity: successAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), width: "100%" }}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor:
                  isVerifying || !codeComplete ? colors.muted : colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleVerify}
            disabled={isVerifying || !codeComplete}
          >
            {isVerifying ? (
              <View style={styles.loadingRow}>
                <Ionicons name="reload-outline" size={18} color={colors.mutedForeground} />
                <Text style={[styles.btnText, { color: colors.mutedForeground }]}>
                  Verifying…
                </Text>
              </View>
            ) : (
              <Text style={[styles.btnText, { color: codeComplete ? "#fff" : colors.mutedForeground }]}>
                Verify Email
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Success overlay */}
        <Animated.View
          pointerEvents="none"
          style={[styles.successOverlay, { opacity: successOpacity }]}
        >
          <View style={[styles.successPill, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.successPillText}>Email verified!</Text>
          </View>
        </Animated.View>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={[styles.resendLabel, { color: colors.mutedForeground }]}>
            Didn't receive a code?{" "}
          </Text>
          {resendCooldown > 0 ? (
            <Text style={[styles.resendLabel, { color: colors.mutedForeground }]}>
              Resend in {resendCooldown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={isResending}>
              <Text style={[styles.resendLink, { color: colors.primary }]}>
                {isResending ? "Sending…" : "Resend code"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", marginBottom: 32 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  iconInner: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },
  title: {
    fontSize: 26, fontWeight: "700" as const,
    fontFamily: "Inter_700Bold", marginBottom: 10, textAlign: "center",
  },
  sub: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    lineHeight: 22, textAlign: "center", marginBottom: 36,
  },
  otpRow: {
    flexDirection: "row", gap: 10, marginBottom: 24, width: "100%",
    justifyContent: "center",
  },
  otpBox: {
    width: 48, height: 58, borderRadius: 12,
    borderWidth: 2, fontSize: 22, fontFamily: "Inter_700Bold",
  },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
    marginBottom: 16, width: "100%",
  },
  errorText: {
    flex: 1, fontSize: 13, color: "#DC2626",
    fontFamily: "Inter_400Regular", lineHeight: 18,
  },
  primaryBtn: {
    width: "100%", paddingVertical: 16,
    borderRadius: 50, alignItems: "center", marginBottom: 8,
  },
  btnText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  resendRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  resendLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resendLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  successOverlay: {
    position: "absolute", bottom: 120, alignSelf: "center",
  },
  successPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 50,
  },
  successPillText: {
    color: "#fff", fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const, fontSize: 15,
  },
});
