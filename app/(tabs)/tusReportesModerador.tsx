import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
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
import { db } from "../../firebaseConfig"; //datos de base de datos firebase reportes
import { AppColors, GlobalStyles } from "./GlobalStyles";

// --- TIPOS ---
interface Report {
  id: string;
  title?: string;
  [key: string]: unknown;
}

export default function MyReportsScreen() {
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReports = async (): Promise<void> => {
    try {
      const querySnapshot = await getDocs(collection(db, "reportes"));

      const reportsList: Report[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Report, "id">),
      }));

      setReports(reportsList);
    } catch (error) {
      console.error("Error al obtener reportes: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={GlobalStyles.headerContainer}>
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
            Tus reportes
          </Text>
        </View>
      </View>

      <View style={[GlobalStyles.menuContainer, { flex: 1 }]}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={AppColors.PRIMARY}
            style={{ marginTop: 20 }}
          />
        ) : (
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
                      pathname: "/seguimientoModeradorNormal",
                      params: { id: item.id },
                    })
                  }
                >
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={AppColors.PRIMARY}
                  />
                  <Text
                    style={[
                      GlobalStyles.textBase,
                      GlobalStyles.menuItemText,
                      { flex: 1 },
                    ]}
                  >
                    {item.title ?? `Reporte ${item.id.substring(0, 5)}`}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={AppColors.ICON_SEARCH}
                  />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "gray" }}
              >
                No hay reportes disponibles.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
});
