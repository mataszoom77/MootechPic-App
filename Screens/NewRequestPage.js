import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import * as ImageManipulator from "expo-image-manipulator";
import { useNavigation } from "@react-navigation/native";
import api, { uploadImages, uploadImage } from "../api";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import TopBarNoSearch from "../assets/Reusable/TopBarNoSearch";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const NewRequestPage = () => {
  const { userInfo, userToken } = useContext(AuthContext);
  const navigation = useNavigation();
  const [productName, setProductName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [problemDescription, setProblemDescription] = useState("");

  // For previews
  const [images, setImages] = useState([]);

  // New: holds uploaded Cloudinary URLs
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  async function shrinkUri(uri) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }
  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert(
          "Permission required",
          "Camera access is needed to take photos."
        );
      }
      const result = await ImagePicker.launchCameraAsync();
      if (result.canceled) return;

      // shrink locally
      const localUri = await shrinkUri(result.assets[0].uri);
      setImages((prev) => [...prev, localUri]);

      // pre-upload
      setIsUploading(true);
      uploadImage(localUri, userToken)
        .then((url) => setUploadedUrls((prev) => [...prev, url]))
        .catch((err) => {
          // optional: only warn in dev
          if (__DEV__) {
            console.warn("[DEV] upload failed:", err);
          }
        })
        .finally(() => setIsUploading(false));
    } catch (err) {
      if (__DEV__) {
        console.error("[DEV] pickFromCamera error:", err);
      }
    }
  };

  const pickFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        return Alert.alert(
          "Permission required",
          "Library access is needed to select photos."
        );
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
      });
      if (result.canceled) return;

      // shrink all, update preview URIs
      const shrunkUris = await Promise.all(
        result.assets.map(async (asset) => {
          const shrunk = await shrinkUri(asset.uri);
          setImages((prev) => [...prev, shrunk]);
          return shrunk;
        })
      );
      setIsUploading(false);

      // pre-upload in parallel
      const jobs = shrunkUris.map((uri) =>
        uploadImage(uri, userToken)
          .then((url) => setUploadedUrls((prev) => [...prev, url]))
          .catch((err) => {
            if (__DEV__) {
              console.warn("Upload failed:", err);
            }
          })
      );
      await Promise.all(jobs);
      setIsUploading(false);
    } catch (err) {
      if (__DEV__) {
        console.error("[DEV] pickFromLibrary error:", err);
      }
    }
  };

  const onPressAddPhoto = () => {
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: pickFromCamera },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= images.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
    setCurrentIndex(idx);
  };

  const openModal = (idx) => {
    setModalIndex(idx);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (isUploading) {
      return Alert.alert(
        "Please wait",
        "Images are still uploading. Try again shortly."
      );
    }
    if (!productName.trim()) {
      return Alert.alert("Missing name", "Please enter a product name.");
    }
    try {
      // just POST the URLs you've already uploaded
      await api.post(
        "/Requests",
        {
          name: productName,
          description: problemDescription,
          imageUrls: uploadedUrls,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      // 1) clear your form
      setProductName("");
      setProblemDescription("");
      setImages([]);
      setUploadedUrls([]);

      // 2) go to the Requests tab
      //   replace 'Requests' with the exact name of your tab route
      navigation.navigate("RequestsPage");
    } catch (err) {
      if (__DEV__) {
        console.error("[DEV] handleSubmit error:", err);
      }
      Alert.alert("Error", err.message || "Something went wrong.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <TopBarNoSearch />

            {/* Slideshow Preview */}
            {images.length > 0 && (
              <View>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={styles.slideshow}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  {images.map((uri, idx) => (
                    <View key={idx} style={styles.slide}>
                      <TouchableOpacity onPress={() => openModal(idx)}>
                        <Image source={{ uri }} style={styles.slideImage} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeImage(idx)}
                      >
                        <Text style={styles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                {/* Dot Indicators */}
                <View style={styles.dotsContainer}>
                  {images.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        idx === currentIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Fullscreen Modal */}
            <Modal visible={modalVisible} transparent={true}>
              <View style={styles.modalBackground}>
                <Image
                  source={{ uri: images[modalIndex] }}
                  style={styles.fullscreenImage}
                />
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* Add Photo */}
            <Text style={styles.label}>Add Photo</Text>
            <TouchableOpacity
              style={styles.photoUpload}
              onPress={onPressAddPhoto}
            >
              <Image
                source={{
                  uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/hdXYvvDCx2/wdr4w488_expires_30_days.png",
                }}
                style={styles.photoIcon}
              />
            </TouchableOpacity>

            {/* Product Input */}
            <Text style={styles.label}>
              Product to which spare part belongs to
            </Text>
            <TextInput
              placeholder="Product name..."
              placeholderTextColor="#111"
              value={productName}
              onChangeText={setProductName}
              style={styles.input}
            />

            {/* Description Input */}
            <Text style={styles.label}>Problem description</Text>
            <TextInput
              placeholder="Sulūžo spyruoklė..."
              value={problemDescription}
              onChangeText={setProblemDescription}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textArea]}
            />

            {/* Upload Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>Upload Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default NewRequestPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFD" },
  content: { padding: 20, paddingBottom: 100 },
  slideshow: { height: 200, marginBottom: 8 },
  slide: { position: "relative", marginRight: 10 },
  slideImage: {
    width: SCREEN_WIDTH - 40,
    height: 200,
    borderRadius: 8,
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 16, lineHeight: 16 },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C7C7C7",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  photoUpload: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    backgroundColor: "#E1E0E0",
    borderRadius: 8,
    marginBottom: 20,
  },
  photoIcon: { width: 35, height: 35 },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C7C7C7",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 20,
    color: "#000",
  },
  textArea: { height: 120, textAlignVertical: "top" },
  submitButton: {
    backgroundColor: "#ADC81B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { fontSize: 15, fontWeight: "600", color: "#FFFFFF" },
});
