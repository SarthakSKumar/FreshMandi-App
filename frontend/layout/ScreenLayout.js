import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

import { ThemeContext } from "../contexts/ThemeProvider";

const ScreenLayout = ({ title, children }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <ImageBackground
      style={[styles.background, { backgroundColor: theme.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {children}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleTheme}>
          <Text style={styles.toggleButtonText}>☀️ 🌑</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  toggleButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    fontSize: 50,
    backgroundColor: "#777",
  },
  toggleButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default ScreenLayout;
