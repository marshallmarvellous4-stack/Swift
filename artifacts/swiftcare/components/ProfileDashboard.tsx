import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import {
  CONSULTATIONS,
  HEALTH_RECORDS,
  MEDICAL_PROFILE,
  TIMELINE_EVENTS,
} from "@/data/healthData";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_W = (SCREEN_WIDTH - 48) / 2;

// ─── Quick Action Definition ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: "health-records", label: "Health Records", icon: "document-text-outline", color: "#3B82F6", route: "/profile/health-records" },
  { id: "consultation-history", label: "Consultations", icon: "chatbubbles-outline", color: "#22C55E", route: "/profile/consultation-history" },
  { id: "appointments", label: "Appointments", icon: "calendar-outline", color: "#A855F7", route: "/profile/appointments" },
  { id: "prescriptions", label: "Prescriptions", icon: "medical-outline", color: "#F59E0B", route: "/profile/prescriptions" },
  { id: "lab-results", label: "Lab Results", icon: "flask-outline", color: "#06B6D4", route: "/profile/lab-results" },
  { id: "medical-wallet", label: "Medical Wallet", icon: "wallet-outline", color: "#6366F1", route: "/profile/coming-soon?title=Medical%20Wallet" },
  { id: "saved-doctors", label: "Saved Doctors", icon: "bookmark-outline", color: "#22C55E", route: "/profile/coming-soon?title=Saved%20Doctors" },
  { id: "fav-hospitals", label: "Fav. Hospitals", icon: "heart-outline", color: "#EF4444", route: "/profile/coming-soon?title=Favorite%20Hospitals" },
];

// ─── Guest View ───────────────────────────────────────────────────────────────
function GuestView() {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={[styles.guestWrap, { backgroundColor: colors.background }]}>
      <View style={[styles.guestIconWrap, { backgroundColor: colors.primary + "15" }]}>
        <Ionicons name="person-circle-outline" size={72} color={colors.primary} />
      </View>
      <Text style={[styles.guestTitle, { color: colors.foreground }]}>Your Health Dashboard</Text>
      <Text style={[styles.guestSub, { color: colors.mutedForeground }]}>
        Sign in to access your personal health records, consultation history, prescriptions, and more.
      </Text>
      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/auth/login" as never)}>
        <Ionicons name="log-in-outline" size={18} color="#fff" />
        <Text style={styles.primaryBtnText}>Sign In</Text>
      </Pressable>
      <Pressable style={[styles.outlineBtn, { borderColor: colors.primary }]} onPress={() => router.push("/auth/register" as never)}>
        <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Create Account</Text>
      </Pressable>
    </View>
  );
}

// ─── Profile Header ───────────────────────────────────────────────────────────
function ProfileHeader() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  if (!user) return null;

  const initial = user.fullName?.charAt(0)?.toUpperCase() ?? "?";
  const completionPct = 75;

  return (
    <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
      {/* Edit button */}
      <Pressable style={styles.editBtn} onPress={() => router.push("/profile/settings" as never)}>
        <Ionicons name="create-outline" size={18} color="#fff" />
        <Text style={styles.editBtnText}>Edit Profile</Text>
      </Pressable>

      {/* Avatar */}
      <View style={styles.heroCenter}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <View style={styles.verifiedDot}>
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.heroName}>{user.fullName}</Text>
        <Text style={styles.heroEmail}>{user.email}</Text>
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark-outline" size={13} color="#fff" />
          <Text style={styles.verifiedText}>Verified Patient</Text>
        </View>
      </View>

      {/* Info pills */}
      <View style={styles.pillsRow}>
        {[
          { icon: "water-outline", label: MEDICAL_PROFILE.bloodGroup },
          { icon: "person-outline", label: user.sex },
          { icon: "location-outline", label: user.stateOfOrigin },
        ].map((p) => (
          <View key={p.label} style={styles.pill}>
            <Ionicons name={p.icon as never} size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.pillText}>{p.label}</Text>
          </View>
        ))}
      </View>

      {/* Completion bar */}
      <View style={styles.completionWrap}>
        <View style={styles.completionHeader}>
          <Text style={styles.completionLabel}>Profile Completion</Text>
          <Text style={styles.completionPct}>{completionPct}%</Text>
        </View>
        <View style={styles.completionTrack}>
          <View style={[styles.completionFill, { width: `${completionPct}%` }]} />
        </View>
      </View>
    </View>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const colors = useColors();
  const stats = [
    { value: CONSULTATIONS.length.toString(), label: "Consultations", icon: "chatbubbles-outline", color: "#22C55E" },
    { value: HEALTH_RECORDS.length.toString(), label: "Records", icon: "document-text-outline", color: "#3B82F6" },
    { value: "2", label: "Upcoming", icon: "calendar-outline", color: "#A855F7" },
  ];
  return (
    <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {stats.map((s, idx) => (
        <React.Fragment key={s.label}>
          {idx > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: s.color + "15" }]}>
              <Ionicons name={s.icon as never} size={16} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Quick Actions Grid ───────────────────────────────────────────────────────
function QuickActionsGrid() {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Access</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(action.route as never);
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + "15" }]}>
              <Ionicons name={action.icon as never} size={22} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Medical Info Card ────────────────────────────────────────────────────────
function MedicalInfoCard() {
  const colors = useColors();
  const router = useRouter();
  const mp = MEDICAL_PROFILE;
  const rows = [
    { icon: "water-outline", color: "#EF4444", label: "Blood Group", value: mp.bloodGroup },
    { icon: "resize-outline", color: "#3B82F6", label: "Height", value: mp.height },
    { icon: "barbell-outline", color: "#F59E0B", label: "Weight", value: mp.weight },
    { icon: "analytics-outline", color: "#22C55E", label: "BMI", value: mp.bmi },
    { icon: "warning-outline", color: "#EF4444", label: "Allergies", value: mp.allergies.join(", ") },
    { icon: "medical-outline", color: "#A855F7", label: "Conditions", value: mp.conditions.join(", ") },
    { icon: "flask-outline", color: "#06B6D4", label: "Medications", value: mp.medications.join(", ") },
    { icon: "call-outline", color: "#22C55E", label: "Emergency Contact", value: `${mp.emergencyContact.name} (${mp.emergencyContact.relation}) — ${mp.emergencyContact.phone}` },
    { icon: "shield-outline", color: "#6366F1", label: "Insurance", value: mp.insurance },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Medical Information</Text>
        <Pressable
          style={[styles.editChip, { backgroundColor: colors.primary + "12" }]}
          onPress={() => router.push("/profile/settings" as never)}
        >
          <Ionicons name="create-outline" size={13} color={colors.primary} />
          <Text style={[styles.editChipText, { color: colors.primary }]}>Edit</Text>
        </Pressable>
      </View>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {rows.map((row, idx) => (
          <View
            key={row.label}
            style={[styles.infoRow, idx < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <View style={[styles.infoIcon, { backgroundColor: row.color + "12" }]}>
              <Ionicons name={row.icon as never} size={16} color={row.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Recent Health Records ────────────────────────────────────────────────────
function RecentRecords() {
  const colors = useColors();
  const router = useRouter();
  const recent = HEALTH_RECORDS.slice(0, 3);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Records</Text>
        <Pressable onPress={() => router.push("/profile/health-records" as never)}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
        </Pressable>
      </View>
      <View style={{ gap: 8 }}>
        {recent.map((r) => (
          <View key={r.id} style={[styles.recordRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.recordIcon, { backgroundColor: r.iconColor + "15" }]}>
              <Ionicons name={r.icon as never} size={18} color={r.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recordType, { color: colors.foreground }]}>{r.type}</Text>
              <Text style={[styles.recordFacility, { color: colors.mutedForeground }]}>{r.facility} • {r.date}</Text>
            </View>
            <Pressable
              style={[styles.viewBtn, { backgroundColor: colors.primary + "12" }]}
              onPress={() => router.push("/profile/health-records" as never)}
            >
              <Text style={[styles.viewBtnText, { color: colors.primary }]}>View</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Recent Consultations ─────────────────────────────────────────────────────
function RecentConsultations() {
  const colors = useColors();
  const router = useRouter();
  const recent = CONSULTATIONS.slice(0, 2);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Consultations</Text>
        <Pressable onPress={() => router.push("/profile/consultation-history" as never)}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
        </Pressable>
      </View>
      <View style={{ gap: 8 }}>
        {recent.map((c) => (
          <View key={c.id} style={[styles.consultRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: c.doctorPhoto }} style={[styles.consultAvatar, { borderColor: colors.primary + "40" }]} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.consultName, { color: colors.foreground }]}>{c.doctorName}</Text>
              <Text style={[styles.consultSpec, { color: colors.primary }]}>{c.specialty}</Text>
              <Text style={[styles.consultMeta, { color: colors.mutedForeground }]}>{c.type} • {c.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "#22C55E15" }]}>
              <Text style={[styles.statusText, { color: "#16A34A" }]}>{c.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Medical Timeline ─────────────────────────────────────────────────────────
function MedicalTimeline() {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Medical Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 0, paddingVertical: 8 }}>
        {TIMELINE_EVENTS.map((event, idx) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineNode, { backgroundColor: event.color, borderColor: event.color + "40" }]}>
                <Ionicons name={event.icon as never} size={14} color="#fff" />
              </View>
              {idx < TIMELINE_EVENTS.length - 1 && (
                <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
              )}
            </View>
            <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.timelineType, { color: event.color }]}>{event.type}</Text>
              <Text style={[styles.timelineTitle, { color: colors.foreground }]}>{event.title}</Text>
              <Text style={[styles.timelineSubtitle, { color: colors.mutedForeground }]}>{event.subtitle}</Text>
              <Text style={[styles.timelineDate, { color: colors.mutedForeground }]}>{event.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Settings Section ─────────────────────────────────────────────────────────
function SettingsLinks() {
  const colors = useColors();
  const router = useRouter();
  const rows = [
    { icon: "settings-outline", color: "#64748B", label: "Settings", route: "/profile/settings" },
    { icon: "notifications-outline", color: "#06B6D4", label: "Notifications", route: "/profile/settings" },
    { icon: "help-circle-outline", color: "#3B82F6", label: "Help & Support", route: "/profile/settings" },
    { icon: "information-circle-outline", color: "#A855F7", label: "About SwiftCare", route: "/profile/settings" },
  ];
  return (
    <View style={styles.section}>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {rows.map((row, idx) => (
          <Pressable
            key={row.label}
            style={[styles.settingsRow, idx < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => router.push(row.route as never)}
          >
            <View style={[styles.infoIcon, { backgroundColor: row.color + "12" }]}>
              <Ionicons name={row.icon as never} size={16} color={row.color} />
            </View>
            <Text style={[styles.settingsLabel, { color: colors.foreground }]}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function ProfileDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return <GuestView />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader />
      <View style={{ padding: 16, gap: 20 }}>
        <StatsBar />
        <QuickActionsGrid />
        <MedicalInfoCard />
        <RecentRecords />
        <RecentConsultations />
        <MedicalTimeline />
        <SettingsLinks />

        {/* Logout */}
        <Pressable
          style={[styles.logoutBtn, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await logout();
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          ⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Guest
  guestWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  guestIconWrap: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  guestTitle: { fontSize: 22, fontWeight: "700" as const, fontFamily: "Inter_700Bold", textAlign: "center" },
  guestSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  primaryBtn: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 50 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  outlineBtn: { width: "100%", paddingVertical: 14, borderRadius: 50, alignItems: "center", borderWidth: 2 },
  outlineBtnText: { fontSize: 16, fontWeight: "600" as const, fontFamily: "Inter_600SemiBold" },

  // Hero
  heroCard: { paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-end", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  editBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroCenter: { alignItems: "center", gap: 4, marginTop: 4 },
  avatarWrap: { position: "relative", marginBottom: 8 },
  avatarCircle: { width: 86, height: 86, borderRadius: 43, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)" },
  avatarInitial: { fontSize: 38, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  verifiedDot: { position: "absolute", bottom: 2, right: 2, backgroundColor: "#fff", borderRadius: 12 },
  heroName: { fontSize: 20, fontWeight: "700" as const, color: "#fff", fontFamily: "Inter_700Bold" },
  heroEmail: { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  verifiedText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  pillsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillText: { color: "#fff", fontSize: 11, fontFamily: "Inter_500Medium" },
  completionWrap: { marginTop: 16 },
  completionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  completionLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_500Medium" },
  completionPct: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  completionTrack: { height: 5, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, overflow: "hidden" },
  completionFill: { height: "100%", backgroundColor: "#fff", borderRadius: 10 },

  // Stats bar
  statsBar: { flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },

  // Sections
  section: { gap: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  viewAll: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  editChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  editChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },

  // Quick actions
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: { width: CARD_W, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: "flex-start", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },

  // Medical info
  infoCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", padding: 12, gap: 10 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  infoLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium", fontWeight: "500" as const, lineHeight: 18 },

  // Health records row
  recordRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  recordIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  recordType: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  recordFacility: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  viewBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },

  // Consultation row
  consultRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  consultAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2 },
  consultName: { fontSize: 13, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  consultSpec: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  consultMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },

  // Timeline
  timelineItem: { flexDirection: "column", alignItems: "center", width: 140 },
  timelineTrack: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 4, marginBottom: 8 },
  timelineNode: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 3 },
  timelineLine: { flex: 1, height: 2 },
  timelineCard: { width: 124, padding: 10, borderRadius: 12, borderWidth: 1, gap: 2 },
  timelineType: { fontSize: 9, fontFamily: "Inter_700Bold", fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  timelineTitle: { fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  timelineSubtitle: { fontSize: 10, fontFamily: "Inter_400Regular", lineHeight: 14 },
  timelineDate: { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: 4 },

  // Settings links
  settingsRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  settingsLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", fontWeight: "500" as const },

  // Logout
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { color: "#EF4444", fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },
});
