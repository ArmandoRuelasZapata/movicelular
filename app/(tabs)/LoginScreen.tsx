import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors, GlobalStyles } from "../(tabs)/GlobalStyles";

// Firebase
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfigUsuarios";

const LoginScreen = () => {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      // 1. Autenticar en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        password,
      );
      const uid = userCredential.user.uid;

      // 2. Obtener perfiles de Firestore (Usuarios y Moderadores)
      const userDocRef = doc(db, "usuarios", uid);
      const modDocRef = doc(db, "moderadores", uid);

      // Consultamos ambas colecciones en paralelo para mejorar el rendimiento
      const [userDoc, modDoc] = await Promise.all([
        getDoc(userDocRef),
        getDoc(modDocRef),
      ]);

      // --- CONDICIÓN DE SEGURIDAD: SOLO ESTADO "activo" ---
      const userData = userDoc.exists()
        ? userDoc.data()
        : modDoc.exists()
          ? modDoc.data()
          : null;

      // Validamos que el perfil exista Y que su estado sea exactamente "activo"
      if (!userData || userData.estado !== "activo") {
        // Si no cumple, cerramos la sesión de Auth inmediatamente
        await signOut(auth);

        let mensaje = "Tu cuenta no se encuentra activa o ha sido bloqueada.";
        if (!userData)
          mensaje = "No se encontró un perfil válido para este usuario.";

        Alert.alert("Acceso Restringido", mensaje, [{ text: "OK" }]);
        setLoading(false);
        return;
      }
      // ----------------------------------------------------

      // 3. Si el estado es "activo", redirigimos según el Rol
      if (modDoc.exists()) {
        router.replace("/inicioModerador");
      } else if (userDoc.exists()) {
        router.replace("/inicio");
      }
    } catch (error: any) {
      // Usamos ': any' para evitar el error 'error is of type unknown'
      let msg = "Error al iniciar sesión";

      // Manejo de códigos de error de Firebase
      if (error?.code === "auth/invalid-credential") {
        msg = "Correo o contraseña incorrectos";
      } else if (error?.code === "auth/too-many-requests") {
        msg = "Demasiados intentos fallidos. Intenta más tarde.";
      } else if (error?.code === "auth/network-request-failed") {
        msg = "Error de conexión. Verifica tu internet.";
      }

      console.error("Login Error:", error?.code || error);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <SafeAreaView style={localStyles.safeArea}>
        <Image
          source={require("../../assets/images/logoMOVI.png")}
          style={localStyles.logo}
          resizeMode="contain"
        />

        <View style={localStyles.form}>
          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            placeholder="Correo Electrónico"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={correo}
            onChangeText={setCorreo}
          />

          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
            <Text style={[localStyles.forgotPassword, GlobalStyles.textBase]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              localStyles.loginButton,
              loading && localStyles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={localStyles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={localStyles.socialContainer}>
            <Ionicons name="logo-facebook" size={28} color="#3b5998" />
            <Ionicons name="logo-google" size={28} color="#DB4437" />
            <Ionicons name="logo-apple" size={28} color="#000" />
          </View>
        </View>

        <View style={localStyles.registerContainer}>
          <Text style={[localStyles.registerText, GlobalStyles.textBase]}>
            ¿No tienes cuenta?
          </Text>
          <TouchableOpacity onPress={() => router.push("/RegisterScreen")}>
            <Text style={[localStyles.registerLink, GlobalStyles.textBase]}>
              {" "}
              Registrarse
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  loginButton: {
    backgroundColor: AppColors.PRIMARY,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 40,
  },
  registerText: {
    color: "#444",
  },
  registerLink: {
    color: AppColors.PRIMARY,
    fontWeight: "bold",
  },
  forgotPassword: {
    color: AppColors.PRIMARY,
    fontWeight: "bold",
    textAlign: "right",
    padding: 5,
  },
});

export default LoginScreen;
