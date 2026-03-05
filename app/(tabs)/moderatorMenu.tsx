import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { AppColors, GlobalStyles } from "../(tabs)/GlobalStyles";

// Firebase
import { deleteUser, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// Importamos auth y db (storage ya no es necesario aquí)
import { auth, db } from "../../firebaseConfigUsuarios";

interface MenuItem {
  id: number;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: string;
  action?: "logout" | "delete";
}

const ABOUT_MESSAGE =
  "En esta aplicación, nuestra misión es mejorar la seguridad y eficiencia vial proporcionando información actualizada sobre el estado de las vías. Facilitamos a la ciudadanía el acceso a datos relevantes y la posibilidad de reportar incidencias en tiempo real.";

const MenuModerator: React.FC = () => {
  const router = useRouter();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [moderatorName, setModeratorName] = useState("Moderador");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchModData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const modDoc = await getDoc(doc(db, "moderadores", user.uid));
          if (modDoc.exists()) {
            setModeratorName(modDoc.data().nombre || "Moderador");
            // Aquí cargamos el string Base64 guardado en Firestore
            if (modDoc.data().photoURL) {
              setProfileImage(modDoc.data().photoURL);
            }
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
        }
      }
    };
    fetchModData();
  }, []);

  // --- NUEVA FUNCIÓN PARA GUARDAR EN FIRESTORE (SIN STORAGE) ---
  const saveImageBase64 = async (base64Data: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setUploading(true);
    try {
      const fullBase64 = `data:image/jpeg;base64,${base64Data}`;

      // Actualizamos el campo string en el documento del moderador
      await updateDoc(doc(db, "moderadores", user.uid), {
        photoURL: fullBase64,
      });

      setProfileImage(fullBase64);
      Alert.alert("Éxito", "Tu foto de perfil ha sido actualizada.");
    } catch (error) {
      console.error("Error al guardar en Firestore:", error);
      Alert.alert("Error", "La imagen es muy pesada o no se pudo guardar.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditPhoto = async () => {
    Alert.alert("Foto de Moderador", "Selecciona una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted")
            return Alert.alert("Error", "Se requiere permiso de cámara");

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4, // Comprimimos para no exceder 1MB en Firestore
            base64: true, // Pedimos el formato base64
          });
          if (!result.canceled && result.assets[0].base64) {
            saveImageBase64(result.assets[0].base64);
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted")
            return Alert.alert("Error", "Se requiere permiso de galería");

          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4,
            base64: true,
          });
          if (!result.canceled && result.assets[0].base64) {
            saveImageBase64(result.assets[0].base64);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/LoginScreen");
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar la sesión");
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await deleteUser(user);
        Alert.alert("Cuenta eliminada", "Tu cuenta ha sido borrada.");
        router.replace("/LoginScreen");
      } catch (error: any) {
        if (error.code === "auth/requires-recent-login") {
          Alert.alert(
            "Seguridad",
            "Por favor, re-autentícate para realizar esta acción.",
          );
        } else {
          Alert.alert("Error", "No se pudo eliminar la cuenta.");
        }
      }
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: "Inicio",
      icon: "home-outline",
      screen: "/(tabs)/inicioModerador",
    },
    {
      id: 2,
      name: "Tus reportes",
      icon: "document-text-outline",
      screen: "/(tabs)/tusReportesModerador",
    },
    {
      id: 3,
      name: "Validación de reportes",
      icon: "shield-checkmark-outline",
      screen: "/ValidationScreen",
    },
    {
      id: 4,
      name: "Soporte y contacto",
      icon: "call-outline",
      screen: "/soporteModerador",
    },
    { id: 5, name: "Acerca de", icon: "information-circle-outline" },
    { id: 6, name: "Cerrar sesión", icon: "exit-outline", action: "logout" },
    { id: 7, name: "Eliminar cuenta", icon: "trash-outline", action: "delete" },
  ];

  const handlePress = (item: MenuItem) => {
    if (item.name === "Acerca de") {
      setShowAboutModal(true);
      return;
    }
    if (item.action === "logout") {
      Alert.alert("Cerrar Sesión", "¿Deseas salir del panel?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, cerrar", onPress: handleLogout },
      ]);
      return;
    }
    if (item.action === "delete") {
      Alert.alert("¡Atención!", "Eliminarás tu perfil permanentemente.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: handleDeleteAccount,
        },
      ]);
      return;
    }
    if (item.screen) {
      router.push(item.screen as any);
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <View style={GlobalStyles.headerContainer}>
        <View style={GlobalStyles.profileHeader}>
          <TouchableOpacity onPress={handleEditPhoto} disabled={uploading}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require("../../assets/images/perfil.png")
                }
                style={GlobalStyles.profileAvatar}
              />
              {uploading && (
                <View style={styles.loaderOverlay}>
                  <ActivityIndicator size="large" color="#FFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={[GlobalStyles.textBase, GlobalStyles.profileName]}>
              {moderatorName}
            </Text>
            <Text style={localStyles.uidText}>
              ID: #{auth.currentUser?.uid.substring(0, 5)}
            </Text>
          </View>

          <View style={localStyles.modBadge}>
            <Ionicons
              name="shield-checkmark"
              size={12}
              color="#FFF"
              style={{ marginRight: 5 }}
            />
            <Text style={localStyles.modBadgeText}>MODERADOR</Text>
          </View>
        </View>
      </View>

      <View style={GlobalStyles.menuContainer}>
        {menuItems.map((item, index) => {
          const isLast = index === menuItems.length - 1;
          const itemStyle = [
            GlobalStyles.menuItem,
            isLast
              ? GlobalStyles.menuItemLast
              : {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: "#ddd",
                },
          ];
          let iconColor = AppColors.TEXT_DARK;
          if (item.action === "logout") iconColor = "#008000";
          if (item.action === "delete") iconColor = "#FF0000";

          return (
            <TouchableOpacity
              key={item.id}
              style={itemStyle}
              onPress={() => handlePress(item)}
            >
              <Ionicons name={item.icon} size={24} color={iconColor} />
              <Text style={[GlobalStyles.textBase, GlobalStyles.menuItemText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 1, backgroundColor: AppColors.BACKGROUND }} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAboutModal}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={GlobalStyles.centeredView}>
          <View style={GlobalStyles.modalView}>
            <TouchableOpacity
              onPress={() => setShowAboutModal(false)}
              style={GlobalStyles.closeButton}
            >
              <Ionicons
                name="close-circle"
                size={30}
                color={AppColors.PRIMARY}
              />
            </TouchableOpacity>
            <Text style={GlobalStyles.modalText}>{ABOUT_MESSAGE}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  modBadge: {
    backgroundColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  modBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  uidText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  loaderOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 100, // Ajusta según el tamaño de tu GlobalStyles.profileAvatar
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MenuModerator;
