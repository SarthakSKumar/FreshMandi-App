import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from "react-native";

const FairPriceSection = ({ theme, analysisResult }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [predictedPrice, setPredictedPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDateSelection = async (date) => {
    setSelectedDate(date);
    setModalVisible(false);
    setLoading(true);

    try {
      const formData = new FormData();

      const formattedDate =
        date === "Tomorrow"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : date === "After 7 days"
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const formattedDateStr = formattedDate
        .toISOString()
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("-");

      formData.append("class_name", analysisResult["Type"]);
      formData.append("date", formattedDateStr);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/predict_price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch predicted price.");
      }

      setPredictedPrice(result > 0 ? Math.round(result, 5) : 0);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
        }}
      >
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.selectDateButton, { color: theme.text }]}>
            Select Date
          </Text>
        </TouchableOpacity>
        {selectedDate && (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text style={[styles.subheading, { color: theme.text }]}>
              Predicted Price:
            </Text>
            {loading ? (
              <ActivityIndicator color="#21af71" size="large" />
            ) : (
              <Text
                style={{
                  color: "#21af71",
                  fontSize: 40,
                  fontWeight: "500",
                }}
              >
                ₹{predictedPrice}
              </Text>
            )}
          </View>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContainer,
                  { backgroundColor: theme.background },
                ]}
              >
                <Text style={[styles.resultText, { color: theme.text }]}>
                  Choose a Date
                </Text>
                <View
                  style={[
                    styles.resultContent,
                    { backgroundColor: theme.buttonBackground },
                  ]}
                >
                  {["Tomorrow", "After 7 days", "After a month"].map(
                    (option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.optionButton}
                        onPress={() => handleDateSelection(option)}
                      >
                        <Text style={styles.optionButtonText}>{option}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.closeButtonText]}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
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
  resultText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  resultContent: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    paddingVertical: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  selectDateButton: {
    backgroundColor: "#21af71",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 15,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 22,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  optionButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
    width: "100%",
  },
  optionButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
  },
  closeButtonText: {
    color: "#ff5722",
    fontSize: 18,
    fontWeight: "500",
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    fontWeight: "600",
    paddingHorizontal: 10,
    elevation: 5,
  },
});

export default FairPriceSection;
