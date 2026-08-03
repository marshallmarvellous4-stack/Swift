import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * Redirects authenticated-but-unverified users to the OTP screen.
 * Exempt: auth screens (login, register, verify-email) and the splash.
 */
function VerificationGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.isVerified) return;

    // Already on an auth screen — don't redirect in a loop
    if (segments[0] === "auth") return;

    router.replace("/auth/verify-email" as never);
  }, [user, isLoading, segments]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <VerificationGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="doctor/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="article/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="auth/login"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="auth/register"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="auth/verify-email"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="search"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="hospital/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="lab/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="pharmacy/[id]"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="consultation/booking"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="consultation/summary"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="consultation/payment"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="consultation/success"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="consultation/chat"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/health-records"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/consultation-history"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/appointments"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/prescriptions"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/lab-results"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/settings"
        options={{ headerShown: false, presentation: "card" }}
      />
      <Stack.Screen
        name="profile/coming-soon"
        options={{ headerShown: false, presentation: "card" }}
      />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
