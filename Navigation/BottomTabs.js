import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProductsPage from "../Screens/ProductsPage";
import RequestsPage from "../Screens/RequestsPage";
import NewRequestPage from "../Screens/NewRequestPage";
import WishList from "../Screens/WishList";
import CheckoutPage from "../Screens/CheckoutPage";
import BottomBarStock from "../assets/Reusable/Menu";
import HomeStack from "./HomeStack";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomBarStock {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="ProductsPage" component={ProductsPage} />
      <Tab.Screen name="RequestsPage" component={RequestsPage} />
      <Tab.Screen name="NewRequestPage" component={NewRequestPage} />
      <Tab.Screen name="WishList" component={WishList} />
      <Tab.Screen name="CheckoutPage" component={CheckoutPage} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
