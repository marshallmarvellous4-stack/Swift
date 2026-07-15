import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DOCTORS } from "@/data/doctors";
import { useColors } from "@/hooks/useColors";

const CONSULTATION_TYPES = [
  { key: "chat", label: "Chat", icon: "chatbubble-ellipses-outline", desc: "Text-based consultation" },
  { key: "voice", label: "Voice Call", icon: "call-outline", desc: "Audio consultation" },
  { key: "video", label: "Video Call", icon: "videocam-outline", desc: "Face-to-face video" },
];

const TIME_SLOTS = [
  { time: "9:00 AM",  available: true },
  { time: "10:30 AM", available: true },
  { time: "12:00 PM", available: false },
  { time: "1:30 PM",  available: true },
  { time: "3:00 PM",  available: true },
  { time: "4:30 PM",  available: false },
  { time: "5:00 PM",  available: true },
];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first === 0 ? 6 : first - 1).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function ConsultationBookingScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const doctor = DOCTORS.find((d) => d.id === doctorId);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [uploads, setUploads] = useState<{ uri: string; name: string }[]>([]);

  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Doctor not found</Text>
      </View>
    );
  }

  const cells = buildCalendar(calYear, calMonth);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(null);
  }

  function isPast(day: number) {
    const d = new Date(calYear, calMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  }

  async function pickDocument() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      const name = asset.uri.split("/").pop() ?? "file";
      setUploads((prev) => [...prev, { uri: asset.uri, name }]);
    }
  }

  function handleContinue() {
    if (!selectedType) return Alert.alert("Missing", "Please select a consultation type.");
    if (!selectedDay) return Alert.alert("Missing", "Please select a date.");
    if (!selectedTime) return Alert.alert("Missing", "Please select a time slot.");
    if (reason.trim().length < 20)
      return Alert.alert("Too short", "Please describe your reason in at least 20 characters.");

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dateStr = `${MONTH_NAMES[calMonth]} ${selectedDay}, ${calYear}`;
    router.push({
      pathname: "/consultation/summary" as never,
      params: {
        doctorId,
        consultationType: selectedType,
        date: dateStr,
        time: selectedTime,
        reason: reason.trim(),
      },
    });
  }

  const selectedDate = selectedDay
    ? `${MONTH_NAMES[calMonth]} ${selectedDay}, ${calYear}`
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* Doctor Card */}
        <View style={[styles.doctorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={{ uri: doctor.image }} style={styles.doctorAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.doctorName, { color: colors.foreground }]}>{doctor.name}</Text>
            <Text style={[styles.doctorSpecialty, { color: colors.mutedForeground }]}>{doctor.specialty}</Text>
            <View style={styles.doctorMeta}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{doctor.rating}</Text>
              <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
              <Text style={[styles.metaFee, { color: colors.primary }]}>₦{doctor.fee.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Consultation Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Consultation Type</Text>
          <View style={styles.typeGrid}>
            {CONSULTATION_TYPES.map((t) => {
              const active = selectedType === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.typeCard, { backgroundColor: active ? colors.primary + "12" : colors.card, borderColor: active ? colors.primary : colors.border }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedType(t.key); }}
                >
                  <View style={[styles.typeIconWrap, { backgroundColor: active ? colors.primary : colors.muted }]}>
                    <Ionicons name={t.icon as never} size={22} color={active ? "#fff" : colors.mutedForeground} />
                  </View>
                  <Text style={[styles.typeLabel, { color: active ? colors.primary : colors.foreground }]}>{t.label}</Text>
                  <Text style={[styles.typeDesc, { color: colors.mutedForeground }]}>{t.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Date</Text>
          <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.calHeader}>
              <Pressable onPress={prevMonth} hitSlop={10}>
                <Ionicons name="chevron-back" size={20} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.calMonthLabel, { color: colors.foreground }]}>{MONTH_NAMES[calMonth]} {calYear}</Text>
              <Pressable onPress={nextMonth} hitSlop={10}>
                <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
              </Pressable>
            </View>
            <View style={styles.calDayLabels}>
              {DAY_LABELS.map((d) => (
                <Text key={d} style={[styles.calDayLabel, { color: colors.mutedForeground }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.calGrid}>
              {cells.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={styles.calCell} />;
                const past = isPast(day);
                const selected = selectedDay === day;
                return (
                  <Pressable
                    key={`d-${day}`}
                    style={[styles.calCell, selected && { backgroundColor: colors.primary, borderRadius: 20 }, past && { opacity: 0.3 }]}
                    onPress={() => { if (!past) { Haptics.selectionAsync(); setSelectedDay(day); } }}
                    disabled={past}
                  >
                    <Text style={[styles.calDayText, { color: selected ? "#fff" : colors.foreground }]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedDate && (
              <View style={[styles.selectedDateBadge, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="calendar" size={14} color={colors.primary} />
                <Text style={[styles.selectedDateText, { color: colors.primary }]}>{selectedDate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Available Time Slots</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const active = selectedTime === slot.time;
              return (
                <Pressable
                  key={slot.time}
                  style={[styles.timeChip,
                    { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
                    !slot.available && { opacity: 0.38 },
                  ]}
                  onPress={() => { if (slot.available) { Haptics.selectionAsync(); setSelectedTime(slot.time); } }}
                  disabled={!slot.available}
                >
                  <Text style={[styles.timeText, { color: active ? "#fff" : slot.available ? colors.foreground : colors.mutedForeground }]}>
                    {slot.time}
                  </Text>
                  {!slot.available && <Text style={[styles.unavailableLabel, { color: colors.mutedForeground }]}>Taken</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reason for Consultation</Text>
          <TextInput
            style={[styles.reasonInput, { backgroundColor: colors.card, borderColor: reason.trim().length > 0 && reason.trim().length < 20 ? "#EF4444" : colors.border, color: colors.foreground }]}
            placeholder="Describe your symptoms or reason for consultation..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            value={reason}
            onChangeText={setReason}
            maxLength={500}
          />
          <View style={styles.charRow}>
            {reason.trim().length > 0 && reason.trim().length < 20 && (
              <Text style={styles.errorText}>Minimum 20 characters required</Text>
            )}
            <Text style={[styles.charCount, { color: colors.mutedForeground, marginLeft: "auto" }]}>{reason.length}/500</Text>
          </View>
        </View>

        {/* Upload Documents */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upload Documents <Text style={[styles.optionalLabel, { color: colors.mutedForeground }]}>(Optional)</Text></Text>
          <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>Lab results, images, prescriptions</Text>
          <Pressable
            style={[styles.uploadBtn, { borderColor: colors.primary, backgroundColor: colors.primary + "08" }]}
            onPress={pickDocument}
          >
            <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
            <Text style={[styles.uploadBtnText, { color: colors.primary }]}>Tap to upload</Text>
          </Pressable>
          {uploads.length > 0 && (
            <View style={{ gap: 8, marginTop: 8 }}>
              {uploads.map((f, i) => (
                <View key={i} style={[styles.fileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="document-outline" size={18} color={colors.primary} />
                  <Text style={[styles.fileName, { color: colors.foreground }]} numberOfLines={1}>{f.name}</Text>
                  <Pressable onPress={() => setUploads((p) => p.filter((_, j) => j !== i))}>
                    <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  doctorCard: { flexDirection: "row", alignItems: "center", gap: 14, margin: 16, padding: 14, borderRadius: 16, borderWidth: 1 },
  doctorAvatar: { width: 64, height: 64, borderRadius: 32 },
  doctorName: { fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  doctorSpecialty: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  doctorMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metaDot: { width: 3, height: 3, borderRadius: 2 },
  metaFee: { fontSize: 13, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const, marginBottom: 12 },
  typeGrid: { flexDirection: "row", gap: 10 },
  typeCard: { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1.5, gap: 6 },
  typeIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  typeLabel: { fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  typeDesc: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  calCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  calHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calMonthLabel: { fontSize: 15, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  calDayLabels: { flexDirection: "row" },
  calDayLabel: { flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calCell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  calDayText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  selectedDateBadge: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 8 },
  selectedDateText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 50, borderWidth: 1.5, alignItems: "center" },
  timeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  unavailableLabel: { fontSize: 9, fontFamily: "Inter_400Regular", marginTop: 2 },
  reasonInput: { borderWidth: 1.5, borderRadius: 14, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 110 },
  charRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  errorText: { fontSize: 11, color: "#EF4444", fontFamily: "Inter_400Regular" },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  optionalLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  uploadHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10 },
  uploadBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 14, padding: 16 },
  uploadBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  fileCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1 },
  fileName: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: { padding: 16, paddingTop: 12, borderTopWidth: 1 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 50 },
  continueBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
});
