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
  getChatbotResponse,
} from "@/utils/chatbot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const WELCOME: ChatMessage = createMessage(
  "Hello! I'm your SwiftCare health assistant. I'm here to provide safe, general health guidance.\n\nDescribe your symptoms or ask about fever, malaria, nutrition, mental health, and more.\n\nHow can I help you today?\n\n⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.",
  "assistant"
);

// ─── Section: Chat ────────────────────────────────────────────────────────────
function ChatSection() {
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
    setMessages((prev) => [createMessage(getChatbotResponse(text), "assistant"), ...prev]);
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
        renderItem={({ item }) => <ChatBubble message={item} />}
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
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={[styles.guestWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.guestIcon, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name="person-circle-outline" size={72} color={colors.primary} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.foreground }]}>Your Health Profile</Text>
        <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
          Sign in to access your profile, chat history, and personalized health insights.
        </Text>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/auth/login" as never)}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
        </Pressable>
        <Pressable
          style={[styles.outlineBtn, { borderColor: colors.primary }]}
          onPress={() => router.push("/auth/register" as never)}
        >
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  const initial = user.fullName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileHero, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.profileName}>{user.fullName}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>{user.role?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={{ padding: 16, gap: 10 }}>
        {[
          { icon: "mail-outline", label: "Email", value: user.email },
          { icon: "call-outline", label: "Phone", value: user.mobileNumber },
          { icon: "people-outline", label: "Gender", value: user.sex },
          { icon: "location-outline", label: "State", value: user.stateOfOrigin },
        ].map((item) => (
          <View key={item.label} style={[styles.profileRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.profileRowIcon, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name={item.icon as never} size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.profileRowLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.profileRowValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          </View>
        ))}
        <Pressable
          style={[styles.logoutBtn, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={{ color: "#EF4444", fontWeight: "600", fontFamily: "Inter_600SemiBold" }}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ─── Section: Doctors ─────────────────────────────────────────────────────────
function DoctorsSection() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const filtered = DOCTORS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.sectionHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Find Doctors</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search by name or specialty..."
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
        renderItem={({ item }) => <DoctorCard doctor={item} />}
        ListEmptyComponent={<EmptyState icon="person-outline" message="No doctors found" />}
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
const SECTION_COMPONENTS = [
  ChatSection,
  ProfileSection,
  DoctorsSection,
  HospitalsSection,
  LabsSection,
  PharmacySection,
  EducationSection,
];

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
        {SECTION_COMPONENTS.map((SectionComponent, index) => (
          <View
            key={NAV_SECTIONS[index].key}
            style={{ width: SCREEN_WIDTH, flex: 1 }}
          >
            <SectionComponent />
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
});
