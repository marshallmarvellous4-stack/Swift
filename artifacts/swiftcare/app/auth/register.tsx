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
import { StateSelector } from "@/components/StateSelector";
import { useAuth } from "@/context/AuthContext";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const BG = "#F8F9FA";
const HEADING = "#111827";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const RED = "#DC2626";

const SEX_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const ROLE_OPTIONS: { value: "user" | "doctor"; label: string }[] = [
  { value: "user", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

// ─── Register screen ──────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sex, setSex] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [role, setRole] = useState<"user" | "doctor">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !sex || !stateOfOrigin || !mobileNumber) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const result = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        sex,
        stateOfOrigin,
        mobileNumber: mobileNumber.trim(),
        role,
      });
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/auth/verify-email" as never);
      } else {
        setError(result.error ?? "Could not create account. Please try again.");
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
            <Ionicons name="person-add-outline" size={28} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join SwiftCare and take control of your health</Text>
      </View>

      <View style={styles.form}>
        {/* Full name */}
        <InputField
          label="Full Name"
          icon="person-outline"
          value={fullName}
          onChangeText={setFullName}
          placeholder="John Doe"
        />

        {/* Email */}
        <InputField
          label="Email Address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Mobile */}
        <InputField
          label="Mobile Number"
          icon="call-outline"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="+234 800 000 0000"
          keyboardType="phone-pad"
        />

        {/* Gender */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipsRow}>
            {SEX_OPTIONS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.chip,
                  sex === s && styles.chipActive,
                ]}
                onPress={() => setSex(s)}
              >
                <Text style={[styles.chipText, sex === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* State of Origin */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>State of Origin</Text>
          <StateSelector
            value={stateOfOrigin}
            onChange={setStateOfOrigin}
            placeholder="Select your state of origin"
            required
          />
        </View>

        {/* Account type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.chipsRow}>
            {ROLE_OPTIONS.map((r) => (
              <Pressable
                key={r.value}
                style={[
                  styles.chip,
                  styles.chipFlex,
                  role === r.value && styles.chipActive,
                ]}
                onPress={() => setRole(r.value)}
              >
                <Text
                  style={[styles.chipText, role === r.value && styles.chipTextActive]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={MUTED} />
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor={MUTED}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              autoCapitalize="none"
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
        </View>

        {/* Confirm password */}
        <InputField
          label="Confirm Password"
          icon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          secureTextEntry
        />

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={RED} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            !isLoading && styles.primaryBtnActive,
            { opacity: pressed && !isLoading ? 0.85 : 1 },
          ]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <Ionicons name="reload-outline" size={18} color={MUTED} />
              <Text style={[styles.btnText, styles.btnTextDisabled]}>
                Creating Account…
              </Text>
            </View>
          ) : (
            <Text style={[styles.btnText, styles.btnTextActive]}>
              Create Account
            </Text>
          )}
        </Pressable>

        {/* Sign in link */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/auth/login" as never)}>
            <Text style={styles.switchLink}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

// ─── Shared input component ───────────────────────────────────────────────────

function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "email-address" | "phone-pad";
  autoCapitalize?: "none";
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon as never} size={18} color={MUTED} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 20,
    padding: 4,
  },

  /* ── Header ── */
  topSection: {
    alignItems: "center",
    marginBottom: 28,
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
    lineHeight: 20,
  },

  /* ── Form ── */
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
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
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: HEADING,
  },

  /* ── Chips ── */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
  },
  chipFlex: { flex: 1 },
  chipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    fontFamily: "Inter_500Medium",
    color: MUTED,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600" as const,
  },

  /* ── Error banner ── */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: RED,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },

  /* ── Button ── */
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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
