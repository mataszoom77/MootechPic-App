import React, { useEffect, useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../assets/Components/ProductCard";
import TopBar from "../assets/Reusable/TopBar";
import {
  SafeAreaView,
  FlatList,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = 16; // horizontal padding
const GAP = 12; // gap between cards
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;

const WishList = () => {
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWishlist = wishlist.filter((item) =>
    (item.name || "Saved Item")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {filteredWishlist.length === 0 ? (
        <Text style={styles.emptyText}>Your wishlist is empty.</Text>
      ) : (
        <FlatList
          data={filteredWishlist}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                item={{
                  id: item?.itemId,
                  title: item?.name || "Unnamed Item",
                  subtitle: item?.description || "No description available",
                  price: item?.price
                    ? `${item.price.toFixed(2)} €`
                    : "Price not available",
                  imageUrls: item?.imageUrls || [],
                }}
                type={item?.itemType?.toLowerCase() || "unknown"}
              />
            </View>
          )}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.headerRow}>
              <Text style={styles.itemCountText}>
                {filteredWishlist.length} Item
                {filteredWishlist.length !== 1 ? "s" : ""}
              </Text>
              {/* Sort and filter buttons can go here if needed */}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default WishList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 16,
    paddingBottom: 50,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  itemCountText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
