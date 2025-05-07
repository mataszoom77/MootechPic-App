import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductsPage from "../Screens/ProductsPage";
import ProfilePage from "../Screens/ProfilePage";

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "slide_from_right", // ✅ Slide in from right
        gestureEnabled: true,          // ✅ Swipe to go back
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProductsPage" component={ProductsPage} />
      <Stack.Screen name="ProfilePage" component={ProfilePage} />
    </Stack.Navigator>
  );
};

export default HomeStack;
