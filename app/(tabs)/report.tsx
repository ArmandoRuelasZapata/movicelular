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
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors, GlobalStyles } from "./GlobalStyles";

// --- NUEVAS IMPORTACIONES DE FIREBASE ---
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

// --- CONFIGURACIÓN DE FIREBASE ---
// Mismos datos que usamos en Laravel
const firebaseConfig = {
  apiKey: "AIzaSyCfwkyv2JPaHb8u06Ab7VcH2v9QJEwRnmY",
  authDomain: "reportes-proyecto-idor.firebaseapp.com",
  projectId: "reportes-proyecto-idor",
  storageBucket: "reportes-proyecto-idor.firebasestorage.app",
  messagingSenderId: "635696829226",
  appId: "1:635696829226:web:a8b40553eb5b23528b0453",
};

// Inicializar la app y la base de datos de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ReportsScreen = () => {
  const router = useRouter();

  // --- ESTADOS INDEPENDIENTES PARA CADA CAMPO ---
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

  // Ya no necesitamos la API de Laravel
  // const API_URL = "http://192.168.1.194:8000/api/reportes";

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
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se requiere permiso para acceder a la ubicación.",
        );
        setLoadingLocation(false);
        return;
      }
      let pos = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (reverseGeocode.length > 0) {
        let address = reverseGeocode[0];
        setLocation(
          `${address.street || "Calle desconocida"} ${address.name || ""}, ${address.city || ""}`,
        );
      }
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    }
    setLoadingLocation(false);
  };

  const tomarFoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permiso denegado",
        "¡Se requiere permiso para usar la cámara!",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
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
      console.error("Error al convertir imagen:", error);
      return null;
    }
  };

  // ==========================================
  // FUNCIÓN MODIFICADA PARA GUARDAR EN FIREBASE
  // ==========================================
  const procesarReporte = async () => {
    // Validación de campos obligatorios
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
      // Convertir imagen a base64 si existe
      let imagenBase64 = null;
      if (image) {
        imagenBase64 = await convertirImagenABase64(image);
      }

      // 1. Preparar datos para Firestore
      // Agregamos el estatus "atencion" y timestamps de Firebase
      const datosReporte = {
        titulo: titulo,
        descripcion: descripcion,
        ubicacion: location || "Ubicación no disponible",
        tipo_incidencia: tipoIncidencia,
        recomendaciones: recomendaciones,
        detalles_extra: detallesExtra || null,
        imagen: imagenBase64,
        estatus: "atencion", // Estatus inicial para el panel web
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      console.log("Guardando reporte en Firestore...");

      // 2. Enviar a la colección "reportes" en Firestore
      const docRef = await addDoc(collection(db, "reportes"), datosReporte);

      console.log("Reporte guardado con ID:", docRef.id);

      // Limpiar formulario
      setTitulo("");
      setDescripcion("");
      setRecomendaciones("");
      setDetallesExtra("");
      setImage(null);
      setTipoIncidencia("");

      // Navegar a inicio con el ID generado por Firebase
      router.replace({
        pathname: "/inicio",
        params: {
          mostrarAlerta: "true",
          folio: docRef.id, // Pasamos el ID alfanumérico de Firebase
          motivo: tipoIncidencia,
          recomendacion: recomendaciones,
        },
      });
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar el reporte. Revisa tu conexión a internet.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Crear reporte</Text>

        {/* Tipo de Incidencia */}
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

        {/* Título */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Título del reporte *</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe un título:"
            placeholderTextColor="#999"
            value={titulo}
            onChangeText={setTitulo}
            editable={!sending}
          />
        </View>

        {/* Descripción General */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción general *</Text>
          <TextInput
            style={styles.input}
            placeholder="Comenta que ha ocurrido:"
            placeholderTextColor="#999"
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

        {/* Ubicación */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ubicación</Text>
          <View style={styles.locationInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Obteniendo ubicación..."
              value={location}
              editable={false}
            />
            {loadingLocation && (
              <ActivityIndicator
                color={AppColors.PRIMARY}
                style={{ marginLeft: 10 }}
              />
            )}
          </View>
        </View>

        {/* Recomendaciones */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recomendaciones *</Text>
          <TextInput
            style={styles.input}
            placeholder="Instrucciones para otros conductores:"
            placeholderTextColor="#999"
            value={recomendaciones}
            onChangeText={setRecomendaciones}
            editable={!sending}
          />
        </View>

        {/* Más detalles */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Más detalles (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Algo más que deseas compartir:"
            placeholderTextColor="#999"
            value={detallesExtra}
            onChangeText={setDetallesExtra}
            editable={!sending}
          />
        </View>

        {/* Botones */}
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
            onPress={() => router.replace("/inicio")}
            disabled={sending}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- ALERTA DE ERROR LOCAL --- */}
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
