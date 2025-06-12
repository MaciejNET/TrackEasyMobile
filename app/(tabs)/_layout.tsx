import { Tabs } from "expo-router";
import { useColorMode } from "@/hooks/useColorMode";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";

export default function TabsLayout() {
  const { colorMode } = useColorMode();
  const iconColor = colorMode === "dark" ? "white" : "black";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: iconColor,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: colorMode === "dark" ? "#000" : "#fff",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <Text>Tickets</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }}>Tickets</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="ticket-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fun-facts"
        options={{
          headerTitle: () => <Text>Fun Facts</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }}>Fun Facts</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="help-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerTitle: () => <Text>Search</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }}>Search</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          headerTitle: () => <Text>Account</Text>,
          tabBarLabel: ({ color }) => (
            <Text style={{ color }}>Account</Text>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
