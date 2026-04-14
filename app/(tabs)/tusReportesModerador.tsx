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

import { AppColors, GlobalStyles } from "./GlobalStyles";

interface Report {
  id: string;
  titulo?: string;
  uid?: string;
  estado?: string;
  created_at?: { toDate: () => Date } | string | null;
  [key: string]: unknown;
}

const toDate = (raw?: { toDate: () => Date } | string | null): Date => {
  if (!raw) return new Date(0);
  if (typeof raw === "string") return new Date(raw);
  return raw.toDate();
};

export default function MyReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sinSesion, setSinSesion] = useState<boolean>(false);

  const fetchReports = async (): Promise<void> => {
    setLoading(true);

    const user = auth.currentUser;

    if (!user) {
      setSinSesion(true);
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "reportes"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const reportsList: Report[] = querySnapshot.docs
        .filter((doc) => doc.data().estado !== "desactivado") // Ocultar reportes desactivados por el admin
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Report, "id">),
        }));

      reportsList.sort(
        (a, b) =>
          toDate(b.created_at).getTime() - toDate(a.created_at).getTime(),
      );

      setReports(reportsList);
    } catch (error) {
      console.error("Error al obtener reportes del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <View style={GlobalStyles.container}>
      {/* HEADER con SafeAreaView solo arriba */}
      <SafeAreaView edges={["top"]} style={GlobalStyles.headerContainer}>
        <View style={localStyles.headerContent}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/moderatorMenu")}
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
            Tus Reportes
          </Text>
        </View>
      </SafeAreaView>

      {/* CONTENIDO */}
      <View style={[GlobalStyles.menuContainer, { flex: 1 }]}>
        {sinSesion && (
          <Text style={localStyles.emptyText}>
            Debes iniciar sesión para ver tus reportes.
          </Text>
        )}

        {loading && (
          <ActivityIndicator
            size="large"
            color={AppColors.PRIMARY}
            style={{ marginTop: 20 }}
          />
        )}

        {!loading && !sinSesion && (
          <FlatList<Report>
            data={reports}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const isLast = index === reports.length - 1;
              return (
                <TouchableOpacity
                  style={[
                    GlobalStyles.menuItem,
                    isLast && GlobalStyles.menuItemLast,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/seguimientoModeradorNormal",
                      params: { id: item.id },
                    })
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={AppColors.PRIMARY}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={[GlobalStyles.textBase, GlobalStyles.menuItemText]}
                    >
                      {item.titulo ?? `Reporte ${item.id.substring(0, 5)}`}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={AppColors.ICON_SEARCH}
                  />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={localStyles.emptyText}>
                Aún no has creado ningún reporte.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  backButton: { padding: 5 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
});
