import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import TopBarNoSearch from "../assets/Reusable/TopBarNoSearch";
import api from "../api";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";

// Extracted card into its own component so hooks aren’t called inside a loop
const RequestCard = ({ request }) => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const imageUri =
    request.imageUrls && request.imageUrls.length > 0
      ? request.imageUrls[0]
      : null;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={() => navigation.navigate("RequestPage", { id: request.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.cardTop}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.image} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{request.name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {request.description}
            </Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.statusGroup}>
            <Text style={styles.statusLabel}>Status</Text>
            <TouchableOpacity
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    request.status === "Answered" ? "#ADC81B" : "#FBD24B",
                },
              ]}
            >
              <Text style={styles.statusText}>{request.status}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { userToken } = useContext(AuthContext);
  const navigation = useNavigation();

  // extracted loader so we can call it on mount and on pull-to-refresh
  const loadRequests = async () => {
    try {
      const res = await api.get("/Requests", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setRequests(res.data);
    } catch (err) {
      if (__DEV__) {
        console.error("Failed loading requests:", err);
      }
    }
  };

  useEffect(() => {
    if (userToken) {
      loadRequests();
    }
  }, [userToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBarNoSearch />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>My Requests</Text>
        {requests.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#444",
  },
  cardBottom: {
    flexDirection: "column",
    gap: 8,
  },
  statusGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
