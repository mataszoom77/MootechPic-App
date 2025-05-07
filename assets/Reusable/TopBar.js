import * as React from "react";
import { StyleSheet, View, Text, Pressable, TextInput } from "react-native";
import Constants from "expo-constants";
import Component52 from "../TopBar/IconSearch";
import Component521 from "../TopBar/IconMic";
import Logo from "../TopBar/IconLogo";
import User from "../TopBar/IconUser";
import { useNavigation } from "@react-navigation/native";

const TopBar = ({ searchQuery, setSearchQuery }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topRow}>
        <View style={{ flex: 1, width: 38, height: 38 }} />
        <View style={styles.logoCenter}>
          <Logo width={100} height={48} />
        </View>
        <Pressable onPress={() => navigation.navigate("ProfilePage")}>
          <User width={28} height={28} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchField}>
          <Component52 width={20} height={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any Product..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#bbb"
          />
          <Component521 width={20} height={20} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBarWrapper: {
    //paddingTop: Constants.statusBarHeight,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    //zIndex: -1, // so it doesn't overlap the user icon tap area
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: "#000",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    //paddingTop: 15,
    paddingRight: 10,
    paddingLeft: 10,
  },
  searchBar: {
    alignItems: "center",
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
    maxWidth: 374,
    shadowColor: "rgba(0, 0, 0, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 1,
    elevation: 6,
  },
  searchText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#bbb",
  },
});

export default TopBar;
