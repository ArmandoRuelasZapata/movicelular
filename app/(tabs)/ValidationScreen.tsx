import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../firebaseConfig";

import { auth } from "../../firebaseConfigUsuarios";

import { AppColors, GlobalStyles } from "../(tabs)/GlobalStyles";

interface ReportPreview {
  id: string;
  titulo?: string;
  estatus?: string;
  estado?: string;
  moderador_asignado_uid?: string;
  created_at?: { toDate: () => Date } | string | null;
}

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

const formatDate = (raw?: { toDate: () => Date } | string | null): string => {
  if (!raw) return "--";
  const date = typeof raw === "string" ? new Date(raw) : raw.toDate();
  return date.toLocaleDateString("es-MX");
};

const toDate = (raw?: { toDate: () => Date } | string | null): Date => {
  if (!raw) return new Date(0);
  if (typeof raw === "string") return new Date(raw);
  return raw.toDate();
};

export default function ValidationScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sinSesion, setSinSesion] = useState(false);

  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const fetchAssignedReports = async () => {
    setLoading(true);

    const user = auth.currentUser;

    if (!user) {
      setSinSesion(true);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "reportes"),
        where("moderador_asignado_uid", "==", user.uid),
      );
      const querySnapshot = await getDocs(q);

      const loadedReports: ReportPreview[] = querySnapshot.docs
        .filter((doc) => doc.data().estado !== "desactivado") // Ocultar reportes desactivados por el admin
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ReportPreview, "id">),
        }));

      loadedReports.sort(
        (a, b) =>
          toDate(b.created_at).getTime() - toDate(a.created_at).getTime(),
      );

      setReports(loadedReports);
    } catch (error) {
      console.error("Error al cargar reportes asignados:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ReportPreview }) => (
    <TouchableOpacity
      style={localStyles.card}
      onPress={() =>
        router.push({
          pathname: "./seguimientoModerador",
          params: { id: item.id },
        })
      }
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
        <View
          style={[
            localStyles.statusBadge,
            { backgroundColor: getStatusColor(item.estatus) },
          ]}
        >
          <Text style={localStyles.statusText}>
            {getStatusLabel(item.estatus)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[GlobalStyles.container, { backgroundColor: AppColors.PRIMARY }]}
    >
      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={GlobalStyles.headerContainer}>
        <View style={GlobalStyles.profileHeader}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/moderatorMenu")}
            style={{ padding: 5 }}
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
            Validación de Reportes
          </Text>
        </View>
      </SafeAreaView>

      {/* CONTENIDO */}
      <View style={localStyles.whiteContainer}>
        {sinSesion && (
          <Text style={localStyles.emptyText}>
            Debes iniciar sesión para ver tus reportes asignados.
          </Text>
        )}

        {loading && (
          <ActivityIndicator
            size="large"
            color={AppColors.PRIMARY}
            style={{ marginTop: 50 }}
          />
        )}

        {!loading && !sinSesion && (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={localStyles.listContainer}
            ListEmptyComponent={
              <View style={localStyles.emptyContainer}>
                <Ionicons
                  name="clipboard-outline"
                  size={48}
                  color="#CCC"
                  style={{ marginBottom: 12 }}
                />
                <Text style={localStyles.emptyText}>
                  No tienes reportes asignados aún.
                </Text>
                <Text style={localStyles.emptySubText}>
                  El administrador te asignará reportes desde el panel web.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
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
    elevation: 2,
    shadowColor: "#000",
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
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptySubText: {
    textAlign: "center",
    color: "#BBB",
    fontSize: 13,
    marginTop: 6,
  },
});
