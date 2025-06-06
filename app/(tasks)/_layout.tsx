import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
        <Tabs.Screen
          name="Tasks"
          
          options={{
            title: 'Tasks',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="tasks" size={24} color="black" />
            ),
          }}
        />
        <Tabs.Screen
          name="Settings"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={24} color="black" />
            ),
          }}
        />
    </Tabs>
  );
}
