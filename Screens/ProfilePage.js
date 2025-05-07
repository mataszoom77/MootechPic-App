import React, { useEffect, useState, useContext, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  SafeAreaView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import TopBar from "../assets/Reusable/TopBarNoSearch";
import { AuthContext } from "../context/AuthContext";
import jwt_decode from "jwt-decode";
import api from "../api";

const Profile = () => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    pincode: "",
    address: "",
    city: "",
    state: "",
    country: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  // feedback animation for orders button press (optional)
  const feedbackScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          return;
        }
        const decoded = jwt_decode(token);
        const extractedEmail =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ];
        const extractedUserId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];
        setEmail(extractedEmail);
        setUserId(extractedUserId);

        const response = await api.get(`/users/${extractedUserId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          name: response.data.name || "",
          pincode: response.data.pincode || "",
          address: response.data.address || "",
          city: response.data.city || "",
          country: response.data.country || "",
          state: response.data.state || "",
        });
      } catch (err) {
        if (__DEV__) {
          console.log("Failed to load profile", err);
        }
      }
    };
    loadProfile();
  }, [navigation]);

  const handlePasswordChange = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      await api.put(
        `/users/${userId}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Password changed successfully!");
      setModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      if (__DEV__) {
        console.log("Password change error:", err);
      }
      Alert.alert(
        "Error",
        "Failed to change password. Please check your current password."
      );
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      await api.put(`/users/${userId}/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      if (__DEV__) {
        console.log("Profile update error:", err);
      }
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const goToOrders = () => {
    // optional pulse
    Animated.sequence([
      Animated.timing(feedbackScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(feedbackScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    navigation.navigate("OrdersPage");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <TopBar />
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionTitle}>Personal Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: "#eee" }]}
                value={email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={profile.name}
                placeholder="Enter your name"
                onChangeText={(text) => handleChange("name", text)}
              />
            </View>

            <Pressable onPress={() => setModalVisible(true)}>
              <Text style={styles.changePassword}>Change Password</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Business Address Details</Text>

            {["pincode", "address", "city", "country"].map((field) => (
              <View style={styles.inputGroup} key={field}>
                <Text style={styles.label}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <TextInput
                  style={styles.input}
                  value={profile[field]}
                  placeholder={`Enter ${field}...`}
                  onChangeText={(text) => handleChange(field, text)}
                />
              </View>
            ))}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>

            <Pressable
              style={[styles.saveButton, styles.logoutButton]}
              onPress={logout}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </Pressable>

            {/* Order Information button */}
            <Pressable
              style={[styles.saveButton, styles.orderButton]}
              onPress={goToOrders}
            >
              <Text style={styles.buttonText}>Order Information</Text>
            </Pressable>
          </ScrollView>

          {/* Change Password Modal */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current Password"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <Pressable
                  style={styles.saveButton}
                  onPress={handlePasswordChange}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveButton, styles.logoutButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fdfdfd", flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginTop: 24,
    marginBottom: 8,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "500", marginBottom: 6, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#c8c8c8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  changePassword: {
    marginTop: 6,
    fontSize: 14,
    color: "#ADC81B",
    textDecorationLine: "underline",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#ADC81B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  logoutButton: { backgroundColor: "#e94b4b" },
  orderButton: { backgroundColor: "#3498db" },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  loadingText: { textAlign: "center", color: "#999" },
  relatedSection: {},
  sectionHeader: {},
  productsRow: {},
  productWrapper: {},
  imageSlider: {},
  mainImage: {},
  dotsWrapper: {},
  dot: {},
  activeDot: {},
  title: {},
  descriptionBox: {},
  descriptionText: {},
  priceRow: {},
  quantityBox: {},
  quantityButton: {},
  quantityText: {},
  priceTag: {},
  priceText: {},
  cartButton: {},
  cartText: {},
});

export default Profile;
