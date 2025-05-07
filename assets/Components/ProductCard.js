import React, { useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import HeartIcon from "../BottomBar/IconHeart";
import { useWishlist } from "../../context/WishlistContext";

const ProductCard = ({ item, type = "product" }) => {

  // top of ProductCard.js
  const fallback = require("../LogInAssets/adaptive-icon.png");

  function getImageSource(item) {
    // 1) Prefer array of URLs
    if (Array.isArray(item.imageUrls) && item.imageUrls.length) {
      return { uri: item.imageUrls[0] };
    }
    // 2) Fallback to single URL field if it exists
    if (typeof item.imageUrl === "string" && item.imageUrl) {
      return { uri: item.imageUrl };
    }
    // 3) Another common field name
    if (typeof item.image === "string" && item.image) {
      return { uri: item.image };
    }
    // 4) Last resort, your local placeholder
    return fallback;
  }

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();
  const { wishlist, toggleWishlist } = useWishlist();

  const normalizedType =
    type.toLowerCase() === "sparepart" ? "SparePart" : "Product";

  const isWishlisted = wishlist.some(
    (w) => w.itemId === item.id && w.itemType === normalizedType
  );

  const handleNavigate = () => {
    if (normalizedType === "SparePart") {
      navigation.navigate("SparePartPage", { sparePart: item });
    } else {
      navigation.navigate("ProductPage", { product: item });
    }
  };

  const handleWishlistToggle = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    toggleWishlist({ id: item.id, type: normalizedType });
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource(item)}
          style={styles.image}
          resizeMode="cover"
        />
        <Pressable style={styles.wishlistIcon} onPress={handleWishlistToggle}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <HeartIcon
              width={23}
              height={23}
              color={isWishlisted ? "#ADC81B" : "#000"}
            />
          </Animated.View>
        </Pressable>
      </View>

      <Pressable
        android_ripple={{ color: "#ccc" }}
        style={({ pressed }) => [
          styles.content,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleNavigate}
      >
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
        <Text style={styles.price}>{item.price}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  image: {
    height: 160,
    width: "100%",
  },
  wishlistIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
    zIndex: 5,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 100,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  buttonPressed: { opacity: 0.7 },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ADC81B",
    marginTop: 10,
  },
});

export default ProductCard;
