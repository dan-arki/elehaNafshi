import { Stack } from 'expo-router';

export default function IndexLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="kevarim" />
      <Stack.Screen name="kever/[id]" />
      <Stack.Screen name="favorites" />
    </Stack>
  );
}