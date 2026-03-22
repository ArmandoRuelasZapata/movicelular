import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors, GlobalStyles } from "../(tabs)/GlobalStyles";
import { db } from "../../firebaseConfig";

// ── Tipos ─────────────────────────────────────────────────────────────────────
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
  mod_valido?: boolean;
  mod_mensaje?: string;
  mod_sugiere?: string;
  mod_fecha?: { toDate: () => Date } | string;
}

// Opciones de sugerencia con su color y valor normalizado
// El valor `key` es lo que se escribe en Firestore → Laravel lo lee y lo normaliza
const SUGERENCIAS = [
  {
    key: "Atención",
    label: "Sugerir Revisión",
    color: AppColors.PRIMARY,
    textColor: "#FFF",
  },
  {
    key: "Revisión",
    label: "Sugerir Atención",
    color: "#FFC107",
    textColor: "#000",
  },
  {
    key: "Finalizado",
    label: "Sugerir Cierre",
    color: "#00C49A",
    textColor: "#FFF",
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (raw?: { toDate: () => Date } | string): string => {
  if (!raw) return "--";
  const date = typeof raw === "string" ? new Date(raw) : raw.toDate();
  return date.toLocaleString("es-MX");
};

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

const getActiveStep = (estatus?: string): number => {
  switch (estatus?.toLowerCase()) {
    case "atencion":
    case "atención":
      return 2;
    case "revision":
    case "revisión":
      return 1;
    case "finalizado":
      return 3;
    default:
      return 0;
  }
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);

  // Estado del modal de validación
  const [modalVisible, setModalVisible] = useState(false);
  const [sugerenciaSeleccionada, setSugerencia] = useState<string>("");
  const [mensajeTexto, setMensajeTexto] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!id) {
      setError("No se recibió un ID de reporte.");
      setLoading(false);
      return;
    }
    // Usamos onSnapshot para que el estado "enviado" se actualice en tiempo real
    // (cuando el admin acepta/rechaza la sugerencia, mod_valido desaparece)
    const docRef = doc(db, "reportes", id as string);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setReport({ id: snap.id, ...snap.data() } as Report);
        } else {
          setError("No se encontró el reporte.");
        }
        setLoading(false);
      },
      () => {
        setError("Error de conexión al cargar el reporte.");
        setLoading(false);
      },
    );
    return () => unsub(); // limpiar listener al desmontar
  }, [id]);

  // ── Abrir modal con la sugerencia elegida ─────────────────────────────────
  const abrirModal = (sugerencia: string) => {
    setSugerencia(sugerencia);
    setMensajeTexto("");
    setMensajeError("");
    setModalVisible(true);
    // Pequeño delay para que el modal esté montado antes de enfocar
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // ── Enviar sugerencia a Firestore ─────────────────────────────────────────
  const enviarSugerencia = async () => {
    if (!mensajeTexto.trim()) {
      setMensajeError("Debes escribir un motivo antes de enviar.");
      return;
    }
    if (!report) return;

    try {
      setUpdating(true);
      setModalVisible(false);
      const docRef = doc(db, "reportes", report.id);
      await updateDoc(docRef, {
        mod_valido: true,
        mod_mensaje: mensajeTexto.trim(),
        mod_sugiere: sugerenciaSeleccionada, // "Revisión" | "Atención" | "Finalizado"
        mod_fecha: serverTimestamp(),
      });
      Alert.alert(
        "✓ Informe enviado",
        `El administrador ha sido notificado con tu propuesta de cambio a "${sugerenciaSeleccionada}".`,
      );
    } catch {
      Alert.alert(
        "Error",
        "No se pudo enviar la información. Intenta de nuevo.",
      );
    } finally {
      setUpdating(false);
    }
  };

  // ── Cancelar sugerencia enviada ───────────────────────────────────────────
  const cancelarSugerencia = async () => {
    if (!report) return;
    Alert.alert(
      "Cancelar propuesta",
      "¿Deseas retirar la sugerencia enviada al administrador?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, retirar",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdating(true);
              const docRef = doc(db, "reportes", report.id);
              await updateDoc(docRef, {
                mod_valido: deleteField(),
                mod_mensaje: deleteField(),
                mod_sugiere: deleteField(),
                mod_fecha: deleteField(),
              });
            } catch {
              Alert.alert("Error", "No se pudo retirar la sugerencia.");
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
            onPress={() => router.push("/(tabs)/ValidationScreen")}
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
        {loading && (
          <ActivityIndicator
            size="large"
            color={AppColors.PRIMARY}
            style={{ marginTop: 40 }}
          />
        )}
        {!loading && error && (
          <Text style={localStyles.errorText}>{error}</Text>
        )}

        {!loading && report && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* ID + Badge estatus */}
            <Text style={[GlobalStyles.textBase, localStyles.reportIdText]}>
              Reporte: #{report.id.substring(0, 5).toUpperCase()}
            </Text>
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

            {/* Datos del reporte */}
            <View style={localStyles.detailsContainer}>
              <DetailItem label="Título:" value={report.titulo} />
              <DetailItem
                label="Tipo de incidencia:"
                value={report.tipo_incidencia?.replace(/_/g, " ")}
              />
              <DetailItem label="Ubicación:" value={report.ubicacion} />
              <DetailItem label="Descripción:" value={report.descripcion} />

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

            {/* Stepper de estatus */}
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

              {/* ── SECCIÓN MODERADOR ── */}
              <View style={localStyles.moderatorSection}>
                <Text style={localStyles.moderatorTitle}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={13}
                    color="#666"
                  />{" "}
                  INFORMAR CAMBIO AL ADMINISTRADOR
                </Text>

                {updating ? (
                  <ActivityIndicator
                    size="small"
                    color={AppColors.PRIMARY}
                    style={{ marginTop: 10 }}
                  />
                ) : report.mod_valido ? (
                  /* Estado: sugerencia ya enviada, esperando respuesta del admin */
                  <View style={localStyles.sentBox}>
                    <View style={localStyles.sentHeader}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#059669"
                      />
                      <Text style={localStyles.sentTitle}>
                        Propuesta enviada al administrador
                      </Text>
                    </View>
                    <Text style={localStyles.sentDetail}>
                      Cambio sugerido:{" "}
                      <Text style={localStyles.sentBold}>
                        "{report.mod_sugiere}"
                      </Text>
                    </Text>
                    <Text style={localStyles.sentDetail} numberOfLines={2}>
                      Mensaje:{" "}
                      <Text style={localStyles.sentItalic}>
                        "{report.mod_mensaje}"
                      </Text>
                    </Text>
                    <Text style={localStyles.sentWaiting}>
                      ⏳ Esperando acción del administrador...
                    </Text>
                    <TouchableOpacity
                      style={localStyles.cancelBtn}
                      onPress={cancelarSugerencia}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={15}
                        color="#DC2626"
                      />
                      <Text style={localStyles.cancelBtnText}>
                        Retirar propuesta
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Estado: sin sugerencia enviada → mostrar botones */
                  <View style={localStyles.modButtonsRow}>
                    {SUGERENCIAS.map((s) => (
                      <TouchableOpacity
                        key={s.key}
                        style={[
                          localStyles.modBtn,
                          { backgroundColor: s.color },
                        ]}
                        onPress={() => abrirModal(s.key)}
                      >
                        <Text
                          style={[
                            localStyles.modBtnText,
                            { color: s.textColor },
                          ]}
                        >
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* ── MODAL DE VALIDACIÓN ──────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={localStyles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            {/* Evitar que el tap dentro del modal lo cierre */}
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={localStyles.modalCard}>
                {/* Header del modal */}
                <View style={localStyles.modalHeader}>
                  <Ionicons
                    name="shield-checkmark"
                    size={22}
                    color={AppColors.PRIMARY}
                  />
                  <Text style={localStyles.modalTitle}>
                    Informe al Administrador
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close" size={22} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Pill de sugerencia seleccionada */}
                <View style={localStyles.modalPillRow}>
                  <Text style={localStyles.modalPillLabel}>
                    Cambio sugerido:
                  </Text>
                  <View
                    style={[
                      localStyles.modalPill,
                      {
                        backgroundColor:
                          SUGERENCIAS.find(
                            (s) => s.key === sugerenciaSeleccionada,
                          )?.color ?? "#999",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        localStyles.modalPillText,
                        {
                          color:
                            SUGERENCIAS.find(
                              (s) => s.key === sugerenciaSeleccionada,
                            )?.textColor ?? "#FFF",
                        },
                      ]}
                    >
                      {sugerenciaSeleccionada}
                    </Text>
                  </View>
                </View>

                {/* Campo de texto */}
                <Text style={localStyles.modalInputLabel}>
                  Motivo / observación del moderador{" "}
                  <Text style={{ color: "#DC2626" }}>*</Text>
                </Text>
                <TextInput
                  ref={inputRef}
                  style={[
                    localStyles.modalInput,
                    mensajeError ? localStyles.modalInputError : null,
                  ]}
                  placeholder={`¿Por qué sugieres pasar a "${sugerenciaSeleccionada}"?`}
                  placeholderTextColor="#AAA"
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                  value={mensajeTexto}
                  onChangeText={(t) => {
                    setMensajeTexto(t);
                    setMensajeError("");
                  }}
                  returnKeyType="done"
                />
                {mensajeError ? (
                  <Text style={localStyles.modalErrorText}>
                    <Ionicons name="alert-circle-outline" size={12} />{" "}
                    {mensajeError}
                  </Text>
                ) : null}
                <Text style={localStyles.charCount}>
                  {mensajeTexto.length}/300
                </Text>

                {/* Botones */}
                <View style={localStyles.modalBtnsRow}>
                  <TouchableOpacity
                    style={[localStyles.modalBtn, localStyles.modalBtnCancel]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={localStyles.modalBtnCancelText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[localStyles.modalBtn, localStyles.modalBtnSend]}
                    onPress={enviarSugerencia}
                  >
                    <Ionicons name="send" size={15} color="#FFF" />
                    <Text style={localStyles.modalBtnSendText}>
                      Enviar Informe
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
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

// ── Estilos ───────────────────────────────────────────────────────────────────
const localStyles = StyleSheet.create({
  backButton: { padding: 5 },
  errorText: { textAlign: "center", marginTop: 40, color: "red", fontSize: 15 },
  reportIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
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
    color: "#000",
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

  // Stepper
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

  // Sección moderador
  moderatorSection: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 20,
  },
  moderatorTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 15,
  },
  modButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modBtn: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    width: "31%",
    alignItems: "center",
  },
  modBtnText: { fontWeight: "bold", fontSize: 10 },

  // Estado: sugerencia enviada
  sentBox: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 12,
    padding: 16,
  },
  sentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sentTitle: { fontSize: 13, fontWeight: "bold", color: "#15803D", flex: 1 },
  sentDetail: { fontSize: 13, color: "#374151", marginBottom: 4 },
  sentBold: { fontWeight: "bold" },
  sentItalic: { fontStyle: "italic" },
  sentWaiting: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 12,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#DC2626",
  },
  cancelBtnText: { fontSize: 12, color: "#DC2626", fontWeight: "bold" },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: "#111", flex: 1 },
  modalPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  modalPillLabel: { fontSize: 13, color: "#555", fontWeight: "600" },
  modalPill: { paddingVertical: 4, paddingHorizontal: 14, borderRadius: 99 },
  modalPillText: { fontSize: 13, fontWeight: "bold" },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111",
    textAlignVertical: "top",
    minHeight: 110,
    backgroundColor: "#FAFAFA",
  },
  modalInputError: { borderColor: "#DC2626" },
  modalErrorText: { fontSize: 12, color: "#DC2626", marginTop: 5 },
  charCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 16,
  },
  modalBtnsRow: { flexDirection: "row", gap: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  modalBtnCancel: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  modalBtnCancelText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  modalBtnSend: { backgroundColor: AppColors.PRIMARY },
  modalBtnSendText: { fontSize: 14, fontWeight: "bold", color: "#FFF" },
});
