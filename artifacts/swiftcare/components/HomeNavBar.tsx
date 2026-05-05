import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export interface NavSection {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
}

export const NAV_SECTIONS: NavSection[] = [
  { key: "chat",      label: "Home",     icon: "home-outline",    activeIcon: "home" },
  { key: "profile",   label: "Profile",  icon: "person-outline",  activeIcon: "person" },
  { key: "doctors",   label: "Doctors",  icon: "medkit-outline",  activeIcon: "medkit" },
  { key: "hospitals", label: "Hospitals",icon: "business-outline",activeIcon: "business" },
  { key: "labs",      label: "Labs",     icon: "flask-outline",   activeIcon: "flask" },
  { key: "pharmacy",  label: "Pharmacy", icon: "medical-outline", activeIcon: "medical" },
  { key: "education", label: "Learn",    icon: "book-outline",    activeIcon: "book" },
];

interface HomeNavBarProps {
  activeIndex: number;
  onPress: (index: number) => void;
}

export function HomeNavBar({ activeIndex, onPress }: HomeNavBarProps) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const ITEM_WIDTH = 64;
    const offset = Math.max(0, activeIndex * ITEM_WIDTH - ITEM_WIDTH);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [activeIndex]);

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
      >
        {NAV_SECTIONS.map((section, index) => {
          const isActive = activeIndex === index;
          return (
            <Pressable
              key={section.key}
              style={styles.tabItem}
              onPress={() => onPress(index)}
            >
              {isActive && (
                <View
                  style={[
                    styles.activeBar,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isActive
                      ? colors.primary + "15"
                      : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={
                    isActive
                      ? (section.activeIcon as never)
                      : (section.icon as never)
                  }
                  size={23}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.primary : colors.mutedForeground,
                    fontWeight: isActive ? "700" : "400",
                    fontFamily: isActive ? "Inter_700Bold" : "Inter_400Regular",
                  },
                ]}
                numberOfLines={1}
              >
                {section.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Pressable
        style={({ pressed }) => [
          styles.searchTab,
          {
            opacity: pressed ? 0.7 : 1,
            borderLeftColor: colors.border,
          },
        ]}
        onPress={() => router.push("/search" as never)}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
          <Ionicons name="search" size={23} color={colors.primary} />
        </View>
        <Text style={[styles.label, { color: colors.primary, fontFamily: "Inter_600SemiBold", fontWeight: "600" }]}>
          Search
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: 1,
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 2,
  },
  tabItem: {
    alignItems: "center",
    width: 64,
    paddingBottom: 4,
    position: "relative",
  },
  activeBar: {
    position: "absolute",
    top: -8,
    left: "20%",
    right: "20%",
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  iconWrap: {
    width: 44,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 44,
    marginTop: 4,
    alignSelf: "center",
  },
  searchTab: {
    alignItems: "center",
    width: 64,
    paddingBottom: 4,
    borderLeftWidth: 0,
  },
});
