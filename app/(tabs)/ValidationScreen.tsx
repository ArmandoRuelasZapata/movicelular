import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebaseConfig"; // Ajusta esta ruta a tu config de Firebase
import { AppColors, GlobalStyles } from "../(tabs)/GlobalStyles"; // Ajusta esta ruta

// Interfaz básica para la lista
interface ReportPreview {
  id: string;
  titulo?: string;
  estatus?: string;
  created_at?: { toDate: () => Date } | string;
}

// Helpers visuales (Mismos que usaste en tu TrackingScreen para consistencia)
const getStatusColor = (estatus?: string): string => {
  switch (estatus?.toLowerCase()) {
    case "finalizado": return "#00C49A";
    case "revision":
    case "revisión": return "#FFC107";
    case "atencion":
    case "atención": return AppColors.PRIMARY;
    default: return "#999";
  }
};

const getStatusLabel = (estatus?: string): string => {
  switch (estatus?.toLowerCase()) {
    case "finalizado": return "Finalizado";
    case "revision":
    case "revisión": return "En Revisión";
    case "atencion":
    case "atención": return "En Atención";
    default: return "Pendiente";
  }
};

const formatDate = (raw?: { toDate: () => Date } | string): string => {
  if (!raw) return "--";
  const date = typeof raw === "string" ? new Date(raw) : raw.toDate();
  return date.toLocaleDateString("es-MX"); // Solo fecha para la lista
};

export default function ValidationScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      // Obtenemos todos los reportes, ordenados por fecha de creación (los más nuevos primero)
      // Nota: Si no tienes índice en Firebase para 'created_at', quita el orderBy temporalmente.
      const q = query(collection(db, "reportes"), orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);
      
      const loadedReports: ReportPreview[] = [];
      querySnapshot.forEach((doc) => {
        loadedReports.push({ id: doc.id, ...doc.data() } as ReportPreview);
      });
      
      setReports(loadedReports);
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ReportPreview }) => (
    <TouchableOpacity
      style={localStyles.card}
      // AQUÍ ES LA CONEXIÓN MÁGICA AL TRACKING SCREEN:
      // Pasamos el ID del reporte a tu pantalla TrackingScreen
      onPress={() => router.push({ pathname: "./seguimientoModerador", params: { id: item.id } })}
    >
      <View style={localStyles.cardHeader}>
        <Text style={localStyles.reportId}>
          #{item.id.substring(0, 5).toUpperCase()}
        </Text>
        <Text style={localStyles.dateText}>{formatDate(item.created_at)}</Text>
      </View>

      <Text style={localStyles.title} numberOfLines={1}>
        {item.titulo || "Sin título"}
      </Text>

      <View style={localStyles.cardFooter}>
        <View style={[localStyles.statusBadge, { backgroundColor: getStatusColor(item.estatus) }]}>
          <Text style={localStyles.statusText}>{getStatusLabel(item.estatus)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[GlobalStyles.container, { backgroundColor: AppColors.PRIMARY }]}>
      {/* Header Teal */}
      <View style={[GlobalStyles.headerContainer, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
        <View style={[GlobalStyles.profileHeader, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
          <TouchableOpacity 
      onPress={() => router.replace("/(tabs)/moderatorMenu")} 
      style={{ padding: 5 }}
    >
            <Ionicons name="arrow-back" size={24} color={AppColors.TEXT_LIGHT} />
          </TouchableOpacity>
          <Text style={[GlobalStyles.textBase, GlobalStyles.profileName, { marginLeft: 10 }]}>
            Validación de Reportes
          </Text>
        </View>
      </View>

      {/* Contenedor Blanco Inferior */}
      <View style={localStyles.whiteContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={AppColors.PRIMARY} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={localStyles.listContainer}
            ListEmptyComponent={
              <Text style={localStyles.emptyText}>No hay reportes para validar.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  whiteContainer: {
    flex: 1,
    backgroundColor: AppColors.BACKGROUND,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
    paddingTop: 10,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
    fontSize: 16,
  },
});