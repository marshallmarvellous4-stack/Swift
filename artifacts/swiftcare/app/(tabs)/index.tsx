import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatBubble } from "@/components/ChatBubble";
import { useColors } from "@/hooks/useColors";
import {
  ChatMessage,
  createMessage,
  getChatbotResponse,
} from "@/utils/chatbot";

const WELCOME: ChatMessage = createMessage(
  "Hello! I'm your SwiftCare health assistant. I'm here to provide safe, general health guidance.\n\nYou can describe your symptoms or ask about health topics like fever, malaria, nutrition, mental health, and more.\n\nHow can I help you today?\n\n⚠️ SwiftCare does not replace professional medical advice. For emergencies, visit the nearest hospital immediately.",
  "assistant"
);

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    const userMsg = createMessage(text, "user");
    setMessages((prev) => [userMsg, ...prev]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = getChatbotResponse(text);
    const assistantMsg = createMessage(response, "assistant");
    setMessages((prev) => [assistantMsg, ...prev]);
    setIsTyping(false);

    inputRef.current?.focus();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop:
              insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="medkit" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              SwiftCare AI
            </Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: "#22C55E" }]} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>
                Online · Health Assistant
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/search" as never)}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="search" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          inverted
          contentContainerStyle={styles.list}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            isTyping ? (
              <View style={styles.typingRow}>
                <View
                  style={[
                    styles.typingBubble,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.typingDotsRow}>
                    {[0, 1, 2].map((i) => (
                      <View
                        key={i}
                        style={[styles.dot, { backgroundColor: colors.mutedForeground }]}
                      />
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
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.muted,
                color: colors.foreground,
                borderColor: colors.border,
              },
            ]}
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
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: input.trim() ? colors.primary : colors.muted,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={input.trim() ? "#fff" : colors.mutedForeground}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  iconBtn: {
    padding: 8,
  },
  list: {
    paddingVertical: 16,
  },
  typingRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  typingBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  typingDotsRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    opacity: 0.6,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
