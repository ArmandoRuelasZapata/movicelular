import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { dbSoporte } from "../../firebaseConfigSoporte";
import { auth, db } from "../../firebaseConfigUsuarios";

interface Guia {
  id: string;
  titulo: string;
  contenido: string;
}

export default function SoporteScreen() {
  const router = useRouter();
  const [guias, setGuias] = useState<Guia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [moderatorName, setModeratorName] = useState("Moderador");
  const [modalVisible, setModalVisible] = useState(false);
  const [guiaSeleccionada, setGuiaSeleccionada] = useState<Guia | null>(null);

  useEffect(() => {
    const fetchModData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const modDoc = await getDoc(doc(db, "moderadores", user.uid));
          if (modDoc.exists()) {
            setModeratorName(modDoc.data().nombre || "Moderador");
          }
        } catch (error) {
          console.log("Error al obtener perfil local");
        }
      }
    };
    fetchModData();
  }, []);

  const fetchGuias = async () => {
    try {
      setLoading(true);
      const guiasRef = collection(dbSoporte, "guias_soporte");
      const q = query(guiasRef, orderBy("fecha_creacion", "desc"));
      const querySnapshot = await getDocs(q);

      const lista: Guia[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        titulo: doc.data().titulo || "Sin título",
        contenido: doc.data().contenido || "Sin contenido",
      }));

      setGuias(lista);
    } catch (error: any) {
      console.error("Error en asistencia-movidgo:", error);
      Alert.alert("Error", "No se pudieron cargar las guías de soporte.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuias();
  }, []);

  const resultadosFiltrados = guias.filter((item) =>
    item.titulo?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/moderatorMenu")}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Soporte</Text>
        </View>
      </SafeAreaView>

      {/* CONTENIDO */}
      <View style={styles.whiteCard}>
        <View style={styles.centerContent}>
          <Text style={styles.welcomeText}>Hola, {moderatorName}</Text>
          <Text style={styles.subText}>Centro de ayuda de MovidGo</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Buscar en guías..."
              style={styles.input}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </View>

        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              Sincronizando...
            </Text>
          </View>
        ) : (
          <FlatList
            data={resultadosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setGuiaSeleccionada(item);
                  setModalVisible(true);
                }}
              >
                <FontAwesome name="file-text" size={22} color="#008080" />
                <Text style={styles.listText}>{item.titulo}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay guías disponibles.</Text>
            }
            onRefresh={fetchGuias}
            refreshing={loading}
          />
        )}
      </View>

      {/* MODAL DE LECTURA */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ alignSelf: "flex-end" }}
            >
              <Ionicons name="close-circle" size={35} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{guiaSeleccionada?.titulo}</Text>
            <ScrollView>
              <Text style={styles.modalBody}>
                {guiaSeleccionada?.contenido}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#008080",
  },
  headerSafeArea: {
    backgroundColor: "#008080",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
  },
  centerContent: { alignItems: "center", marginBottom: 15 },
  welcomeText: { fontSize: 18, fontWeight: "bold" },
  subText: { fontSize: 14, color: "#666", marginBottom: 15 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    width: "100%",
    height: 45,
  },
  input: { flex: 1, marginLeft: 10 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  listText: {
    marginLeft: 15,
    fontSize: 15,
    flex: 1,
    color: "#333",
    fontWeight: "500",
  },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    maxHeight: "70%",
    elevation: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#008080",
  },
  modalBody: { fontSize: 16, lineHeight: 25, color: "#444" },
});
