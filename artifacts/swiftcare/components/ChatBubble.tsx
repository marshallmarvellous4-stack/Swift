import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChatMessage } from "@/utils/chatbot";
import { useColors } from "@/hooks/useColors";

interface ChatBubbleProps {
  message: ChatMessage;
  onConsultDoctor?: () => void;
  onFindEmergency?: () => void;
}

export function ChatBubble({ message, onConsultDoctor, onFindEmergency }: ChatBubbleProps) {
  const colors = useColors();
  const isUser = message.sender === "user";

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>SC</Text>
        </View>
      )}

      <View style={[styles.bubbleWrapper, isUser && { alignItems: "flex-end" }]}>
        {/* Main text bubble */}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
          ]}
        >
          <Text style={[styles.text, { color: isUser ? "#FFFFFF" : colors.foreground }]}>
            {message.text}
          </Text>
        </View>

        {/* Doctor Consultation CTA Card */}
        {message.intent === "doctor_consultation" && !isUser && (
          <View style={[styles.ctaCard, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}>
            <View style={[styles.ctaIconWrap, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="medical" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.ctaTitle, { color: colors.foreground }]}>
                Connect with a Doctor
              </Text>
              <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>
                I can connect you with one of our verified healthcare professionals.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={onConsultDoctor}
            >
              <Ionicons name="person-add-outline" size={14} color="#fff" />
              <Text style={styles.ctaBtnText}>Consult a Doctor</Text>
            </Pressable>
          </View>
        )}

        {/* Urgent Care Card */}
        {message.intent === "urgent" && !isUser && (
          <View style={[styles.urgentCard, { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" }]}>
            <View style={styles.urgentHeader}>
              <Ionicons name="warning" size={18} color="#EF4444" />
              <Text style={styles.urgentTitle}>Urgent Medical Attention Required</Text>
            </View>
            <Text style={styles.urgentBody}>
              Your symptoms may require immediate medical care. Please do not delay.
            </Text>
            <View style={styles.urgentActions}>
              <Pressable
                style={({ pressed }) => [styles.urgentBtn, styles.urgentBtnPrimary, { opacity: pressed ? 0.85 : 1 }]}
                onPress={onConsultDoctor}
              >
                <Ionicons name="videocam-outline" size={14} color="#fff" />
                <Text style={styles.urgentBtnPrimaryText}>Consult Now</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.urgentBtn, styles.urgentBtnOutline, { opacity: pressed ? 0.85 : 1 }]}
                onPress={onFindEmergency}
              >
                <Ionicons name="location-outline" size={14} color="#EF4444" />
                <Text style={styles.urgentBtnOutlineText}>Find Emergency</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={[styles.time, { color: colors.mutedForeground }, isUser && styles.timeRight]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
    paddingHorizontal: 16,
  },
  userContainer: { justifyContent: "flex-end" },
  assistantContainer: { justifyContent: "flex-start", gap: 8 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" as const, fontFamily: "Inter_700Bold" },
  bubbleWrapper: { maxWidth: "80%", gap: 6 },
  bubble: {
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  userBubble: { borderBottomRightRadius: 4 },
  assistantBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
  text: { fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular" },
  time: { fontSize: 11, fontFamily: "Inter_400Regular" },
  timeRight: { textAlign: "right" },

  /* Doctor Consultation CTA */
  ctaCard: {
    borderRadius: 16, borderWidth: 1.5, padding: 14,
    gap: 10, marginTop: 2,
  },
  ctaIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ctaTitle: { fontSize: 14, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  ctaDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 50,
  },
  ctaBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold", fontWeight: "700" as const },

  /* Urgent Card */
  urgentCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 8, marginTop: 2 },
  urgentHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  urgentTitle: { fontSize: 13, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: "#DC2626" },
  urgentBody: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#7F1D1D", lineHeight: 18 },
  urgentActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  urgentBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 9, borderRadius: 50,
  },
  urgentBtnPrimary: { backgroundColor: "#EF4444" },
  urgentBtnPrimaryText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const },
  urgentBtnOutline: { borderWidth: 1.5, borderColor: "#EF4444" },
  urgentBtnOutlineText: { fontSize: 12, fontFamily: "Inter_700Bold", fontWeight: "700" as const, color: "#EF4444" },
});
