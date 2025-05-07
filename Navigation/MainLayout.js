import React from "react";
import { View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import BottomBarStock from "../assets/Reusable/Menu";
import TopBarNoSearch from "../assets/Reusable/TopBarNoSearch";

const MainLayout = ({ children }) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
      <TopBarNoSearch />
        <View style={styles.content}>{children}</View>
        <BottomBarStock />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Constants.statusBarHeight },
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff"
  },
  content: { flex: 1 }, // Leave space for BottomBar
});

export default MainLayout;
