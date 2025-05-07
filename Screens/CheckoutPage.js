import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import api from "../api";
import { useCart } from "../context/CartContext";

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard", detail: "3–5 days", price: 0.0 },
  { id: "express", label: "Express", detail: "1–2 days", price: 4.99 },
  { id: "overnight", label: "Overnight", detail: "Next day", price: 14.99 },
];
const PAYMENT_OPTIONS = [
  { id: "apple", label: "Apple Pay" },
  { id: "card", label: "Credit/Debit Card" },
  { id: "cash", label: "Cash on Delivery" },
];

const SectionRow = ({ label, value, placeholder, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Text style={styles.rowLabel}>{label.toUpperCase()}</Text>
    <View style={{ flex: 1 }} />
    <Text style={[styles.rowValue, !value && styles.placeholder]}>
      {value || placeholder}
    </Text>
    <Icon name="chevron-right" size={20} color="#CCC" />
  </TouchableOpacity>
);

export default function CheckoutPage() {
  const navigation = useNavigation();
  const { userToken } = useContext(AuthContext);
  const { cartItems, removeFromCart, clearCart, handleQtyChange } = useCart();

  // Shipping state
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
    country: "",
  });

  // Delivery state
  const [delivModalVisible, setDelivModalVisible] = useState(false);
  const [delivery, setDelivery] = useState("");

  // Payment state
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [payment, setPayment] = useState("");

  // Business state
  const [bizModalVisible, setBizModalVisible] = useState(false);
  const [business, setBusiness] = useState({
    businessName: "",
    businessAddress: "",
    vatNumber: "",
  });

  // Prefill shipping on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return;
        const decoded = jwt_decode(token);
        const userId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        const { data: p } = await api.get(`/users/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShipping({
          name: p.name || "",
          address: p.address || "",
          city: p.city || "",
          pincode: p.pincode || "",
          country: p.country || "",
        });
      } catch (e) {
        if (__DEV__) {
          console.warn("Profile load failed:", e);
        }
      }
    })();
  }, []);

  // Costs
  const shippingCost =
    DELIVERY_OPTIONS.find((o) => o.id === delivery)?.price || 0;
  const subtotal =
    cartItems?.reduce((sum, i) => sum + (i.itemPrice || 0) * i.quantity, 0) ??
    0;

  const taxes = parseFloat((subtotal * 0.1).toFixed(2));
  const total = (subtotal + taxes + shippingCost).toFixed(2);

  // Labels
  const shippingLabel =
    shipping.address && `${shipping.address}, ${shipping.city}`;
  const deliveryLabel = (() => {
    const o = DELIVERY_OPTIONS.find((o) => o.id === delivery);
    return o
      ? `${o.label} (${o.detail}) — ${
          o.price === 0 ? "Free" : `$${o.price.toFixed(2)}`
        }`
      : "";
  })();
  const paymentLabel =
    PAYMENT_OPTIONS.find((o) => o.id === payment)?.label || "";
  const bizLabel = business.businessName || "";

  // Place order
  const handlePlaceOrder = async () => {
    if (!shipping.address) {
      return Alert.alert(
        "Missing address",
        "Please fill in a shipping address."
      );
    }
    if (!delivery) {
      return Alert.alert(
        "Missing delivery",
        "Please select a delivery option."
      );
    }
    if (!payment) {
      return Alert.alert("Missing payment", "Please select a payment method.");
    }
    if (cartItems.length === 0) {
      return Alert.alert(
        "Cart empty",
        "Add items to cart before placing an order."
      );
    }

    // Build payload
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Not authenticated");

      const items = cartItems.map((item) => {
        // map ItemType + ItemId → exactly one foreign key
        switch (item.itemType) {
          case "Product":
            return {
              productId: item.itemId,
              sparePartId: null,
              quantity: item.quantity,
              unitPrice: item.itemPrice,
            };
          case "SparePart":
            return {
              productId: null,
              sparePartId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.itemPrice,
            };
          default:
            throw new Error(`Invalid ItemType "${item.ItemType}"`);
        }
      });

      const payload = {
        shipName: shipping.name,
        shipAddress: shipping.address,
        shipCity: shipping.city,
        shipPincode: shipping.pincode,
        shipCountry: shipping.country,
        deliveryMethod: delivery,
        deliveryCost: shippingCost,
        paymentMethod: payment,
        bizName: business.businessName,
        bizAddress: business.businessAddress,
        bizVatNumber: business.vatNumber,
        items, // the mapped array above
      };

      await api.post("orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearCart();
      navigation.navigate("OrderConfirmation");
    } catch (e) {
      if (__DEV__) {
        console.error("Order failed:", e.response ?? e);
      }
      Alert.alert("Error", e.message || "Failed to place order.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionRow
          label="Shipping"
          value={shippingLabel}
          placeholder="Add shipping address"
          onPress={() => setShipModalVisible(true)}
        />
        <SectionRow
          label="Delivery"
          value={deliveryLabel}
          placeholder="Select delivery"
          onPress={() => setDelivModalVisible(true)}
        />
        <SectionRow
          label="Payment"
          value={paymentLabel}
          placeholder="Select payment"
          onPress={() => setPayModalVisible(true)}
        />
        <SectionRow
          label="Business Details (Optional)"
          value={bizLabel}
          placeholder="Add business details"
          onPress={() => setBizModalVisible(true)}
        />

        {/* Items */}
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsHeaderLabel}>ITEMS</Text>
          <Text style={styles.itemsHeaderLabel}>PRICE</Text>
        </View>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.itemImageUrl }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemBrand}>{item.itemType}</Text>
              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>

              {/* Quantity selector */}
              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  onPress={() => handleQtyChange(item.id, item.quantity - 1)}
                >
                  <Icon name="minus-circle" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => handleQtyChange(item.id, item.quantity + 1)}
                >
                  <Icon name="plus-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromCart(item.id)}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemRight}>
              <Text style={styles.itemPrice}>
                ${(item.itemPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({cartItems.length})
            </Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes</Text>
            <Text style={styles.summaryValue}>${taxes.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total}</Text>
          </View>
        </View>

        {/* Place order */}
        <TouchableOpacity style={styles.placeOrder} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place order</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Shipping Modal */}
      <Modal visible={shipModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Shipping Address</Text>
            {["name", "address", "city", "pincode", "country"].map((key) => (
              <View style={styles.inputGroup} key={key}>
                <Text style={styles.inputLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${key}`}
                  value={shipping[key]}
                  onChangeText={(txt) =>
                    setShipping((s) => ({ ...s, [key]: txt }))
                  }
                />
              </View>
            ))}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setShipModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSave]}
                onPress={() => setShipModalVisible(false)}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delivery Modal */}
      <Modal visible={delivModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Delivery</Text>
            {DELIVERY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.deliveryOption}
                onPress={() => {
                  setDelivery(opt.id);
                  setDelivModalVisible(false);
                }}
              >
                <View>
                  <Text style={styles.deliveryLabel}>{opt.label}</Text>
                  <Text style={styles.deliveryDetail}>{opt.detail}</Text>
                </View>
                <Text style={styles.deliveryPrice}>
                  {opt.price === 0 ? "Free" : `$${opt.price.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            ))}
            <Pressable
              style={[styles.btn, styles.btnCancel, { alignSelf: "flex-end" }]}
              onPress={() => setDelivModalVisible(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={payModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment</Text>
            {PAYMENT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.deliveryOption}
                onPress={() => {
                  setPayment(opt.id);
                  setPayModalVisible(false);
                }}
              >
                <Text style={styles.deliveryLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <Pressable
              style={[styles.btn, styles.btnCancel, { alignSelf: "flex-end" }]}
              onPress={() => setPayModalVisible(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Business Details Modal */}
      <Modal visible={bizModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Business Details (Optional)</Text>
            {[
              { key: "businessName", label: "Business Name" },
              { key: "businessAddress", label: "Business Address" },
              { key: "vatNumber", label: "VAT Number" },
            ].map(({ key, label }) => (
              <View style={styles.inputGroup} key={key}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${label}`}
                  value={business[key]}
                  onChangeText={(txt) =>
                    setBusiness((b) => ({ ...b, [key]: txt }))
                  }
                />
              </View>
            ))}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setBizModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSave]}
                onPress={() => setBizModalVisible(false)}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

//export default CheckoutPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  title: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "700" },
  content: { padding: 16 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#000" },
  rowValue: { fontSize: 14, color: "#555" },
  placeholder: { color: "#AAA" },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyText: {
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  removeBtn: {
    marginTop: 8,
  },
  removeText: {
    color: "#e94b4b",
    fontSize: 14,
    fontWeight: "600",
  },

  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  itemsHeaderLabel: { fontSize: 14, fontWeight: "700", color: "#000" },
  itemRow: { flexDirection: "row", marginBottom: 16 },
  itemImage: { width: 84, height: 84, borderRadius: 8, marginRight: 12 },
  itemDetails: { flex: 1 },
  itemBrand: { fontSize: 12, color: "#888" },
  itemName: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  itemDesc: { fontSize: 13, color: "#444", marginTop: 2 },
  itemQty: { fontSize: 13, color: "#666", marginTop: 2 },
  itemRight: { justifyContent: "space-between", alignItems: "flex-end" },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#000" },

  summary: {
    borderTopWidth: 1,
    borderColor: "#EEE",
    paddingTop: 16,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: "#000" },
  summaryValue: { fontSize: 14, color: "#000" },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#000" },
  totalValue: { fontSize: 16, fontWeight: "700", color: "#000" },

  placeOrder: {
    backgroundColor: "#ADC81B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  placeOrderText: { fontSize: 15, fontWeight: "600", color: "#FFF" },

  /* Modal shared */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: "#555", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  btnCancel: { backgroundColor: "#EEE" },
  btnSave: { backgroundColor: "#ADC81B" },
  btnText: { fontSize: 14, fontWeight: "600" },

  /* Delivery & Payment options */
  deliveryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  deliveryLabel: { fontSize: 16, fontWeight: "600" },
  deliveryDetail: { fontSize: 13, color: "#666" },
  deliveryPrice: { fontSize: 14, fontWeight: "600", alignSelf: "center" },
});
