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
  const [CameraModule, setCameraModule] = useState<typeof import("expo-camera") | null>(null)
  const [permission, setPermission] = useState<string | null>(null)
  const [scanned, setScanned] = useState(false)
  const [moduleError, setModuleError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) {
      setScanned(false)
      return
    }

    void (async () => {
      try {
        if (!CameraModule) {
          const camera = await import("expo-camera")
          setCameraModule(camera)
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Camera module failed to load")
        setModuleError(err.message)
        onScanFailure(err)
        return
      }

      try {
        if (CameraModule) {
          const result = await CameraModule.requestCameraPermissionsAsync()
          setPermission(result.status)
        }
      } catch (error) {
        onScanFailure(error instanceof Error ? error : new Error("Camera permission error"))
      }
    })()
  }, [visible, onScanFailure, CameraModule])

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
          {moduleError ? (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionText}>{moduleError}</Text>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          ) : permission === null || CameraModule === null ? (
            <ActivityIndicator size="large" color="#4e8cff" style={styles.loader} />
          ) : permission !== CameraModule.PermissionStatus.GRANTED ? (
            <View style={styles.permissionCard}>
              <Text style={styles.permissionText}>Camera access is required to scan barcodes.</Text>
              <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          ) : (
            <CameraModule.Camera
              style={styles.camera}
              type={CameraModule.CameraType.back}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              barCodeScannerSettings={{ barCodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_e", "upc_a"] }}
            >
              <View style={styles.cameraOverlay}>
                <Text style={styles.cameraHint}>Point the camera at a barcode</Text>
                <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </CameraModule.Camera>
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
