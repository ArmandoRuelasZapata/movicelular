import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebaseConfig";
import { AppColors, GlobalStyles } from "./GlobalStyles";

// Datos de reporte
interface Report {
  id: string;
  titulo?: string;
  descripcion?: string;
  ubicacion?: string;
  tipo_incidencia?: string;
  recomendaciones?: string;
  detalles_extra?: string;
  imagen?: string;
  estatus?: string;
  created_at?: { toDate: () => Date } | string;
  updated_at?: { toDate: () => Date } | string;
}

// Helper para formatear fechas de Firestore (Timestamp o string)
const formatDate = (raw?: { toDate: () => Date } | string): string => {
  if (!raw) return "--";
  const date = typeof raw === "string" ? new Date(raw) : raw.toDate();
  return date.toLocaleString("es-MX");
};

// Helper para el color del estatus
const getStatusColor = (estatus?: string): string => {
  switch (estatus?.toLowerCase()) {
    case "finalizado":
      return "#00C49A";
    case "revision":
    case "revisión":
      return "#FFC107";
    case "atencion":
    case "atención":
      return AppColors.PRIMARY;
    default:
      return "#999";
  }
};

const getStatusLabel = (estatus?: string): string => {
  switch (estatus?.toLowerCase()) {
    case "finalizado":
      return "Finalizado";
    case "revision":
    case "revisión":
      return "En Revisión";
    case "atencion":
    case "atención":
      return "En Atención";
    default:
      return "Pendiente";
  }
};

// Cuál step está activo según estatus
const getActiveStep = (estatus?: string): number => {
  switch (estatus?.toLowerCase()) {
    case "atencion":
    case "atención":
      return 1;
    case "revision":
    case "revisión":
      return 2;
    case "finalizado":
      return 3;
    default:
      return 1; // Estatus de solo "En Revisión"
  }
};

export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No se recibió un ID de reporte.");
      setLoading(false);
      return;
    }
    fetchReport();
  }, [id]);

  const fetchReport = async (): Promise<void> => {
    try {
      const docRef = doc(db, "reportes", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() } as Report);
      } else {
        setError("No se encontró el reporte.");
      }
    } catch (err) {
      console.error("Error al obtener reporte:", err);
      setError("Error de conexión al cargar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[GlobalStyles.container, { backgroundColor: AppColors.PRIMARY }]}
    >
      {/* Header */}
      <View
        style={[
          GlobalStyles.headerContainer,
          { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
        ]}
      >
        <View
          style={[
            GlobalStyles.profileHeader,
            { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/tusReportesModerador")}
            style={localStyles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={AppColors.TEXT_LIGHT}
            />
          </TouchableOpacity>
          <Text
            style={[
              GlobalStyles.textBase,
              GlobalStyles.profileName,
              { marginLeft: 10 },
            ]}
          >
            Seguimiento de reporte
          </Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={[GlobalStyles.menuContainer, GlobalStyles.menuItem]}>
        {/* Estado: cargando */}
        {loading && (
          <ActivityIndicator
            size="large"
            color={AppColors.PRIMARY}
            style={{ marginTop: 40 }}
          />
        )}

        {/* Estado: error */}
        {!loading && error && (
          <Text style={localStyles.errorText}>{error}</Text>
        )}

        {/* Estado: datos cargados */}
        {!loading && report && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* ID del reporte */}
            <Text style={[GlobalStyles.textBase, localStyles.reportIdText]}>
              Reporte: #{report.id.substring(0, 5).toUpperCase()}
            </Text>

            {/* Tarjeta de estatus */}
            <View
              style={[
                localStyles.statusBadge,
                { backgroundColor: getStatusColor(report.estatus) },
              ]}
            >
              <Text style={localStyles.statusBadgeText}>
                {getStatusLabel(report.estatus)}
              </Text>
            </View>

            {/* Detalles */}
            <View style={localStyles.detailsContainer}>
              <DetailItem label="Título:" value={report.titulo} />
              <DetailItem
                label="Tipo de incidencia:"
                value={report.tipo_incidencia?.replace(/_/g, " ")}
              />
              <DetailItem label="Ubicación:" value={report.ubicacion} />
              <DetailItem label="Descripción:" value={report.descripcion} />

              {/* Imagen */}
              {report.imagen?.trim() ? (
                <Image
                  source={{ uri: report.imagen }}
                  style={localStyles.reportImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={localStyles.noImageBox}>
                  <Ionicons name="image-outline" size={32} color="#CCC" />
                  <Text style={localStyles.noImageText}>
                    Sin evidencia fotográfica
                  </Text>
                </View>
              )}

              <DetailItem
                label="Recomendaciones:"
                value={report.recomendaciones}
              />

              {/* Detalles extra */}
              {report.detalles_extra?.trim() ? (
                <DetailItem
                  label="Más detalles:"
                  value={report.detalles_extra}
                />
              ) : null}

              <DetailItem
                label="Fecha de recepción:"
                value={formatDate(report.created_at)}
              />
              <DetailItem
                label="Última actualización:"
                value={formatDate(report.updated_at)}
              />
            </View>

            {/* Tarjeta de Estatus circular con linea de tiempo */}
            <View style={localStyles.statusCard}>
              <Text style={[GlobalStyles.textBase, localStyles.statusTitle]}>
                Estatus de Reporte
              </Text>
              <View style={localStyles.stepperContainer}>
                <View style={localStyles.progressLine} />
                <View style={localStyles.stepsRow}>
                  <StepNode
                    label="En Revisión"
                    active={getActiveStep(report.estatus) >= 1}
                  />
                  <StepNode
                    label="En Atención"
                    active={getActiveStep(report.estatus) >= 2}
                  />
                  <StepNode
                    label="Finalizado"
                    active={getActiveStep(report.estatus) >= 3}
                    color={
                      getActiveStep(report.estatus) >= 3 ? "#00C49A" : undefined
                    }
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

//Sub-componentes
interface DetailItemProps {
  label: string;
  value?: string;
}
const DetailItem = ({ label, value }: DetailItemProps) => (
  <View style={localStyles.itemBox}>
    <Text style={[GlobalStyles.textBase, localStyles.label]}>{label}</Text>
    <Text
      style={[
        GlobalStyles.textBase,
        value ? localStyles.value : localStyles.placeholder,
      ]}
    >
      {value ?? "Sin información"}
    </Text>
  </View>
);

interface StepNodeProps {
  label: string;
  active?: boolean;
  color?: string;
}
const StepNode = ({ label, active, color }: StepNodeProps) => (
  <View style={localStyles.stepItem}>
    <View
      style={[
        localStyles.circle,
        {
          backgroundColor: color ?? (active ? AppColors.PRIMARY : "#CCC"),
          borderColor: "#333",
          borderWidth: 1,
        },
      ]}
    />
    <Text style={[GlobalStyles.textBase, localStyles.stepLabel]}>{label}</Text>
  </View>
);

const localStyles = StyleSheet.create({
  backButton: { padding: 5 },
  errorText: { textAlign: "center", marginTop: 40, color: "red", fontSize: 15 },

  reportIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    textAlign: "left",
  },

  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statusBadgeText: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  detailsContainer: { marginBottom: 10 },
  itemBox: { marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: { fontSize: 15, color: "#333" },
  placeholder: { fontSize: 14, color: "#999" },

  reportImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginVertical: 10,
  },
  noImageBox: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginVertical: 10,
  },
  noImageText: { color: "#CCC", marginTop: 6, fontSize: 13 },

  statusCard: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    alignItems: "center",
    marginTop: 1,
    marginBottom: 100,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#000",
  },
  stepperContainer: {
    width: "100%",
    position: "relative",
    justifyContent: "center",
  },
  progressLine: {
    position: "absolute",
    top: 15,
    left: "10%",
    right: "10%",
    height: 1.5,
    backgroundColor: "#333",
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  stepItem: { alignItems: "center", width: "24%" },
  circle: { width: 32, height: 32, borderRadius: 16, zIndex: 2 },
  stepLabel: {
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
});
