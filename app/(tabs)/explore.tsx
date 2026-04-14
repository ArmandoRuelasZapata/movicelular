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
import { AppColors, GlobalStyles } from "./GlobalStyles";

// Firebase
import { deleteUser, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// Eliminamos storage ya que usaremos Base64 directamente en Firestore (db)
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

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.nombre || "Usuario");
            if (data.photoURL) setProfileImage(data.photoURL);
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, []);

  // --- FUNCIÓN PARA GUARDAR IMAGEN COMO STRING (BASE64) EN FIRESTORE ---
  const saveImageBase64 = async (base64Data: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setUploading(true);
    try {
      // Formateamos como Data URI para que el componente <Image> lo reconozca
      const fullBase64 = `data:image/jpeg;base64,${base64Data}`;

      // Actualizamos directamente el campo photoURL en la colección 'usuarios'
      await updateDoc(doc(db, "usuarios", user.uid), {
        photoURL: fullBase64,
      });

      setProfileImage(fullBase64);
      Alert.alert("Éxito", "Tu foto de perfil ha sido actualizada.");
    } catch (error) {
      console.error("Error al guardar Base64:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar la imagen. Intenta con una foto más pequeña.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEditPhoto = async () => {
    Alert.alert("Foto de perfil", "Selecciona una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted")
            return Alert.alert("Error", "Permiso de cámara denegado");

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.4, // Comprimimos para no exceder el límite de Firestore (1MB)
            base64: true,
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
            return Alert.alert("Error", "Permiso de galería denegado");

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
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      Alert.alert("¡Atención!", "Eliminarás tu cuenta permanentemente.", [
        { text: "No", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user);
              router.replace("/LoginScreen");
            } catch (error) {
              Alert.alert(
                "Error",
                "Por seguridad, debes haber iniciado sesión recientemente para borrar tu cuenta.",
              );
            }
          },
        },
      ]);
    }
  };

  const menuItems: MenuItem[] = [
    { id: 1, name: "Inicio", icon: "home-outline", screen: "/inicio" },
    {
      id: 2,
      name: "Tus reportes",
      icon: "document-text-outline",
      screen: "/tusReportes",
    },
    {
      id: 3,
      name: "Soporte y contacto",
      icon: "call-outline",
      screen: "/soporte",
    },
    { id: 4, name: "Acerca de", icon: "information-circle-outline" },
    { id: 5, name: "Cerrar sesión", icon: "exit-outline", action: "logout" },
    { id: 6, name: "Eliminar cuenta", icon: "trash-outline", action: "delete" },
  ];

  const handlePress = (item: MenuItem) => {
    if (item.name === "Acerca de") {
      setShowAboutModal(true);
      return;
    }
    if (item.action === "logout") {
      Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
        { text: "No" },
        { text: "Sí", onPress: handleLogout },
      ]);
      return;
    }
    if (item.action === "delete") {
      handleDeleteAccount();
      return;
    }
    if (item.screen) router.push(item.screen as any);
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
                    : require("../../assets/images/usuario.png")
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
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={[GlobalStyles.textBase, GlobalStyles.profileName]}>
                  {userName}
                </Text>
                <Text style={localStyles.uidText}>
                  ID: #{auth.currentUser?.uid.substring(0, 5)}
                </Text>
              </>
            )}
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
  uidText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "normal",
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  loaderOverlay: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 100, // Debe coincidir con el tamaño de GlobalStyles.profileAvatar
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
