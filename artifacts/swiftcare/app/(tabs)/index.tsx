import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatBubble } from "@/components/ChatBubble";
import { DoctorCard } from "@/components/DoctorCard";
import { EducationCard } from "@/components/EducationCard";
import { HospitalCard } from "@/components/HospitalCard";
import { HomeNavBar, NAV_SECTIONS } from "@/components/HomeNavBar";
import { LabCard } from "@/components/LabCard";
import { PharmacyCard } from "@/components/PharmacyCard";
import { ProfileDashboard } from "@/components/ProfileDashboard";
import { useAuth } from "@/context/AuthContext";
import { DOCTORS } from "@/data/doctors";
import { ARTICLES } from "@/data/education";
import { HOSPITALS } from "@/data/hospitals";
import { LABS } from "@/data/labs";
import { PHARMACIES } from "@/data/pharmacies";
import { useColors } from "@/hooks/useColors";
import {
  ChatMessage,
  createMessage,
  detectIntent,
  getChatbotResponse,
} from "@/utils/chatbot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const WELCOME: ChatMessage = createMessage(
  "Hello! I'm your SwiftCare health assistant. I'm here to provide safe, general health guidance.\n\nDescribe your symptoms or ask about fever, malaria, nutrition, mental health, and more.\n\nHow can I help you today?\n\n⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.",
  "assistant"
);

// ─── Section: Chat ────────────────────────────────────────────────────────────
interface ChatSectionProps {
  onNavigateToDoctors: () => void;
  onNavigateToHospitals: () => void;
}

function ChatSection({ onNavigateToDoctors, onNavigateToHospitals }: ChatSectionProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");
    setMessages((prev) => [createMessage(text, "user"), ...prev]);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const intent = detectIntent(text);

    if (intent === "doctor_consultation") {
      setMessages((prev) => [
        createMessage(
          "I can connect you with one of our verified healthcare professionals. Tap below to browse available doctors and book a consultation.",
          "assistant",
          "doctor_consultation"
        ),
        ...prev,
      ]);
    } else if (intent === "urgent") {
      setMessages((prev) => [
        createMessage(getChatbotResponse(text), "assistant", "urgent"),
        ...prev,
      ]);
    } else {
      setMessages((prev) => [createMessage(getChatbotResponse(text), "assistant"), ...prev]);
    }

    setIsTyping(false);
    inputRef.current?.focus();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            onConsultDoctor={onNavigateToDoctors}
            onFindEmergency={onNavigateToHospitals}
          />
        )}
        inverted
        contentContainerStyle={styles.chatList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <View style={[styles.typingBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.dotsRow}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: colors.mutedForeground }]} />
                  ))}
                </View>
              </View>
            </View>
          ) : null
        }
      />
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 4,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Describe how you feel..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={18} color={input.trim() ? "#fff" : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Section: Profile ─────────────────────────────────────────────────────────
function ProfileSection() {
  return <ProfileDashboard />;
}

// ─── Filter chip sets ─────────────────────────────────────────────────────────
const SPECIALTY_FILTERS = ["All", "General Practitioner", "Cardiologist", "Pediatrician", "Dermatologist", "Gynecologist", "Psychiatrist"];
const CONSULT_TYPE_FILTERS = ["All", "Chat", "Voice", "Video"];
const AVAILABILITY_FILTERS = ["All", "Online", "Busy", "Offline"];
const RATING_FILTERS = ["All", "4.9+", "4.8+", "4.5+"];
const LANGUAGE_FILTERS = ["All", "English", "Yoruba", "Igbo", "Hausa", "French"];

interface FilterChipsProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}

function FilterChips({ label, options, selected, onSelect }: FilterChipsProps) {
  const colors = useColors();
  return (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <Pressable
              key={opt}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.primary : colors.muted,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[styles.filterChipText, { color: active ? "#fff" : colors.mutedForeground }]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Section: Doctors ─────────────────────────────────────────────────────────
function DoctorsSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [consultType, setConsultType] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [language, setLanguage] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = DOCTORS.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
    const matchSpecialty = specialty === "All" || d.specialty === specialty;
    const matchAvailability = availability === "All" || d.status === availability.toLowerCase();
    const matchRating =
      ratingFilter === "All" ||
      (ratingFilter === "4.9+" && d.rating >= 4.9) ||
      (ratingFilter === "4.8+" && d.rating >= 4.8) ||
      (ratingFilter === "4.5+" && d.rating >= 4.5);
    const matchLanguage = language === "All" || d.languages.includes(language);
    return matchSearch && matchSpecialty && matchAvailability && matchRating && matchLanguage;
  });

  const activeFilterCount = [specialty, consultType, availability, ratingFilter, language].filter((v) => v !== "All").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.sectionHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Find Doctors</Text>
          <Pressable
            style={[
              styles.filterToggleBtn,
              {
                backgroundColor: activeFilterCount > 0 ? colors.primary : colors.muted,
                borderColor: activeFilterCount > 0 ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setShowFilters((v) => !v)}
          >
            <Ionicons name="options-outline" size={15} color={activeFilterCount > 0 ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.filterToggleText, { color: activeFilterCount > 0 ? "#fff" : colors.mutedForeground }]}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Text>
          </Pressable>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or specialty..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Filter Panel */}
        {showFilters && (
          <View style={[styles.filterPanel, { borderTopColor: colors.border }]}>
            <FilterChips label="Specialty" options={SPECIALTY_FILTERS} selected={specialty} onSelect={setSpecialty} />
            <FilterChips label="Consultation Type" options={CONSULT_TYPE_FILTERS} selected={consultType} onSelect={setConsultType} />
            <FilterChips label="Availability" options={AVAILABILITY_FILTERS} selected={availability} onSelect={setAvailability} />
            <FilterChips label="Rating" options={RATING_FILTERS} selected={ratingFilter} onSelect={setRatingFilter} />
            <FilterChips label="Language" options={LANGUAGE_FILTERS} selected={language} onSelect={setLanguage} />
            {activeFilterCount > 0 && (
              <Pressable
                style={[styles.clearFiltersBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setSpecialty("All");
                  setConsultType("All");
                  setAvailability("All");
                  setRatingFilter("All");
                  setLanguage("All");
                }}
              >
                <Ionicons name="refresh-outline" size={13} color={colors.mutedForeground} />
                <Text style={[styles.clearFiltersText, { color: colors.mutedForeground }]}>Clear all filters</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Results count */}
      <View style={[styles.resultsRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.resultsText, { color: colors.mutedForeground }]}>
          {filtered.length} verified doctor{filtered.length !== 1 ? "s" : ""} found
        </Text>
        <View style={[styles.onlinePill, { backgroundColor: "#22C55E18" }]}>
          <View style={[styles.onlineDot, { backgroundColor: "#22C55E" }]} />
          <Text style={[styles.onlinePillText, { color: "#16A34A" }]}>
            {DOCTORS.filter((d) => d.status === "online").length} Online
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <DoctorCard doctor={item} />}
        ListEmptyComponent={<EmptyState icon="person-outline" message="No doctors match your filters" />}
      />
    </View>
  );
}

// ─── Section: Hospitals ───────────────────────────────────────────────────────
function HospitalsSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const types = ["All", "General Hospital", "Private Clinic", "Teaching Hospital", "Specialist Hospital"];
  const filtered = HOSPITALS.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q);
    const matchType = type === "All" || h.type === type;
    return matchSearch && matchType;
  });
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Hospitals</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search hospitals..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {types.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, { backgroundColor: type === t ? colors.primary : colors.muted, borderColor: type === t ? colors.primary : colors.border }]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.chipText, { color: type === t ? "#fff" : colors.mutedForeground }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <HospitalCard hospital={item} />}
        ListEmptyComponent={<EmptyState icon="business-outline" message="No hospitals found" />}
      />
    </View>
  );
}

// ─── Section: Labs ────────────────────────────────────────────────────────────
function LabsSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const filtered = LABS.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.availableTests.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Diagnostic Labs</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search labs or tests..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <LabCard lab={item} />}
        ListEmptyComponent={<EmptyState icon="flask-outline" message="No labs found" />}
      />
    </View>
  );
}

// ─── Section: Pharmacy ────────────────────────────────────────────────────────
function PharmacySection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const filtered = PHARMACIES.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Pharmacies</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search pharmacies..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={[styles.safetyBanner, { backgroundColor: "#FEF9C3", borderColor: "#FDE047" }]}>
          <Ionicons name="warning-outline" size={14} color="#92400E" />
          <Text style={[styles.safetyText, { color: "#92400E" }]}>
            Only take medicines as prescribed by a qualified healthcare professional.
          </Text>
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PharmacyCard pharmacy={item} />}
        ListEmptyComponent={<EmptyState icon="medical-outline" message="No pharmacies found" />}
      />
    </View>
  );
}

// ─── Section: Education ───────────────────────────────────────────────────────
function EducationSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const filtered = ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Health Education</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search articles..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <EducationCard article={item} />}
        ListEmptyComponent={<EmptyState icon="book-outline" message="No articles found" />}
      />
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon, message }: { icon: string; message: string }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon as never} size={48} color={colors.mutedForeground} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{message}</Text>
    </View>
  );
}

// ─── Main Home Screen ─────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function scrollToSection(index: number) {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  }

  function handleScrollEnd(e: any) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }

  const sections = [
    <ChatSection
      onNavigateToDoctors={() => scrollToSection(2)}
      onNavigateToHospitals={() => scrollToSection(3)}
    />,
    <ProfileSection />,
    <DoctorsSection />,
    <HospitalsSection />,
    <LabsSection />,
    <PharmacySection />,
    <EducationSection />,
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        style={{ flex: 1 }}
        scrollEnabled
        decelerationRate="fast"
        nestedScrollEnabled
      >
        {sections.map((section, index) => (
          <View key={NAV_SECTIONS[index].key} style={{ width: SCREEN_WIDTH, flex: 1 }}>
            {section}
          </View>
        ))}
      </ScrollView>
      <HomeNavBar activeIndex={activeIndex} onPress={scrollToSection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Chat styles
  chatList: { paddingVertical: 12 },
  typingRow: { paddingHorizontal: 16, marginBottom: 8 },
  typingBubble: {
    borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, alignSelf: "flex-start",
  },
  dotsRow: { flexDirection: "row", gap: 4, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, opacity: 0.6 },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 12, paddingTop: 8,
    borderTopWidth: 1, gap: 10,
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 100,
    borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },

  // Profile styles
  guestWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    padding: 32, gap: 14,
  },
  guestIcon: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: "center", justifyContent: "center",
  },
  guestTitle: {
    fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  guestSub: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 20,
  },
  primaryBtn: {
    width: "100%", paddingVertical: 15, borderRadius: 50, alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff", fontSize: 16,
    fontWeight: "700" as const, fontFamily: "Inter_700Bold",
  },
  outlineBtn: {
    width: "100%", paddingVertical: 15, borderRadius: 50,
    alignItems: "center", borderWidth: 2,
  },
  outlineBtnText: {
    fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold",
  },
  profileHero: {
    alignItems: "center", paddingTop: 32, paddingBottom: 28, paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  avatarText: {
    fontSize: 34, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold",
  },
  profileName: {
    fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold",
  },
  profileEmail: {
    fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular", marginTop: 4,
  },
  rolePill: {
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14,
    paddingVertical: 5, borderRadius: 20, marginTop: 10,
  },
  rolePillText: {
    color: "#fff", fontSize: 11,
    fontWeight: "700" as const, fontFamily: "Inter_700Bold", letterSpacing: 1,
  },
  profileRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  profileRowIcon: {
    width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  profileRowLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  profileRowValue: {
    fontSize: 14, fontWeight: "500" as const, fontFamily: "Inter_500Medium",
  },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 4,
  },

  // Section shared styles
  sectionHeader: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: 1, gap: 10,
  },
  sectionHeading: {
    fontSize: 20, fontWeight: "700" as const, fontFamily: "Inter_700Bold",
  },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 9, gap: 8,
  },
  searchInput: {
    flex: 1, fontSize: 14, fontFamily: "Inter_400Regular",
  },
  filterRow: { gap: 8, paddingBottom: 2 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: {
    fontSize: 12, fontWeight: "500" as const, fontFamily: "Inter_500Medium",
  },
  listContent: { padding: 14 },
  safetyBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  safetyText: {
    fontSize: 12, fontFamily: "Inter_500Medium",
    fontWeight: "500" as const, flex: 1, lineHeight: 17,
  },
  emptyState: {
    alignItems: "center", paddingVertical: 60, gap: 12,
  },
  emptyText: {
    fontSize: 16, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const,
  },

  // Doctors filter styles
  sectionHeadingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  filterToggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  filterToggleText: {
    fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const,
  },
  filterPanel: {
    borderTopWidth: 1, paddingTop: 10, gap: 10, marginTop: 4,
  },
  filterGroup: { gap: 6 },
  filterLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const,
    textTransform: "uppercase" as const, letterSpacing: 0.5,
  },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12, fontFamily: "Inter_500Medium", fontWeight: "500" as const,
  },
  clearFiltersBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginTop: 2,
  },
  clearFiltersText: {
    fontSize: 12, fontFamily: "Inter_500Medium", fontWeight: "500" as const,
  },
  resultsRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 0,
  },
  resultsText: {
    fontSize: 12, fontFamily: "Inter_400Regular",
  },
  onlinePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlinePillText: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const,
  },
});
