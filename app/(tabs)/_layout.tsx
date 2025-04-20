import { Tabs } from "expo-router";
import { useColorMode } from "@/hooks/useColorMode";
import { Ionicons } from "@expo/vector-icons";

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
          title: "Tickets",
          tabBarIcon: ({ color }) => (
            <Ionicons name="ticket-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fun-facts"
        options={{
          title: "Fun Facts",
          tabBarIcon: ({ color }) => (
            <Ionicons name="help-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
