import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import axios from "axios";

export default function QrCodeScanner() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

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
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  };

  const handleBarCodeScanned = (data) => {
    const secretKey = process.env.EXPO_PUBLIC_TICKET_INSIGHT_KEY;
    const apiUrl = data.raw;

    setScanned(true);

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
          alert(`QR Code scanned : ${JSON.stringify(response.data)}`);
          setScanned(false);
        })
        .catch((error) => {
          console.log(error);
          setScanned(false);
        });
    } else {
      console.log("Invalid http url");
      setScanned(false);
    }
  };

  // const testHandleBarCodeScanned = () => {
  //   console.log("detected");
  //   const secretKey = process.env.EXPO_PUBLIC_TICKET_INSIGHT_KEY;
  //   const test =
  //     "127.0.0.1:8000/api/ticket_check?ticket=15&participant=018efecf-6272-79d5-99c9-3963b47a8554&event=6";
  //   setScanned(true);

  //   let config = {
  //     method: "get",
  //     maxBodyLength: Infinity,
  //     url: `https://${test}`,
  //     headers: {
  //       "API-Key": secretKey,
  //     },
  //   };

  //   axios
  //     .request(config)
  //     .then((response) => {
  //       console.log(JSON.stringify(response.data));
  //       alert(`QR Code scanned : ${JSON.stringify(response.data)}`);
  //       setScanned(false);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       setScanned(false);
  //     });
  // };

  const toggleCameraFacing = () => {
    console.log("flip");
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{ barCodeTypes: ["qr"] }}
        onBarcodeScanned={!scanned ? handleBarCodeScanned : null}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.text}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={testHandleBarCodeScanned}
          >
            <Text style={styles.text}>Test</Text>
          </TouchableOpacity> */}
        </View>
      </CameraView>
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
});
