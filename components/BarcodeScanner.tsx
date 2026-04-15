import * as Camera from "expo-camera"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

type BarcodeScannerProps = {
  visible: boolean
  onClose: () => void
  onScanSuccess: (data: string) => void
  onScanFailure: (error: Error) => void
}

export default function BarcodeScanner({ visible, onClose, onScanSuccess, onScanFailure }: BarcodeScannerProps) {
  const [permission, setPermission] = useState<string | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    if (!visible) {
      setScanned(false)
      return
    }

    void (async () => {
      try {
        const result = await Camera.requestCameraPermissionsAsync()
        setPermission(result.status)
      } catch (error) {
        onScanFailure(error instanceof Error ? error : new Error("Camera permission error"))
      }
    })()
  }, [visible, onScanFailure])

  const handleBarCodeScanned = ({ data }: { data: string; type: string }) => {
    if (scanned) return
    setScanned(true)
    onScanSuccess(data)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.heading}>Scan barcode</Text>
          {permission === null ? (
            <ActivityIndicator size="large" color="#4e8cff" style={styles.loader} />
          ) : permission !== "granted" ? (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionText}>Camera access is required to scan barcodes.</Text>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          ) : (
            <Camera.Camera
              style={styles.camera}
              type={Camera.CameraType.back}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeScannerSettings={{ barCodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_e", "upc_a"] }}
            >
              <View style={styles.cameraOverlay}>
                <Text style={styles.cameraHint}>Point the camera at a barcode</Text>
                <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </Camera.Camera>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#061024",
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 320,
  },
  heading: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    padding: 16,
  },
  loader: {
    marginTop: 32,
  },
  permissionCard: {
    padding: 20,
  },
  permissionText: {
    color: "#8f9ab2",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#4e8cff",
    borderRadius: 12,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  camera: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cameraHint: {
    color: "#f8fbff",
    fontSize: 14,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.75,
  },
})
