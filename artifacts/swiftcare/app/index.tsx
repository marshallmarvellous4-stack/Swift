import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16A34A" />

      <View style={styles.bgTop} />
      <View style={styles.bgWave} />

      <Animated.View
        entering={FadeInUp.delay(200).duration(800)}
        style={[
          styles.logoSection,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 40 },
        ]}
      >
        <Image
          source={require("../assets/images/splash.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(600).duration(600)}
        style={styles.tagline}
      >
        <Text style={styles.taglineText}>Smarter Health Starts Here.</Text>
        <Text style={styles.subTagline}>
          AI-assisted healthcare guidance at your fingertips
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(900).duration(600)}
        style={[
          styles.bottomSection,
          {
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 32,
          },
        ]}
      >
        <Text style={styles.disclaimer}>
          SwiftCare does not replace professional medical advice.{"\n"}For
          emergencies, visit the nearest hospital immediately.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={() => router.replace("/(tabs)" as never)}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  bgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    backgroundColor: "#22C55E",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  bgWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    backgroundColor: "#15803D",
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
  logoSection: {
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: width * 0.75,
    height: height * 0.38,
  },
  tagline: {
    alignItems: "center",
    zIndex: 10,
    marginTop: 8,
    paddingHorizontal: 32,
    gap: 8,
  },
  taglineText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  subTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
    zIndex: 10,
  },
  disclaimer: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#16A34A",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
