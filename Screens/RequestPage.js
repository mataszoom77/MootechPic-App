import React, { useRef, useContext, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import TopBar from "../assets/Reusable/TopBarNoSearch";
import BottomBar from "../assets/Reusable/Menu";
import api from "../api";
import ProductCard from "../assets/Components/ProductCard";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const RequestPage = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const { userToken } = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const id = route?.params?.id;

  const modalScrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Load request with enriched attachments
  useEffect(() => {
    if (!id || !userToken) return;
    const loadRequest = async () => {
      try {
        const res = await api.get(`/Requests/${id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        const data = res.data;
        // Enrich attachments with full item data
        const enrichedResponses = await Promise.all(
          (data.responses || []).map(async (resp) => {
            const enrichedAttachments = await Promise.all(
              (resp.attachments || []).map(async (att) => {
                // Fetch full item details
                const endpoint =
                  att.itemType === "Product" ? "/Products/" : "/SpareParts/";
                const detailRes = await api.get(`${endpoint}${att.itemId}`, {
                  headers: { Authorization: `Bearer ${userToken}` },
                });
                const itemData = detailRes.data;
                // Map backend fields to ProductCard props
                const item = {
                  ...itemData,
                  title: itemData.name,
                  subtitle: itemData.description || "",
                  price: itemData.price,
                  imageUrls: itemData.imageUrls,
                };
                return {
                  id: att.itemId,
                  item,
                  type: att.itemType.toLowerCase(),
                };
              })
            );
            return { ...resp, enrichedAttachments };
          })
        );
        setRequest({ ...data, responses: enrichedResponses });
      } catch (err) {
        if (__DEV__) {
          console.error("Failed to load request:", err);
        }
        setError("Failed to load request.");
      } finally {
        setLoading(false);
      }
    };
    loadRequest();
  }, [id, userToken]);

  // Update carousel dots
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / SCREEN_WIDTH);
      setCurrentImageIndex(index);
    });
    return () => scrollX.removeListener(listener);
  }, [scrollX]);

  // Scroll modal to correct image
  useEffect(() => {
    if (modalVisible && modalScrollRef.current) {
      modalScrollRef.current.scrollTo({
        x: modalIndex * SCREEN_WIDTH,
        y: 0,
        animated: false,
      });
    }
  }, [modalVisible, modalIndex]);

  const handleDelete = () => {
    Alert.alert("Delete Request", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/Requests/${id}`, {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            navigation.navigate("MainTabs", { screen: "RequestsPage" });
          } catch (err) {
            if (__DEV__) {
              console.error("Failed to delete request:", err);
            }
            Alert.alert("Error", "Could not delete the request.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>{error || "No request found."}</Text>
      </SafeAreaView>
    );
  }

  const images = request.imageUrls || [];
  const responses = request.responses || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TopBar />

        {/* Image Carousel */}
        {images.length > 0 && (
          <View style={styles.carouselContainer}>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {images.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => {
                    setModalIndex(idx);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri }} style={styles.mainImage} />
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
            {images.length > 1 && (
              <View style={styles.dotsContainer}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === currentImageIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Request Details */}
        <View style={styles.block}>
          <Text style={styles.label}>Product</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{request.name}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Problem Description</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{request.description}</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusWrapper}>
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        </View>

        {/* All Responses and Suggested Items */}
        {responses.map((res, i) => (
          <View style={styles.block} key={res.id}>
            <Text style={styles.sectionLabel}>Response {i + 1}</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{res.description}</Text>
            </View>
            {res.enrichedAttachments?.map((att) => (
              <ProductCard key={att.id} item={att.item} type={att.type} />
            ))}
          </View>
        ))}

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Request</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.ScrollView
            ref={modalScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {images.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={styles.fullscreenImage}
              />
            ))}
          </Animated.ScrollView>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <BottomBar />
    </SafeAreaView>
  );
};

export default RequestPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20, paddingBottom: 100 },
  loadingText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  carouselContainer: { marginBottom: 20 },
  mainImage: { width: SCREEN_WIDTH, height: 200, resizeMode: "cover" },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C7C7C7",
    marginHorizontal: 4,
  },
  activeDot: { backgroundColor: "#000" },
  block: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#000",
  },
  label: { fontSize: 14, color: "#333", fontWeight: "600", marginBottom: 6 },
  descriptionBox: {
    backgroundColor: "#fff",
    borderColor: "#C7C7C7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  descriptionText: { fontSize: 14, color: "#000", fontWeight: "500" },
  statusWrapper: { backgroundColor: "#F4F4F4", borderRadius: 8, padding: 12 },
  statusText: { fontSize: 14, fontWeight: "700", color: "#000" },
  deleteButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalContainer: { flex: 1, backgroundColor: "#000" },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: "contain",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { color: "#fff", fontSize: 20 },
});
