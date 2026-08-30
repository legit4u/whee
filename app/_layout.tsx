import { Stack } from "expo-router";
import { QueryProvider } from "@/src/services/provider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryProvider>
  );
}
