import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { VerificationBanner } from "@/components/VerificationBanner";

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <VerificationBanner />
      <View style={styles.flex}>
        <Tabs
          screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="doctors" />
          <Tabs.Screen name="education" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
});
