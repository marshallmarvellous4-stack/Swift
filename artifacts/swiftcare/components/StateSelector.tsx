import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export interface StateSelectorProps {
  value: string;
  onChange: (state: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function StateSelector({
  value,
  onChange,
  placeholder = "Select your state of origin",
  required = false,
  disabled = false,
}: StateSelectorProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<TextInput>(null);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(400)).current;

  const filtered = useMemo(
    () =>
      query.trim()
        ? NIGERIAN_STATES.filter((s) =>
            s.toLowerCase().includes(query.toLowerCase())
          )
        : NIGERIAN_STATES,
    [query]
  );

  const openSheet = useCallback(() => {
    if (disabled) return;
    Haptics.selectionAsync();
    setQuery("");
    setOpen(true);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslate, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      searchRef.current?.focus();
    });
  }, [disabled, backdropOpacity, sheetTranslate]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslate, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOpen(false);
      setQuery("");
    });
  }, [backdropOpacity, sheetTranslate]);

  const handleSelect = useCallback(
    (state: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(state);
      closeSheet();
    },
    [onChange, closeSheet]
  );

  const hasValue = Boolean(value);

  return (
    <>
      {/* Trigger field */}
      <Pressable
        onPress={openSheet}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          {
            borderColor: hasValue ? "#22C55E" : "#E5E7EB",
            backgroundColor: disabled ? colors.muted : colors.card ?? "#fff",
            opacity: pressed ? 0.75 : disabled ? 0.55 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={value || placeholder}
        accessibilityState={{ disabled }}
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={hasValue ? "#22C55E" : colors.mutedForeground}
        />
        <Text
          style={[
            styles.triggerText,
            {
              color: hasValue ? colors.foreground : colors.mutedForeground,
              flex: 1,
            },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name={hasValue ? "checkmark-circle" : "chevron-down"}
          size={18}
          color={hasValue ? "#22C55E" : colors.mutedForeground}
        />
      </Pressable>

      {/* Modal */}
      <Modal
        visible={open}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={closeSheet}
      >
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        {/* Bottom sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 16 : 8),
              transform: [{ translateY: sheetTranslate }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              State of Origin{required ? " *" : ""}
            </Text>
            <Pressable
              onPress={closeSheet}
              hitSlop={12}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Ionicons name="close-circle" size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Search bar */}
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={17} color="#9CA3AF" />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search states…"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              clearButtonMode="while-editing"
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
            />
            {query.length > 0 && Platform.OS !== "ios" && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* State list */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                <Text style={styles.emptyText}>
                  No state matches "{query}"
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [
                    styles.stateRow,
                    {
                      backgroundColor: selected
                        ? "#F0FDF4"
                        : pressed
                        ? "#F9FAFB"
                        : "transparent",
                    },
                  ]}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.stateName,
                      { color: selected ? "#22C55E" : "#111827" },
                    ]}
                  >
                    {item}
                  </Text>
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22C55E"
                    />
                  )}
                </Pressable>
              );
            }}
          />
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Trigger ────────────────────────────────────────────────────────────────
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  triggerText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },

  // ── Modal backdrop ─────────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // ── Bottom sheet ───────────────────────────────────────────────────────────
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },

  handleRow: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  // ── Search bar ─────────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    padding: 0,
  },

  // ── List ───────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 12,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 10,
    minHeight: 50,
  },
  stateName: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
  },
});
