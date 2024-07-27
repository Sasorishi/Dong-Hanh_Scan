import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import axios from "axios";
import Svg, { Path } from "react-native-svg";

export default function QrCodeScanner() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const isValidHttpUrl = (string) => {
    let urlString = string.trim();
    console.log(string);
    // If the string does not start with a protocol, prepend 'http://'
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = "http://" + urlString;
    }

    let url;

    try {
      url = new URL(urlString);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  };

  const handleBarCodeScanned = (data) => {
    const secretKey = process.env.EXPO_PUBLIC_TICKET_INSIGHT_KEY;
    const apiUrl = data.raw;

    setScanned(true);
    console.log(apiUrl);

    if (isValidHttpUrl(apiUrl)) {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `https://${apiUrl}`,
        headers: {
          "API-Key": secretKey,
        },
      };

      axios
        .request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          // alert(`QR Code scanned : ${JSON.stringify(response.data)}`);
          setScannedData(response.data);
          setModalVisible(true);
          setScanned(false);
        })
        .catch((error) => {
          console.log(error);
          alert(`Error : ${error}`);
          setScanned(false);
        });
    } else {
      console.log("Invalid http url");
      alert(`Invalid http url`);
      setScanned(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{ barCodeTypes: ["qr"] }}
        onBarcodeScanned={
          !scanned && !modalVisible ? handleBarCodeScanned : null
        }
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>QR Code Data</Text>
          {scannedData ? (
            <View style={styles.modalContent}>
              <Text>Message: {scannedData.message}</Text>
              <Text>Ticket ID: {scannedData.ticket[0]["ticket ID"]}</Text>
              <Text>
                Participant ID: {scannedData.ticket[0]["participant ID"]}
              </Text>
              <Text>First Name: {scannedData.ticket[0].firstname}</Text>
              <Text>Last Name: {scannedData.ticket[0].lastname}</Text>
              <Text>Age: {scannedData.ticket[0].age}</Text>
              <Text>Gender: {scannedData.ticket[0].gender}</Text>
              <Text>Event: {scannedData.ticket[0].event}</Text>
              <Text>
                Event Category: {scannedData.ticket[0].event_category}
              </Text>
            </View>
          ) : (
            <Text>No data available</Text>
          )}
          <TouchableOpacity
            style={[styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.textStyle}>Close</Text>
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              width={30}
              height={30}
              viewBox="0 0 30 30"
            >
              <Path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonClose: {
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: "#2196F3",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 20,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalContent: {
    alignItems: "flex-start",
  },
});
