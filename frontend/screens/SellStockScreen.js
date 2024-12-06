import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { ThemeContext } from "../contexts/ThemeProvider";
import ScreenLayout from "../layout/ScreenLayout";
import StockAnalysisModal from "../components/modals/StockAnalysisModal";
import FairPriceSection from "../components/sections/FairPriceSection";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SellStockScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    const options = [
      { text: "Click Photo", onPress: openCamera },
      { text: "Upload from Gallery", onPress: openGallery },
      { text: "Cancel", style: "cancel" },
    ];

    Alert.alert("Image Upload", "", options);
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission to access the camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResult(null);
    } else {
      Alert.alert("You did not capture any image.");
    }
  };

  const openGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission to access the media is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setAnalysisResult(null);
    } else {
      Alert.alert("You did not select any image.");
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("Please select an image first.");
      return;
    }
    if (analysisResult) {
      return setModalVisible(true);
    }
    setAnalysisResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      const userId = await AsyncStorage.getItem("userid");
      formData.append("image", {
        uri: selectedImage,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      formData.append("userid", userId);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/process_image`,
        {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error("Unable to process image.\nKindly re-upload.");
      }

      setAnalysisResult(result);
      setModalVisible(true);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="Sell Stock">
      {!analysisResult && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground }]}
          onPress={pickImage}
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>
            {!analysisResult && selectedImage
              ? "Re-Upload Stock Image"
              : "Upload Stock Image"}
          </Text>
        </TouchableOpacity>
      )}
      <View
        style={
          selectedImage
            ? styles.imageContainer
            : [
                styles.imageContainer,
                { backgroundColor: theme.buttonBackground },
              ]
        }
      >
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        )}
      </View>

      {selectedImage && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2196F3" }]}
          onPress={analyzeImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" style={{ margin: 4 }} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {analysisResult ? "View Stock Analysis" : "Analyze Stock"}
            </Text>
          )}
        </TouchableOpacity>
      )}
      <StockAnalysisModal
        analysisResult={analysisResult}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        theme={theme}
      />
      {selectedImage && analysisResult && (
        <FairPriceSection theme={theme} analysisResult={analysisResult} />
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    elevation: 5,
  },
  imageContainer: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    padding: 12,
  },
});

export default SellStockScreen;
