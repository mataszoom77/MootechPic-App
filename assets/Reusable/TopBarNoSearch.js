import * as React from "react";
import { StyleSheet, View, Pressable, } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import Group from "../TopBar/IconLogo";
import Vector3 from "../TopBar/IconBack";
import User from "../TopBar/IconUser";

const TopBarNoSearch = () => {  
  const navigation = useNavigation();

    return (
      <View style={styles.topBarWrapper}>
        <View style={styles.topRow}>
          <Pressable onPress={() => navigation.goBack()}>
            <Vector3 width={38} height={38} />
          </Pressable>
  
          <Group width={100} height={48} />
  
          <Pressable onPress={() => navigation.navigate("ProfilePage")}>
            <User width={28} height={28} />
          </Pressable>
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
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      //marginBottom: 12,
      //paddingTop: 15,
      paddingRight: 10,
      paddingLeft: 10,
    },
  });
  

export default TopBarNoSearch;
