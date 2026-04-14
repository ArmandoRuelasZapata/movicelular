import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors, GlobalStyles } from "./GlobalStyles";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { dbMapa } from "../../firebaseConfigMapa";

// 🔥 MAPBOX
import Mapbox from "@rnmapbox/maps";
Mapbox.setAccessToken(
  "pk.eyJ1IjoiYXJtYW5kb3J1ZWxhcyIsImEiOiJjbW42bDdhdWwwNmdmMnBwejl1cHJ3eG1zIn0.1uFnU-q94BV18RHjLQvDpw",
);

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ReportePublico {
  id: string;
  titulo?: string;
  descripcion?: string;
  tipo_incidencia?: string;
  foto_url?: string;
  latitude: number;
  longitude: number;
}

// ─── Configuración Visual por Tipo ──────────────────────────────────────────
const TIPO_CONFIG: Record<
  string,
  {
    bgColor: string;
    ringColor: string;
    iconName: string;
    iconSet: "MaterialCommunityIcons" | "Ionicons" | "FontAwesome5";
    label: string;
  }
> = {
  choque: {
    bgColor: "#E53935",
    ringColor: "rgba(229,57,53,0.30)",
    iconName: "car",
    iconSet: "FontAwesome5",
    label: "Choque",
  },
  bloqueo: {
    bgColor: "#F4511E",
    ringColor: "rgba(244,81,30,0.30)",
    iconName: "road-variant",
    iconSet: "MaterialCommunityIcons",
    label: "Bloqueo",
  },
  bache: {
    bgColor: "#8D6E63",
    ringColor: "rgba(141,110,99,0.30)",
    iconName: "alert-circle",
    iconSet: "Ionicons",
    label: "Bache",
  },
};

const getTipoConfig = (tipo?: string) =>
  TIPO_CONFIG[(tipo || "").toLowerCase()] ?? {
    bgColor: "#607D8B",
    ringColor: "rgba(96,125,139,0.30)",
    iconName: "map-marker",
    iconSet: "MaterialCommunityIcons" as const,
    label: "General",
  };

// ─── Marcador Circular ───────────────────────────────────────────────────────
const CustomMarker = ({
  tipo,
  size = "normal",
}: {
  tipo?: string;
  size?: "normal" | "mini";
}) => {
  const cfg = getTipoConfig(tipo);
  const isMini = size === "mini";
  const iconSize = isMini ? 9 : 18;

  const renderIcon = () => {
    switch (cfg.iconSet) {
      case "FontAwesome5":
        return (
          <FontAwesome5
            name={cfg.iconName as any}
            size={iconSize}
            color="#FFF"
          />
        );
      case "MaterialCommunityIcons":
        return (
          <MaterialCommunityIcons
            name={cfg.iconName as any}
            size={iconSize}
            color="#FFF"
          />
        );
      case "Ionicons":
        return (
          <Ionicons name={cfg.iconName as any} size={iconSize} color="#FFF" />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        markerStyles.ring,
        { backgroundColor: cfg.ringColor, borderColor: cfg.bgColor },
        isMini && markerStyles.ringMini,
      ]}
    >
      <View
        style={[
          markerStyles.circle,
          { backgroundColor: cfg.bgColor },
          isMini && markerStyles.circleMini,
        ]}
      >
        {renderIcon()}
      </View>
    </View>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
const MapScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [targetLocation, setTargetLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reportesPublicos, setReportesPublicos] = useState<ReportePublico[]>(
    [],
  );
  const [reporteSeleccionado, setReporteSeleccionado] =
    useState<ReportePublico | null>(null);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  }, []);

  useEffect(() => {
    if (params.mostrarAlerta === "true") setShowSuccess(true);
  }, [params]);

  const cerrarAlertaExito = () => {
    setShowSuccess(false);
    router.setParams({
      mostrarAlerta: undefined,
      folio: undefined,
      motivo: undefined,
    });
  };

  useEffect(() => {
    const q = query(
      collection(dbMapa, "reportes_publicos"),
      where("favorito", "==", true),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ReportePublico[] = [];
      snapshot.forEach((docSnap) => {
        const r = docSnap.data();

        // ── Ocultar reportes desactivados por el admin ──
        if (r.estado === "desactivado") return;

        const lat = r.latitude ?? r.ubicacion?.latitude;
        const lng = r.longitude ?? r.ubicacion?.longitude;
        if (typeof lat === "number" && typeof lng === "number") {
          data.push({
            id: docSnap.id,
            titulo: r.titulo,
            descripcion: r.descripcion,
            tipo_incidencia: r.tipo_incidencia,
            foto_url: r.foto_url ?? r.imagen_url ?? r.imagen,
            latitude: lat,
            longitude: lng,
          });
        }
      });
      setReportesPublicos(data);
    });
    return () => unsubscribe();
  }, []);

  // ── Búsqueda con Nominatim ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery + ", Durango, Mexico",
      )}&format=json&limit=1`;

      const res = await fetch(url, {
        headers: {
          "Accept-Language": "es",
          "User-Agent": "MoviDGO/1.0 (com.movidgo.app)",
        },
      });

      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        cameraRef.current?.flyTo([lon, lat], 1500);
        setTargetLocation({ latitude: lat, longitude: lon });
      } else {
        Alert.alert("Sin resultados", "No se encontró el lugar buscado.");
      }
    } catch (e) {
      Alert.alert("Error", "Verifica tu conexión a internet.");
    }
  };

  const cfgSeleccionado = reporteSeleccionado
    ? getTipoConfig(reporteSeleccionado.tipo_incidencia)
    : null;

  const renderPopupIcon = () => {
    if (!cfgSeleccionado) return null;
    const iconSize = 14;
    switch (cfgSeleccionado.iconSet) {
      case "FontAwesome5":
        return (
          <FontAwesome5
            name={cfgSeleccionado.iconName as any}
            size={iconSize}
            color="#FFF"
          />
        );
      case "MaterialCommunityIcons":
        return (
          <MaterialCommunityIcons
            name={cfgSeleccionado.iconName as any}
            size={iconSize}
            color="#FFF"
          />
        );
      case "Ionicons":
        return (
          <Ionicons
            name={cfgSeleccionado.iconName as any}
            size={iconSize}
            color="#FFF"
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={GlobalStyles.container}>
      {/* BARRA DE BÚSQUEDA */}
      <SafeAreaView edges={["top"]} style={GlobalStyles.headerContainer}>
        <View style={localStyles.searchBar}>
          <TouchableOpacity onPress={handleSearch}>
            <MaterialIcons
              name="search"
              size={24}
              color={AppColors.ICON_SEARCH}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Buscar en Durango..."
            placeholderTextColor="#999"
            style={localStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </SafeAreaView>

      {/* MAPA MAPBOX */}
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
        onPress={() => setReporteSeleccionado(null)}
      >
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={[-104.6531, 24.0277]}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {targetLocation && (
          <Mapbox.PointAnnotation
            id="target"
            coordinate={[targetLocation.longitude, targetLocation.latitude]}
          >
            <View collapsable={false}>
              <Ionicons name="location" size={32} color={AppColors.PRIMARY} />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {reportesPublicos.map((reporte) => (
          <Mapbox.PointAnnotation
            key={reporte.id}
            id={reporte.id}
            coordinate={[reporte.longitude, reporte.latitude]}
            onSelected={() => setReporteSeleccionado(reporte)}
          >
            <View collapsable={false}>
              <CustomMarker tipo={reporte.tipo_incidencia} />
            </View>
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* POPUP FLOTANTE */}
      {reporteSeleccionado && cfgSeleccionado && (
        <View style={localStyles.popupContainer} pointerEvents="box-none">
          <View
            style={[
              localStyles.popupCard,
              { borderTopColor: cfgSeleccionado.bgColor, borderTopWidth: 5 },
            ]}
          >
            <TouchableOpacity
              style={localStyles.popupClose}
              onPress={() => setReporteSeleccionado(null)}
            >
              <Ionicons name="close" size={18} color="#555" />
            </TouchableOpacity>

            <View style={localStyles.popupHeader}>
              <View
                style={[
                  localStyles.popupBadge,
                  { backgroundColor: cfgSeleccionado.bgColor },
                ]}
              >
                {renderPopupIcon()}
                <Text style={localStyles.popupBadgeText}>
                  {cfgSeleccionado.label}
                </Text>
              </View>
              <Text style={localStyles.popupId}>
                #{reporteSeleccionado.id.substring(0, 5).toUpperCase()}
              </Text>
            </View>

            <Text style={localStyles.popupTitle}>
              {reporteSeleccionado.titulo || "Incidencia"}
            </Text>

            <View style={localStyles.popupBody}>
              <View style={{ flex: 1 }}>
                <Text style={localStyles.popupLabel}>Descripción:</Text>
                <Text style={localStyles.popupDesc} numberOfLines={4}>
                  {reporteSeleccionado.descripcion || "Sin descripción."}
                </Text>
              </View>
              {reporteSeleccionado.foto_url ? (
                <Image
                  source={{ uri: reporteSeleccionado.foto_url }}
                  style={localStyles.popupImage}
                />
              ) : (
                <View style={localStyles.popupNoImage}>
                  <Ionicons name="image-outline" size={30} color="#CCC" />
                </View>
              )}
            </View>
            <View
              style={[localStyles.popupArrow, { borderTopColor: "#FFF" }]}
            />
          </View>
        </View>
      )}

      {/* SIMBOLOGÍA */}
      {!reporteSeleccionado && (
        <View style={localStyles.legend}>
          <Text style={localStyles.legendTitle}>Incidencias</Text>
          {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
            <View key={key} style={localStyles.legendRow}>
              <CustomMarker tipo={key} size="mini" />
              <Text style={localStyles.legendLabel}>{cfg.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* NAV BAR */}
      <View style={GlobalStyles.bottomNav}>
        <TouchableOpacity
          style={GlobalStyles.navItem}
          onPress={() => router.push("/inicio")}
        >
          <Ionicons name="home" size={28} color={AppColors.TEXT_LIGHT} />
          <Text style={GlobalStyles.navText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={localStyles.navItemCenter}
          onPress={() => router.push("/report")}
        >
          <View style={localStyles.centerOuterCircle}>
            <View style={localStyles.centerInnerCircle}>
              <Ionicons name="add" size={30} color={AppColors.PRIMARY} />
            </View>
          </View>
          <Text style={GlobalStyles.navText}>Crear Reporte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={GlobalStyles.navItem}
          onPress={() => router.push("/explore")}
        >
          <View style={GlobalStyles.accountCircle}>
            <Ionicons name="person" size={24} color={AppColors.PRIMARY} />
          </View>
          <Text style={GlobalStyles.navText}>Cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE ÉXITO */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalBox}>
            <Text style={localStyles.modalTitle}>
              Se ha generado el reporte
            </Text>
            <Text style={localStyles.modalBoldLabel}>Motivo:</Text>
            <Text style={localStyles.modalValue}>{params.motivo}</Text>
            <Text style={localStyles.modalBoldLabel}>Folio:</Text>
            <Text style={localStyles.modalValue}>{params.folio}</Text>
            <TouchableOpacity
              style={localStyles.btnAceptarSuccess}
              onPress={cerrarAlertaExito}
            >
              <Text style={localStyles.btnAceptarText}>aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const markerStyles = StyleSheet.create({
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  ringMini: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5 },
  circleMini: { width: 18, height: 18, borderRadius: 9 },
});

const localStyles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 12,
    height: 46,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  // Popup
  popupContainer: {
    position: "absolute",
    top: 80,
    left: 15,
    right: 15,
    zIndex: 100,
  },
  popupCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  popupClose: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    padding: 4,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingRight: 30,
  },
  popupBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popupBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  popupId: { fontSize: 10, color: "#999" },
  popupTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  popupBody: { flexDirection: "row", gap: 10 },
  popupLabel: { fontSize: 11, color: "#777", fontWeight: "bold" },
  popupDesc: { fontSize: 13, color: "#444" },
  popupImage: { width: 80, height: 80, borderRadius: 10 },
  popupNoImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  popupArrow: {
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: 10,
  },

  // Simbología
  legend: {
    position: "absolute",
    bottom: 100,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    padding: 10,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  legendLabel: { fontSize: 12, color: "#333", fontWeight: "600" },

  // Nav Bar
  navItemCenter: { flex: 1, alignItems: "center", marginTop: -25 },
  centerOuterCircle: {
    backgroundColor: AppColors.PRIMARY,
    padding: 2,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  centerInnerCircle: {
    backgroundColor: "#FFF",
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal éxito
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
  btnAceptarSuccess: {
    backgroundColor: "#43BB7E",
    paddingVertical: 8,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  btnAceptarText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});

export default MapScreen;
