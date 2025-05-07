import React, { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";

import ProductCard from "../assets/Components/ProductCard";
import TopBar from "../assets/Reusable/TopBar";
import { fetchProducts, fetchAllSpareParts } from "../api";
import LogoLoader from "../assets/Components/LogoLoader";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16; // same as your paddingHorizontal on the container
const GAP = 16; // desired gap between cards
const NUM_COLUMNS = 2;

// compute card width:
// total horizontal space = SCREEN_WIDTH
// minus padding on both sides (2 * HORIZONTAL_PADDING)
// minus gaps between cards ((NUM_COLUMNS - 1) * GAP)
// divide remaining by NUM_COLUMNS
const CARD_WIDTH =
  (SCREEN_WIDTH - 2 * HORIZONTAL_PADDING - (NUM_COLUMNS - 1) * GAP) /
  NUM_COLUMNS;

export default function ProductsPage() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("product");
  const [sortBy, setSortBy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        viewType === "product"
          ? await fetchProducts()
          : await fetchAllSpareParts();
      setItems(data);
    } catch (err) {
      if (__DEV__) {
        console.error("Failed to fetch items:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [viewType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data =
        viewType === "product"
          ? await fetchProducts()
          : await fetchAllSpareParts();
      setItems(data);
    } catch (err) {
      if (__DEV__) {
        console.error("Refresh failed:", err);
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <LogoLoader />;

  // filter + sort
  const filtered = items.filter((it) =>
    it.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sorted = [...filtered];
  if (sortBy === "nameAsc")
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === "nameDesc")
    sorted.sort((a, b) => b.title.localeCompare(a.title));
  else if (sortBy === "priceAsc")
    sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  else if (sortBy === "priceDesc")
    sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

  const onSortPress = () => {
    Alert.alert(
      "Sort by",
      null,
      [
        { text: "Name A → Z", onPress: () => setSortBy("nameAsc") },
        { text: "Name Z → A", onPress: () => setSortBy("nameDesc") },
        { text: "Price ↑", onPress: () => setSortBy("priceAsc") },
        { text: "Price ↓", onPress: () => setSortBy("priceDesc") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const onFilterPress = () => {
    Alert.alert(
      "Show",
      null,
      [
        { text: "Products", onPress: () => setViewType("product") },
        { text: "Spare Parts", onPress: () => setViewType("sparePart") },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.itemCountText}>
              {sorted.length} Item{sorted.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity style={styles.buttonRow} onPress={onSortPress}>
              <Text style={styles.sortLabel}>Sort</Text>
              <Image
                source={{
                  uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/hdXYvvDCx2/9pe49seu_expires_30_days.png",
                }}
                style={styles.sortFilterIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonRow} onPress={onFilterPress}>
              <Text style={styles.sortLabel}>Filter</Text>
              <Image
                source={{
                  uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/hdXYvvDCx2/71i4g3f8_expires_30_days.png",
                }}
                style={styles.sortFilterIcon}
              />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard item={item} type={viewType} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    marginBottom: GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: GAP,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  itemCountText: { flex: 1, fontSize: 18, fontWeight: "bold", color: "#000" },
  buttonRow: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#00000012",
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 8,
    elevation: 8,
  },
  sortLabel: { fontSize: 12, color: "#000", marginRight: 6 },
  sortFilterIcon: { width: 16, height: 16 },
});
