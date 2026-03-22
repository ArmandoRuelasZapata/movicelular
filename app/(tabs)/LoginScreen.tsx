import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfigUsuarios";

const LoginScreen = () => {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Verifica si ya hay sesión activa al abrir la app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No hay sesión, mostramos el formulario
        setCheckingSession(false);
        return;
      }

      try {
        const [userDoc, modDoc] = await Promise.all([
          getDoc(doc(db, "usuarios", user.uid)),
          getDoc(doc(db, "moderadores", user.uid)),
        ]);

        const userData = userDoc.exists()
          ? userDoc.data()
          : modDoc.exists()
            ? modDoc.data()
            : null;

        if (userData?.estado === "activo") {
          // Sesión válida, redirigimos según el rol
          if (modDoc.exists()) {
            router.replace("/inicioModerador");
          } else {
            router.replace("/inicio");
          }
        } else {
          // Cuenta bloqueada o sin perfil, cerramos sesión silenciosamente
          await signOut(auth);
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setCheckingSession(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        password,
      );
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, "usuarios", uid);
      const modDocRef = doc(db, "moderadores", uid);

      const [userDoc, modDoc] = await Promise.all([
        getDoc(userDocRef),
        getDoc(modDocRef),
      ]);

      const userData = userDoc.exists()
        ? userDoc.data()
        : modDoc.exists()
          ? modDoc.data()
          : null;

      if (!userData || userData.estado !== "activo") {
        await signOut(auth);

        let mensaje = "Tu cuenta no se encuentra activa o ha sido bloqueada.";
        if (!userData)
          mensaje = "No se encontró un perfil válido para este usuario.";

        Alert.alert("Acceso Restringido", mensaje, [{ text: "OK" }]);
        setLoading(false);
        return;
      }

      if (modDoc.exists()) {
        router.replace("/inicioModerador");
      } else if (userDoc.exists()) {
        router.replace("/inicio");
      }
    } catch (error: any) {
      let msg = "Error al iniciar sesión";

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

  // Pantalla de carga mientras verifica la sesión guardada
  if (checkingSession) {
    return (
      <View
        style={[
          GlobalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Image
          source={require("../../assets/images/logoMOVI.png")}
          style={{ width: 100, height: 100, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={AppColors.PRIMARY} />
      </View>
    );
  }

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
