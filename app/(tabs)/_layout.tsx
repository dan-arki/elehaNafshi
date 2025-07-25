import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { BookOpen, User } from 'lucide-react-native';
import { Svg, Path } from 'react-native-svg';
import { triggerMediumHaptic } from '../../utils/haptics';

// Classic Home Icon Component
export const HomeIcon = ({ size = 24, color = '#000' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 21V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V21C14 20.5523 14.4477 21 15 21M9 21H15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 20,
          shadowOpacity: 0.1,
          height: 80,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color, focused }) => (
            <HomeIcon 
              size={size} 
              color={color}
            />
          ),
          listeners: {
            tabPress: () => {
              triggerMediumHaptic();
            },
          },
        }}
      />
      <Tabs.Screen
        name="siddour"
        options={{
          title: 'Siddour',
          tabBarIcon: ({ size, color, focused }) => (
            <BookOpen 
              size={size} 
              color={color}
              fill={focused ? color : 'transparent'}
            />
          ),
          listeners: {
            tabPress: () => {
              triggerMediumHaptic();
            },
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color, focused }) => (
            <User 
              size={size} 
              color={color}
              fill={focused ? color : 'transparent'}
            />
          ),
          listeners: {
            tabPress: () => {
              triggerMediumHaptic();
            },
          },
        }}
      />
    </Tabs>
  );
}