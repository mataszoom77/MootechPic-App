import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import BottomTabs from "./BottomTabs";
import LoginPage from "../Screens/LogIn";
import RegisterPage from "../Screens/SignUp";
import ProfilePage from "../Screens/ProfilePage";
import ProductPage from "../Screens/ProductPage";
import SparePartPage from "../Screens/SparePartPage";
import OrderConfirmation from "../Screens/OrderConfirmation";
import RequestPage from "../Screens/RequestPage";
import OrdersPage from "../Screens/OrdersPage";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="ProfilePage" component={ProfilePage} />
            <Stack.Screen name="ProductPage" component={ProductPage} />
            <Stack.Screen name="SparePartPage" component={SparePartPage} />
            <Stack.Screen name="OrdersPage" component={OrdersPage} />
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
                headerBackVisible: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
