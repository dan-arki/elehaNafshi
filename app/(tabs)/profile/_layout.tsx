import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account-settings" />
      <Stack.Screen name="my-prayers" />
      <Stack.Screen name="create-prayer" />
      <Stack.Screen name="custom-prayer/[id]" />
    </Stack>
  );
}