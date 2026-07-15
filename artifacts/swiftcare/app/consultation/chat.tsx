import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DOCTORS } from "@/data/doctors";
import { useColors } from "@/hooks/useColors";

type Msg = {
  id: string;
  text: string;
  sender: "patient" | "doctor";
  time: string;
  image?: string;
  read: boolean;
};

const DOCTOR_REPLIES = [
  "Thank you for reaching out. I've reviewed your concern. Could you tell me when the symptoms started?",
  "Based on what you've described, I recommend monitoring your symptoms for the next 24 hours. Are you experiencing any fever?",
  "I understand. Let's discuss this further. Have you taken any medication for this?",
  "That's helpful information. I'd like to run a few preliminary tests. Can you visit our lab at your earliest convenience?",
  "Please don't worry. This is manageable. I'll prescribe something appropriate for you.",
  "I've noted everything. Please rest well, stay hydrated, and take the prescribed medication as directed.",
  "Feel free to send me an update tomorrow. If symptoms worsen, please visit the nearest hospital immediately.",
  "Your health is our priority. I'll follow up with a detailed prescription shortly.",
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
let msgCounter = 0;
function mkMsg(text: string, sender: "patient" | "doctor", image?: string): Msg {
  return { id: String(++msgCounter), text, sender, time: getTime(), image, read: sender === "patient" };
}

export default function ConsultationChatScreen() {
  const { doctorId, consultationId } = useLocalSearchParams<{ doctorId: string; consultationId: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);

  const doctor = DOCTORS.find((d) => d.id === doctorId);

  const [messages, setMessages] = useState<Msg[]>([
    mkMsg(`Hello! I'm ${doctor?.name ?? "your doctor"}. I've been briefed on your consultation request. How are you feeling today?`, "doctor"),
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);

  async function sendMessage(text: string, image?: string) {
    if (!text.trim() && !image) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const msg = mkMsg(text, "patient", image);
    setMessages((prev) => [msg, ...prev]);
    setInput("");

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    setIsTyping(false);
    const reply = DOCTOR_REPLIES[replyIndex % DOCTOR_REPLIES.length];
    setReplyIndex((i) => i + 1);
    setMessages((prev) => [mkMsg(reply, "doctor"), ...prev]);
  }

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      sendMessage("📎 Image attached", res.assets[0].uri);
    }
  }

  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.foreground }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8 }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Image source={{ uri: doctor.image }} style={styles.headerAvatar} />
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>{doctor.name}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>Online</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={[styles.callBtn, { backgroundColor: colors.muted }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
          </Pressable>
          <Pressable style={[styles.callBtn, { backgroundColor: colors.muted }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <Ionicons name="videocam-outline" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Consultation ID badge */}
      <View style={[styles.consultBadge, { backgroundColor: colors.primary + "12" }]}>
        <Ionicons name="shield-checkmark-outline" size={13} color={colors.primary} />
        <Text style={[styles.consultBadgeText, { color: colors.primary }]}>
          Secure consultation · #{consultationId}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          renderItem={({ item: msg }) => {
            const isMe = msg.sender === "patient";
            return (
              <View style={[styles.msgRow, isMe && styles.msgRowRight]}>
                {!isMe && (
                  <Image source={{ uri: doctor.image }} style={styles.msgAvatar} />
                )}
                <View style={{ maxWidth: "75%", gap: 4 }}>
                  {msg.image && (
                    <Image source={{ uri: msg.image }} style={[styles.msgImage, { borderRadius: 12 }]} resizeMode="cover" />
                  )}
                  {msg.text && (
                    <View style={[styles.bubble, isMe ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 } : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 }]}>
                      <Text style={[styles.bubbleText, { color: isMe ? "#fff" : colors.foreground }]}>{msg.text}</Text>
                    </View>
                  )}
                  <View style={[styles.msgMeta, isMe && { justifyContent: "flex-end" }]}>
                    <Text style={[styles.msgTime, { color: colors.mutedForeground }]}>{msg.time}</Text>
                    {isMe && (
                      <Ionicons name="checkmark-done" size={14} color={colors.primary} />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListHeaderComponent={
            isTyping ? (
              <View style={styles.typingRow}>
                <Image source={{ uri: doctor.image }} style={styles.msgAvatar} />
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

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 4 }]}>
          <Pressable onPress={pickImage} style={({ pressed }) => [styles.attachBtn, { opacity: pressed ? 0.6 : 1 }]}>
            <Ionicons name="attach" size={22} color={colors.mutedForeground} />
          </Pressable>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
            style={({ pressed }) => [styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted, opacity: pressed ? 0.8 : 1 }]}
          >
            <Ionicons name="send" size={16} color={input.trim() ? "#fff" : colors.mutedForeground} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerName: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E" },
  onlineText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", gap: 8 },
  callBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  consultBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 6 },
  consultBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 14 },
  msgRowRight: { flexDirection: "row-reverse" },
  msgAvatar: { width: 30, height: 30, borderRadius: 15, marginBottom: 2 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  msgImage: { width: 200, height: 150 },
  msgMeta: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 4 },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular" },
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 14 },
  typingBubble: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1 },
  dotsRow: { flexDirection: "row", gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingTop: 8, gap: 8, borderTopWidth: 1 },
  attachBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  textInput: { flex: 1, borderWidth: 1, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
