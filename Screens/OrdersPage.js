import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Pressable,
} from "react-native";
import MainLayout from "../Navigation/MainLayout";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

const statusOptions = ["all", "pending", "delivered", "cancelled"];

const OrdersPage = () => {
  const { userToken } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const enriched = await Promise.all(
        res.data.map(async (order) => {
          const items = await Promise.all(
            order.items.map(async (it) => {
              let detail;
              if (it.productId) {
                const r = await api.get(`/Products/${it.productId}`, {
                  headers: { Authorization: `Bearer ${userToken}` },
                });
                detail = r.data;
              } else {
                const r = await api.get(`/SpareParts/${it.sparePartId}`, {
                  headers: { Authorization: `Bearer ${userToken}` },
                });
                detail = r.data;
              }
              return { ...it, name: detail.name || detail.title || "" };
            })
          );
          return { ...order, items };
        })
      );
      setOrders(enriched);
      setFilteredOrders(enriched);
    } catch (err) {
      if (__DEV__) {
        console.log("Failed to fetch orders", err);
      }
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o.status === filterStatus));
  }, [filterStatus, orders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const date = new Date(item.createdAt).toLocaleString();
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderId}>
            Order #{item.id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <Text style={[styles.status, styles[`status_${item.status}`]]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
        <ScrollView style={styles.itemsList} nestedScrollEnabled>
          {item.items.map((it) => (
            <View style={styles.itemRow} key={it.id}>
              <Text style={styles.itemTitle}>{it.name}</Text>
              <Text style={styles.itemDetail}>x{it.quantity}</Text>
              <Text style={styles.itemDetail}>€{it.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.costRows}>
          <Text style={styles.costLabel}>Subtotal:</Text>
          <Text style={styles.costValue}>€{item.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.costRows}>
          <Text style={styles.costLabel}>
            Delivery ({item.deliveryMethod}):
          </Text>
          <Text style={styles.costValue}>€{item.deliveryCost.toFixed(2)}</Text>
        </View>
        <View style={styles.costRows}>
          <Text style={styles.costLabel}>Taxes:</Text>
          <Text style={styles.costValue}>€{item.taxes.toFixed(2)}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>€{item.total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <MainLayout>
      <SafeAreaView style={styles.container}>
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((status) => {
              const label = status.charAt(0).toUpperCase() + status.slice(1);
              const selected = filterStatus === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setFilterStatus(status)}
                  style={[
                    styles.filterButton,
                    selected && styles.filterButtonActive,
                  ]}
                >
                  <Text
                    style={
                      selected ? styles.filterTextActive : styles.filterText
                    }
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <Text style={styles.message}>Loading orders...</Text>
        ) : error ? (
          <Text style={styles.message}>{error}</Text>
        ) : filteredOrders.length === 0 ? (
          <Text style={styles.message}>No orders found.</Text>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(o) => o.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </SafeAreaView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fdfdfd" },
  filterRow: {
    flexDirection: "row",
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: "#eee",
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: "#ADC81B",
  },
  filterText: {
    color: "#333",
    fontSize: 14,
  },
  filterTextActive: {
    color: "#fff",
    fontSize: 14,
  },
  list: { padding: 16, paddingBottom: 100 },
  message: { textAlign: "center", marginTop: 50, color: "#666" },
  businessSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fafafa",
    borderRadius: 6,
  },
  sectionTitle: { fontWeight: "700", marginBottom: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#00000026",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: { fontWeight: "700", fontSize: 16 },
  orderDate: { fontSize: 12, color: "#888" },
  status: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  status_pending: { color: "#f39c12" },
  status_express: { color: "#3498db" },
  status_delivered: { color: "#2ecc71" },
  status_cancelled: { color: "#e74c3c" },
  itemsList: { maxHeight: 120, marginBottom: 12 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemTitle: { flex: 1, fontSize: 14, color: "#333" },
  itemDetail: { fontSize: 14, marginLeft: 8, color: "#555" },
  costRows: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  costLabel: { fontSize: 14, color: "#555" },
  costValue: { fontSize: 14, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: { fontSize: 14, fontWeight: "600", marginRight: 8 },
  totalValue: { fontSize: 14, fontWeight: "700" },
});

export default OrdersPage;
