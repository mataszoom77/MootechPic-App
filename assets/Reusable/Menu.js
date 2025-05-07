import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Text, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";

// Icons
import IconHome from "../BottomBar/IconHome";
import IconRequest from "../BottomBar/IconRequest";
import IconCamera from "../BottomBar/IconCamera";
import IconHeart from "../BottomBar/IconHeart";
import IconCart from "../BottomBar/IconCart";

const BottomBarStock = ({ state }) => {
  const navigation = useNavigation();
  // <-- Destructure the actual array from your context:
  const { cartItems } = useCart();  
  // Fallback to empty array if undefined
  const count = Array.isArray(cartItems) ? cartItems.length : 0;

  const badgeScale = useRef(new Animated.Value(1)).current;

  // Pulse whenever count changes
  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.timing(badgeScale, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count]);

  const menuItems = [
    { key: "Home", icon: IconHome, label: "Home" },
    { key: "Requests", icon: IconRequest, label: "Requests" },
    { key: "Camera", icon: IconCamera, label: "Camera" },
    { key: "Wishlist", icon: IconHeart, label: "Wishlist" },
    { key: "Cart", icon: IconCart, label: "Cart" },
  ];

  const routeMap = {
    Home: "ProductsPage",
    Requests: "RequestsPage",
    Camera: "NewRequestPage",
    Wishlist: "WishList",
    Cart: "CheckoutPage",
  };

  const activeRoute = state?.routes[state.index]?.name;

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = routeMap[item.key] === activeRoute;

          return (
            <Pressable
              key={item.key}
              style={item.key === "Camera" ? styles.cameraBtn : styles.btn}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: routeMap[item.key] })
              }
            >
              {item.key === "Cart" ? (
                <View>
                  <Icon
                    width={24}
                    height={24}
                    color={isSelected ? "#ADC81B" : "#000"}
                  />
                  {count > 0 && (
                    <Animated.View
                      style={[
                        styles.badge,
                        { transform: [{ scale: badgeScale }] },
                      ]}
                    >
                      <Text style={styles.badgeText}>{count}</Text>
                    </Animated.View>
                  )}
                  <Text
                    style={[
                      styles.label,
                      isSelected && { color: "#ADC81B", fontWeight: "600" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
              ) : item.key === "Camera" ? (
                <Icon
                  width={35}
                  height={35}
                  color={isSelected ? "#ADC81B" : "#000"}
                />
              ) : (
                <>
                  <Icon
                    width={24}
                    height={24}
                    color={isSelected ? "#ADC81B" : "#000"}
                  />
                  <Text
                    style={[
                      styles.label,
                      isSelected && { color: "#ADC81B", fontWeight: "600" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: 84,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    paddingBottom: 10,
  },
  btn: { alignItems: "center" },
  cameraBtn: { alignItems: "center", marginBottom: 10 },
  label: {
    fontSize: 12,
    color: "#000",
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: "#ADC81B",
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default BottomBarStock;
