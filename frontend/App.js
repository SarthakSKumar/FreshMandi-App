import React, { useEffect } from "react";
import AppNavigator from "./components/AppNavigator";
import ThemeProvider from "./contexts/ThemeProvider";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  useEffect(() => {
    const loadUserID = async () => {
      try {
        const savedUserID = await AsyncStorage.getItem("userid");
        if (!savedUserID) {
          const newUserID = Math.random().toString(36).substring(15);
          await AsyncStorage.setItem("userid", newUserID);
        }
      } catch (error) {
        console.error("Failed to load theme", error);
      }
    };
    loadUserID();
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
