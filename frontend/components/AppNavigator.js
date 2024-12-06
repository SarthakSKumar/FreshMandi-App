import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import HomeScreen from "../screens/HomeScreen";
import SellStockScreen from "../screens/SellStockScreen";
import StockHistoryScreen from "../screens/StockHistoryScreen";
import { ThemeContext } from "../contexts/ThemeProvider";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Fruits Vegetables App", headerShown: false }}
        />
        <Stack.Screen
          name="Sell Stock"
          component={SellStockScreen}
          options={{ title: "Fruits Vegetables App" }}
        />
        <Stack.Screen
          name="Stock History"
          component={StockHistoryScreen}
          options={{ title: "Fruits Vegetables App" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
