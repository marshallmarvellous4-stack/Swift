import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APPOINTMENTS, Appointment } from "@/data/healthData";
import { useColors } from "@/hooks/useColors";

type Tab = "Upcoming" | "Completed" | "Cancelled";

const STATUS_COLORS = { Upcoming: "#3B82F6", Completed: "#22C55E", Cancelled: "#EF4444" };

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const colors = useColors();
  const router = useRouter();
  const statusColor = STATUS_COLORS[appointment.status];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardBody}>
        <Image source={{ uri: appointment.doctorPhoto }} style={[styles.avatar, { borderColor: colors.primary + "40" }]} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.doctorName, { color: colors.foreground }]}>{appointment.doctorName}</Text>
          <Text style={[styles.specialty, { color: colors.primary }]}>{appointment.specialty}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="business-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>{appointment.hospital}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{appointment.date}</Text>
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>{appointment.time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{appointment.status}</Text>
        </View>
      </View>
      {appointment.status === "Upcoming" && (
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => Alert.alert("Reschedule", "Reschedule feature will be available soon.")}
          >
            <Ionicons name="create-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.footerBtnText, { color: colors.mutedForeground }]}>Reschedule</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}
            onPress={() => Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
              { text: "No" },
              { text: "Yes, Cancel", style: "destructive" },
            ])}
          >
            <Ionicons name="close-outline" size={13} color="#EF4444" />
            <Text style={[styles.footerBtnText, { color: "#EF4444" }]}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.footerBtn, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert("Appointment Details", `${appointment.doctorName}\n${appointment.hospital}\n${appointment.date} at ${appointment.time}`)}
          >
            <Ionicons name="eye-outline" size={13} color="#fff" />
            <Text style={[styles.footerBtnText, { color: "#fff" }]}>Details</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<Tab>("Upcoming");
  const tabs: Tab[] = ["Upcoming", "Completed", "Cancelled"];
  const filtered = APPOINTMENTS.filter((a) => a.status === activeTab);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Appointments</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {tabs.map((tab) => {
          const active = activeTab === tab;
          const count = APPOINTMENTS.filter((a) => a.status === tab).length;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, active && [styles.tabActive, { borderBottomColor: colors.primary }]]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: active ? colors.primary : colors.mutedForeground }]}>{tab}</Text>
              {count > 0 && (
                <View style={[styles.tabCount, { backgroundColor: active ? colors.primary : colors.muted }]}>
                  <Text style={[styles.tabCountText, { color: active ? "#fff" : colors.mutedForeground }]}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
            <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No {activeTab.toLowerCase()} appointments</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const, flex: 1, marginLeft: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: {},
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  tabCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  tabCountText: { fontSize: 10, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardBody: { flexDirection: "row", padding: 14, gap: 12, alignItems: "center" },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2 },
  doctorName: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  specialty: { fontSize: 12, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  cardFooter: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1 },
  footerBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  footerBtnText: { fontSize: 11, fontFamily: "Inter_600SemiBold", fontWeight: "600" as const },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
