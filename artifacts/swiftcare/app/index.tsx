import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const CAROUSEL_HEIGHT = height * 0.62;
const SLIDE_DURATION = 4000;
const FADE_DURATION = 700;

const SLIDES = [
  require("../assets/images/splash_pharmacy.jpg"),
  require("../assets/images/splash_stethoscope.jpg"),
  require("../assets/images/splash_dental.jpg"),
  require("../assets/images/splash_corridor.jpg"),
];

function CarouselSlide({
  source,
  visible,
}: {
  source: ReturnType<typeof require>;
  visible: boolean;
}) {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: FADE_DURATION });
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
      <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </Animated.View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── TOP CAROUSEL SECTION ── */}
      <View style={[styles.carouselSection, { height: CAROUSEL_HEIGHT }]}>
        {/* stacked images with cross-fade */}
        {SLIDES.map((src, i) => (
          <CarouselSlide key={i} source={src} visible={i === activeIndex} />
        ))}

        {/* dark overlay */}
        <View style={styles.overlay} />

        {/* top inset spacer so status bar text stays clear */}
        <View style={{ height: insets.top + (Platform.OS === "web" ? 44 : 0) }} />

        {/* text content inside carousel */}
        <Animated.View
          entering={FadeIn.delay(400).duration(700)}
          style={styles.carouselContent}
        >
          <Text style={styles.taglineText}>Smarter Health Starts Here.</Text>
          <Text style={styles.subTagline}>Talk to a medical doctor</Text>
        </Animated.View>

        {/* pagination dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* ── BOTTOM DARK-GREEN SECTION ── */}
      <Animated.View
        entering={FadeInDown.delay(600).duration(600)}
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
            {
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
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
    backgroundColor: "#15803D",
  },

  /* ── Carousel ── */
  carouselSection: {
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: "#1a1a1a",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  carouselContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  taglineText: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
    // RN native text shadow (cross-platform)
    ...Platform.select({
      native: {
        textShadowColor: "rgba(0,0,0,0.4)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
      },
      default: {},
    }),
  } as const,
  subTagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    ...Platform.select({
      native: {
        textShadowColor: "rgba(0,0,0,0.35)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
      },
      default: {},
    }),
  } as const,

  /* ── Dots ── */
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingBottom: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },

  /* ── Bottom section ── */
  bottomSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 32,
    gap: 16,
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
    elevation: 6,
    ...Platform.select({
      native: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      web: {
        boxShadow: "0px 4px 12px rgba(0,0,0,0.20)",
      },
      default: {},
    }),
  } as const,
  ctaText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#16A34A",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
