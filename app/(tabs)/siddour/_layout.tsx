import { Stack } from 'expo-router';

export default function SiddourLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="chapter/[id]" />
      <Stack.Screen name="prayer/[id]" />
    </Stack>
  );
}