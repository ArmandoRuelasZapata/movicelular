import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors, GlobalStyles } from "./GlobalStyles";

// ✅ auth viene del proyecto 'usuarios' (donde se hace el login)
import { auth } from "../../firebaseConfigUsuarios";

// ✅ db viene del proyecto 'reportes' (donde se guardan los reportes)
import { getApps, initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfigReportes = {
  apiKey: "AIzaSyCfwkyv2JPaHb8u06Ab7VcH2v9QJEwRnmY",
  authDomain: "reportes-proyecto-idor.firebaseapp.com",
  projectId: "reportes-proyecto-idor",
  storageBucket: "reportes-proyecto-idor.firebasestorage.app",
  messagingSenderId: "635696829226",
  appId: "1:635696829226:web:a8b40553eb5b23528b0453",
};

// Guard para no inicializar la instancia dos veces
const appReportes =
  getApps().find((a) => a.name === "reportes") ||
  initializeApp(firebaseConfigReportes, "reportes");

const db = getFirestore(appReportes);

const ReportsScreen = () => {
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [detallesExtra, setDetallesExtra] = useState("");
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [tipoIncidencia, setTipoIncidencia] = useState("");
  const [showError, setShowError] = useState(false);
  const [sending, setSending] = useState(false);

  const [coordenadas, setCoordenadas] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const opcionesIncidencia = [
    { id: "choque", label: "Choque vehicular" },
    { id: "bache", label: "Bache" },
    { id: "bloqueo", label: "Calle bloqueada" },
  ];

  useEffect(() => {
    obtenerUbicacionActual();
  }, []);

  const obtenerUbicacionActual = async () => {
    setLoadingLocation(true);
    setLocation("");

    try {
      // 1️⃣ Verificar si el GPS está encendido
      const serviciosActivos = await Location.hasServicesEnabledAsync();
      if (!serviciosActivos) {
        Alert.alert(
          "Ubicación desactivada",
          "Por favor activa el GPS de tu dispositivo e intenta de nuevo.",
          [{ text: "OK" }],
        );
        setLocation("GPS desactivado");
        setLoadingLocation(false);
        return;
      }

      // 2️⃣ Solicitar permiso
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a tu ubicación para registrar el lugar del incidente.",
          [{ text: "Entendido" }],
        );
        setLocation("Permiso de ubicación denegado");
        setLoadingLocation(false);
        return;
      }

      // 3️⃣ Obtener posición con precisión balanceada
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      const { latitude, longitude } = pos.coords;
      setCoordenadas({ latitude, longitude });

      // 4️⃣ Geocodificación inversa para dirección legible
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const calle = address.street || address.name || "Calle desconocida";
        const numero = address.streetNumber ? ` #${address.streetNumber}` : "";
        const colonia = address.district || address.subregion || "";
        const ciudad = address.city || address.region || "";

        const direccionCompleta = [`${calle}${numero}`, colonia, ciudad]
          .filter(Boolean)
          .join(", ");

        setLocation(direccionCompleta);
      } else {
        // Fallback: mostrar coordenadas si no hay geocodificación
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (error: any) {
      console.error("Error al obtener ubicación:", error);

      if (error?.code === "E_LOCATION_TIMEOUT") {
        Alert.alert(
          "Tiempo agotado",
          "No se pudo obtener la ubicación. Verifica que el GPS esté activo.",
          [
            { text: "Reintentar", onPress: obtenerUbicacionActual },
            { text: "Cancelar" },
          ],
        );
        setLocation("Tiempo agotado — toca ↺ para reintentar");
      } else if (error?.code === "E_LOCATION_UNAVAILABLE") {
        Alert.alert(
          "Ubicación no disponible",
          "El dispositivo no pudo determinar tu posición. Intenta en un lugar abierto.",
          [
            { text: "Reintentar", onPress: obtenerUbicacionActual },
            { text: "Cancelar" },
          ],
        );
        setLocation("Ubicación no disponible");
      } else {
        setLocation("No se pudo obtener la ubicación");
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const tomarFoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso denegado",
        "¡Se requiere permiso para usar la cámara!",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const convertirImagenABase64 = async (
    uri: string,
  ): Promise<string | null> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      return null;
    }
  };

  const procesarReporte = async () => {
    if (
      !tipoIncidencia ||
      titulo.trim() === "" ||
      descripcion.trim() === "" ||
      recomendaciones.trim() === ""
    ) {
      setShowError(true);
      return;
    }

    setSending(true);

    try {
      // ✅ auth.currentUser del proyecto 'usuarios' — tiene la sesión activa
      const user = auth.currentUser;
      const userUid = user ? user.uid : "anonimo";

      // Verificamos rol en la colección 'moderadores' del proyecto reportes
      let tipoUsuario = "usuario";
      if (user) {
        const modDocRef = doc(db, "moderadores", user.uid);
        const modSnap = await getDoc(modDocRef);
        if (modSnap.exists()) tipoUsuario = "moderador";
      }

      let imagenBase64 = null;
      if (image) imagenBase64 = await convertirImagenABase64(image);

      const datosReporte = {
        titulo,
        descripcion,
        ubicacion: location || "Ubicación no disponible",
        latitude: coordenadas?.latitude ?? null,
        longitude: coordenadas?.longitude ?? null,
        tipo_incidencia: tipoIncidencia,
        recomendaciones,
        detalles_extra: detallesExtra || null,
        imagen: imagenBase64,
        estatus: "atencion",
        uid: userUid, // ✅ UID real del usuario autenticado
        enviado_por_tipo: tipoUsuario,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "reportes"), datosReporte);

      setTitulo("");
      setDescripcion("");
      setRecomendaciones("");
      setDetallesExtra("");
      setImage(null);
      setTipoIncidencia("");

      router.replace({
        pathname: "/inicio",
        params: {
          mostrarAlerta: "true",
          folio: docRef.id,
          motivo: tipoIncidencia,
          recomendacion: recomendaciones,
        },
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar el reporte.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Crear reporte</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de incidencia *</Text>
          <View style={styles.chipContainer}>
            {opcionesIncidencia.map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={[
                  styles.chip,
                  tipoIncidencia === opcion.id && styles.chipSelected,
                ]}
                onPress={() => setTipoIncidencia(opcion.id)}
                disabled={sending}
              >
                <Text
                  style={[
                    styles.chipText,
                    tipoIncidencia === opcion.id && styles.chipTextSelected,
                  ]}
                >
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título del reporte *</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe un título:"
            value={titulo}
            onChangeText={setTitulo}
            editable={!sending}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción general *</Text>
          <TextInput
            style={styles.input}
            placeholder="Comenta que ha ocurrido:"
            value={descripcion}
            onChangeText={setDescripcion}
            editable={!sending}
          />
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={tomarFoto}
            disabled={sending}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="camera-outline" size={40} color="#999" />
                <Ionicons name="add" size={20} color="#999" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ubicación</Text>
          <View style={styles.locationInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Obteniendo ubicación..."
              value={location}
              editable={false}
            />
            {loadingLocation ? (
              <ActivityIndicator
                color={AppColors.PRIMARY}
                style={{ marginLeft: 10 }}
              />
            ) : (
              // Botón para reintentar obtener ubicación manualmente
              <TouchableOpacity
                onPress={obtenerUbicacionActual}
                style={{ marginLeft: 10 }}
              >
                <Ionicons
                  name="refresh-outline"
                  size={22}
                  color={AppColors.PRIMARY}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recomendaciones *</Text>
          <TextInput
            style={styles.input}
            placeholder="Instrucciones para otros conductores:"
            value={recomendaciones}
            onChangeText={setRecomendaciones}
            editable={!sending}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Más detalles (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Algo más que deseas compartir:"
            value={detallesExtra}
            onChangeText={setDetallesExtra}
            editable={!sending}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, sending && styles.buttonDisabled]}
            onPress={procesarReporte}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continuar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace("/(tabs)/inicio")}
            disabled={sending}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>No se ha generado el reporte</Text>
            <Text style={styles.modalBoldLabel}>Motivo:</Text>
            <Text style={styles.modalValue}>
              Le faltó llenar campos obligatorios (*)
            </Text>
            <TouchableOpacity
              style={styles.btnAceptarError}
              onPress={() => setShowError(false)}
            >
              <Text style={styles.btnAceptarText}>aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40 },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 30,
  },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 18, fontWeight: "bold", color: "#000", marginBottom: 10 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.PRIMARY,
    backgroundColor: "#FFF",
  },
  chipSelected: { backgroundColor: AppColors.PRIMARY },
  chipText: { color: AppColors.PRIMARY, fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: "#FFF" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
    fontSize: 16,
    paddingVertical: 5,
    color: "#333",
  },
  imageUploadButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: "#CCC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginTop: 15,
  },
  previewImage: { width: "100%", height: "100%" },
  locationInputContainer: { flexDirection: "row", alignItems: "center" },
  buttonContainer: { marginTop: 20, gap: 15 },
  continueButton: {
    backgroundColor: AppColors.PRIMARY,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.PRIMARY,
  },
  cancelButtonText: {
    color: AppColors.PRIMARY,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: { opacity: 0.6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "75%",
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  modalBoldLabel: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  modalValue: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    textAlign: "center",
  },
  btnAceptarText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnAceptarError: {
    backgroundColor: "#AF282B",
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
});

export default ReportsScreen;
