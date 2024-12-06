import React, { useContext } from "react";
import { Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { ThemeContext } from "../contexts/ThemeProvider";
import ScreenLayout from "../layout/ScreenLayout";

const HomeScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const buttons = [
    {
      label: "Sell Stock",
      imageSource: require("../assets/sell-stock.jpg"),
      navigateTo: "Sell Stock",
    },
    {
      label: "Stock History",
      imageSource: require("../assets/stock-history.jpg"),
      navigateTo: "Dashboard",
    },
  ];

  return (
    <ScreenLayout title="Fruits Vegetables App">
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, { backgroundColor: theme.buttonBackground }]}
          onPress={() => navigation.navigate(button.navigateTo)}
        >
          <Image source={button.imageSource} style={styles.buttonImage} />
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            {button.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "80%",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    elevation: 5,
  },
  buttonImage: {
    width: "100%",
    height: 100,
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 10,
  },
});

export default HomeScreen;
