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
  { key: "chat", label: "Home", icon: "home-outline", activeIcon: "home" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
  { key: "doctors", label: "Doctors", icon: "medkit-outline", activeIcon: "medkit" },
  { key: "hospitals", label: "Hospitals", icon: "business-outline", activeIcon: "business" },
  { key: "labs", label: "Labs", icon: "flask-outline", activeIcon: "flask" },
  { key: "pharmacy", label: "Pharmacy", icon: "medical-outline", activeIcon: "medical" },
  { key: "education", label: "Learn", icon: "book-outline", activeIcon: "book" },
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
    const ITEM_WIDTH = 72;
    const offset = Math.max(0, activeIndex * ITEM_WIDTH - ITEM_WIDTH);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [activeIndex]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 6,
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
              style={styles.navItem}
              onPress={() => onPress(index)}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: isActive
                      ? colors.primary + "18"
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
                  size={22}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.primary : colors.mutedForeground,
                    fontWeight: isActive ? "700" : "400",
                  },
                ]}
              >
                {section.label}
              </Text>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.primary },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.searchBtn,
          {
            backgroundColor: colors.primary + "12",
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={() => router.push("/search" as never)}
      >
        <Ionicons name="search" size={20} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    paddingBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 0,
    gap: 4,
    alignItems: "flex-start",
  },
  navItem: {
    alignItems: "center",
    width: 68,
    paddingBottom: 6,
    paddingTop: 2,
    position: "relative",
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginBottom: 8,
  },
});
