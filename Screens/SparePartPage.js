import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchAssociatedProducts } from "../api";
import ProductCard from "../assets/Components/ProductCard";
import MainLayout from "../Navigation/MainLayout";
import { useCart } from "../context/CartContext";
import {
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = 20; // same as your content padding
const GAP = 12; // gap between cards
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) * 0.5;
// each card 60% of remaining width (tweak as you like)
const SparePartPage = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const navigation = useNavigation();
  const route = useRoute();
  const { sparePart } = route.params;

  const [quantity, setQuantity] = useState(1);

  // normalize price safely
  const rawPrice = String(sparePart.price ?? "");
  const unitPrice = parseFloat(rawPrice.replace(/[^\d.]/g, "")) || 0;
  const totalPrice = (unitPrice * quantity).toFixed(2);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchAssociatedProducts(sparePart.id);
        setProducts(data);
      } catch (err) {
        if (__DEV__) {
          console.error("Failed to load associated products:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [sparePart.id]);

  return (
    <MainLayout>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width
              );
              setActiveImage(slide);
            }}
            scrollEventThrottle={16}
            style={styles.imageSlider}
          >
            {(sparePart.imageUrls || []).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
          <View style={styles.dotsWrapper}>
            {(sparePart.imageUrls || []).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeImage === index ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>

          <Text style={styles.title}>{sparePart.title}</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{sparePart.subtitle}</Text>
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

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => {
              addToCart({
                id: sparePart.id,
                type: "SparePart",
                quantity,
              });
            }}
          >
            <Text style={styles.cartText}>Add to Cart</Text>
          </TouchableOpacity>

          <View style={styles.relatedSection}>
            <Text style={styles.sectionHeader}>Related Products</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading products...</Text>
            ) : products.length === 0 ? (
              <Text style={styles.loadingText}>No related products found</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsRow}
              >
                {products.map((prod) => (
                  <View key={prod.id} style={styles.productWrapper}>
                    <ProductCard item={prod} type="product" />
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

export default SparePartPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingBottom: 120 },
  imageSlider: {
    width: "100%",
    height: 220,
    marginBottom: 8,
    borderRadius: 8,
  },
  mainImage: {
    width: 360,
    height: 220,
    borderRadius: 8,
  },
  dotsWrapper: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ADC81B",
  },

  title: {
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
  },
  cartText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  relatedSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#00000026",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  loadingText: { textAlign: "center", color: "#999" },
  productsRow: {
    paddingLeft: 4, // small left inset
    paddingVertical: 4,
  },
  productWrapper: {
    width: CARD_WIDTH,
    marginRight: GAP,
  },
});
