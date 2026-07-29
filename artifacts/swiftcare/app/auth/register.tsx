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
import { StateSelector } from "@/components/StateSelector";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const SEX_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const ROLE_OPTIONS: { value: "user" | "doctor" | "admin"; label: string }[] = [
  { value: "user", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "admin", label: "Admin" },
];

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
  const [role, setRole] = useState<"user" | "doctor" | "admin">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password || !sex || !stateOfOrigin || !mobileNumber) {
      Alert.alert("Missing Information", "Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const success = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        sex,
        stateOfOrigin,
        mobileNumber: mobileNumber.trim(),
        role,
      });
      if (success) {
        Alert.alert(
          "Account Created!",
          "Welcome to SwiftCare. Your account has been created successfully.",
          [{ text: "Continue", onPress: () => router.replace("/(tabs)" as never) }]
        );
      } else {
        Alert.alert("Registration Failed", "An account with this email already exists.");
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
          <Text style={[styles.primaryBtnText, { color: isLoading ? colors.mutedForeground : "#fff" }]}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Text>
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
  );
}

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  topSection: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  form: { gap: 16 },
  fieldGroup: { gap: 8 },
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
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    fontFamily: "Inter_500Medium",
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
