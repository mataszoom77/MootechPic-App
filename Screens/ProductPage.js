import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchSpareParts } from "../api";
import ProductCard from "../assets/Components/ProductCard";
import MainLayout from "../Navigation/MainLayout";
import { useCart } from "../context/CartContext";
import {
  SafeAreaView,
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

const ProductPage = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToCart } = useCart();

  const navigation = useNavigation();
  const { product } = useRoute().params;

  const [quantity, setQuantity] = useState(1);

  // normalize price safely
  const rawPrice = String(product.price ?? "");
  const unitPrice = parseFloat(rawPrice.replace(/[^\d.]/g, "")) || 0;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  // feedback animation
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const onAddToCart = () => {
    addToCart({ id: product.id, type: "Product", quantity });
    Animated.sequence([
      Animated.timing(feedbackScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(feedbackScale, {
        toValue: 0,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const loadSpareParts = async () => {
      try {
        const data = await fetchSpareParts(product.id);
        setSpareParts(data);
      } catch (err) {
        if (__DEV__) {
          console.log("Failed to load spare parts", err);
        }
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadSpareParts();
  }, [product.id]);

  return (
    <MainLayout>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Image carousel */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              setActiveImage(
                Math.round(
                  e.nativeEvent.contentOffset.x /
                    e.nativeEvent.layoutMeasurement.width
                )
              );
            }}
            scrollEventThrottle={16}
            style={styles.imageSlider}
          >
            {(product.imageUrls || []).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <View style={styles.dotsWrapper}>
            {(product.imageUrls || []).map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeImage === index && styles.activeDot]}
              />
            ))}
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{product.subtitle}</Text>
            <View style={styles.priceRow}>
              <View style={styles.quantityBox}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.quantityButton}>–</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity((q) => q + 1)}>
                  <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{totalPrice} €</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.cartButton} onPress={onAddToCart}>
            <Animated.Text
              style={[
                styles.feedbackText,
                { transform: [{ scale: feedbackScale }] },
              ]}
            >
              +1
            </Animated.Text>
            <Text style={styles.cartText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={styles.sparePartsSection}>
            <Text style={styles.sectionTitle}>Spare Parts</Text>
            {loading ? (
              <Text style={{ textAlign: "center", color: "#999" }}>
                Loading spare parts...
              </Text>
            ) : spareParts.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#999" }}>
                Spare parts not found
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sparePartsRow}
              >
                {spareParts.map((part) => (
                  <View key={part.id} style={styles.sparePartCard}>
                    <ProductCard item={part} type="sparePart" />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  imageSlider: { width: "100%", height: 220, marginBottom: 8, borderRadius: 8 },
  mainImage: { width: 360, height: 220, borderRadius: 8 },
  dotsWrapper: { flexDirection: "row", alignSelf: "center", marginBottom: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "#ADC81B" },
  productTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  descriptionBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#00000026",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionText: { fontSize: 16, color: "#333", marginBottom: 12 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quantityButton: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 8,
    color: "#000",
  },
  quantityText: { fontSize: 14, marginHorizontal: 6, color: "#000" },
  priceTag: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
    shadowColor: "#00000026",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  priceText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  cartButton: {
    backgroundColor: "#ADC81B",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  cartText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  feedbackText: {
    position: "absolute",
    top: -10,
    right: 20,
    color: "#ADC81B",
    fontWeight: "700",
  },
  sparePartsSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#00000026",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  sparePartsRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    paddingHorizontal: 6,
  },
  sparePartCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#00000026",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ProductPage;
