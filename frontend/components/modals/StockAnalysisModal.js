import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

const StockAnalysisModal = ({
  analysisResult,
  modalVisible,
  setModalVisible,
  theme,
}) => {
  if (analysisResult)
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
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
                  Analysis Result
                </Text>
                <View
                  style={[
                    styles.resultContent,
                    { backgroundColor: theme.buttonBackground },
                  ]}
                >
                  {Object.entries(analysisResult).map(([key, value], index) => (
                    <View
                      key={index}
                      style={[
                        styles.resultSection,
                        { backgroundColor: theme.background },
                      ]}
                    >
                      <Text style={[styles.resultTitle, { color: theme.text }]}>
                        {key}{" "}
                      </Text>
                      <Text
                        style={[
                          styles.resultValue,
                          { color: theme.buttonText },
                        ]}
                      >
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButton}>Continue to Sell</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    padding: 12,
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
    gap: 15,
    paddingVertical: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  resultSection: {
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  resultValue: {
    fontSize: 16,
    marginTop: 5,
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
  closeButton: {
    backgroundColor: "#96f97b",
    color: "#333",
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

export default StockAnalysisModal;
