import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détail de la Prière {id}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Contenu de la prière {id} à venir.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.background },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginLeft: 16 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 16, color: Colors.text.secondary },
});