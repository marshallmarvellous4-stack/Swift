import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
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
import { useColors } from "@/hooks/useColors";

const SEX_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const ROLE_OPTIONS: { value: "user" | "doctor"; label: string }[] = [
  { value: "user", label: "Patient" },
  { value: "doctor", label: "Doctor" },
];

// ─── Success modal ────────────────────────────────────────────────────────────

function SuccessModal({
  visible,
  userName,
  onContinue,
}: {
  visible: boolean;
  userName: string;
  onContinue: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Card pop-in
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Check-mark springs in after card appears
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }).start();
      });
    } else {
      scale.setValue(0.7);
      opacity.setValue(0);
      checkScale.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              paddingBottom: insets.bottom + 24,
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          {/* Circle icon */}
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <View style={[styles.iconInner, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={36} color="#fff" />
              </View>
            </Animated.View>
          </View>

          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Account Created!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Welcome to SwiftCare, {userName.split(" ")[0]}.{"\n"}
            Your account is ready and you're all set.
          </Text>

          {/* Divider */}
          <View style={[styles.successDivider, { backgroundColor: colors.border }]} />

          {/* Trust indicators */}
          <View style={styles.trustRow}>
            {[
              { icon: "shield-checkmark-outline" as const, text: "Secure login" },
              { icon: "lock-closed-outline" as const, text: "Password encrypted" },
              { icon: "person-circle-outline" as const, text: "Profile ready" },
            ].map(({ icon, text }) => (
              <View key={text} style={styles.trustItem}>
                <Ionicons name={icon} size={18} color={colors.primary} />
                <Text style={[styles.trustText, { color: colors.mutedForeground }]}>{text}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={onContinue}
          >
            <Text style={styles.continueBtnText}>Go to Dashboard</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Register screen ──────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const colors = useColors();
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
  const [showSuccess, setShowSuccess] = useState(false);

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
        setShowSuccess(true);
      } else {
        setError(result.error ?? "Could not create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
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
          <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Join SwiftCare and take control of your health
          </Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Full Name"
            icon="person-outline"
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            colors={colors}
          />
          <InputField
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            colors={colors}
          />
          <InputField
            label="Mobile Number"
            icon="call-outline"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="+234 800 000 0000"
            keyboardType="phone-pad"
            colors={colors}
          />

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Gender</Text>
            <View style={styles.optionsRow}>
              {SEX_OPTIONS.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: sex === s ? colors.primary : colors.muted,
                      borderColor: sex === s ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSex(s)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: sex === s ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>State of Origin</Text>
            <StateSelector
              value={stateOfOrigin}
              onChange={setStateOfOrigin}
              placeholder="Select your state of origin"
              required
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Account Type</Text>
            <View style={styles.optionsRow}>
              {ROLE_OPTIONS.map((r) => (
                <Pressable
                  key={r.value}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: role === r.value ? colors.primary : colors.muted,
                      borderColor: role === r.value ? colors.primary : colors.border,
                      flex: 1,
                    },
                  ]}
                  onPress={() => setRole(r.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: role === r.value ? "#fff" : colors.mutedForeground },
                    ]}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.mutedForeground}
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
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>

          <InputField
            label="Confirm Password"
            icon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            secureTextEntry
            colors={colors}
          />

          {/* Inline error banner */}
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: isLoading ? colors.muted : colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <Ionicons name="reload-outline" size={18} color={colors.mutedForeground} />
                <Text style={[styles.primaryBtnText, { color: colors.mutedForeground }]}>
                  Creating Account…
                </Text>
              </View>
            ) : (
              <Text style={[styles.primaryBtnText, { color: "#fff" }]}>
                Create Account
              </Text>
            )}
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.replace("/auth/login" as never)}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      <SuccessModal
        visible={showSuccess}
        userName={fullName}
        onContinue={() => {
          setShowSuccess(false);
          router.replace("/(tabs)" as never);
        }}
      />
    </>
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
  colors,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "email-address" | "phone-pad";
  autoCapitalize?: "none";
  secureTextEntry?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Ionicons name={icon as never} size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
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
  container: { flex: 1 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  topSection: { marginBottom: 24, gap: 8 },
  title: { fontSize: 26, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, alignItems: "center",
  },
  optionText: { fontSize: 13, fontWeight: "500" as const, fontFamily: "Inter_500Medium" },
  errorBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  errorText: {
    flex: 1, fontSize: 13, color: "#DC2626", fontFamily: "Inter_400Regular", lineHeight: 18,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  primaryBtn: { paddingVertical: 16, borderRadius: 50, alignItems: "center", marginTop: 8 },
  primaryBtnText: { fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  loginRow: { flexDirection: "row", justifyContent: "center", gap: 4 },
  loginText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },

  // ── Success modal
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center", paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%", borderRadius: 24, borderWidth: 1,
    paddingTop: 36, paddingHorizontal: 28,
    alignItems: "center", gap: 0,
    shadowColor: "#000", shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18, shadowRadius: 40, elevation: 20,
  },
  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  iconInner: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontSize: 24, fontWeight: "700" as const, fontFamily: "Inter_700Bold",
    marginBottom: 10, textAlign: "center",
  },
  successSub: {
    fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center",
    lineHeight: 22, marginBottom: 24,
  },
  successDivider: { width: "100%", height: 1, marginBottom: 20 },
  trustRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 28 },
  trustItem: { alignItems: "center", gap: 6 },
  trustText: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, width: "100%", paddingVertical: 16, borderRadius: 50, marginBottom: 4,
  },
  continueBtnText: {
    fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold", color: "#fff",
  },
});
