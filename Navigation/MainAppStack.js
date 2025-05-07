import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import ProfilePage from "../Screens/ProfilePage";
import ProductPage from "../Screens/ProductPage";
import OrderConfirmation from "../Screens/OrderConfirmation";
import RequestPage from "../Screens/RequestPage";

const Stack = createNativeStackNavigator();

const MainAppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="ProductPage" component={ProductPage} />
      <Stack.Screen
        name="ProfilePage"
        component={ProfilePage}
        options={{
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmation}
        options={{
          title: "Order Complete",
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="RequestPage"
        component={RequestPage}
        options={{
          title: "Request Details",
          headerBackVisible: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainAppStack;
