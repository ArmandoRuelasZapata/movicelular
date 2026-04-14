import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth"; // Importación necesaria
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebaseConfigUsuarios";

const ForgotPassword = () => {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!correo) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    try {
      // Firebase envía un correo para que el usuario cambie su clave de forma segura
      await sendPasswordResetEmail(auth, correo.trim());

      Alert.alert(
        "Correo enviado",
        "Se ha enviado un enlace a tu correo para restablecer la contraseña.",
        [{ text: "OK", onPress: () => router.push("/(tabs)/LoginScreen") }],
      );
    } catch (error: any) {
      let errorMessage = "Ocurrió un error al intentar enviar el correo";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No existe un usuario registrado con este correo";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Recuperar Contraseña</Text>

        <View style={styles.form}>
          {/* Correo Electrónico */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Contraseña Nueva (Diseño según imagen) */}
          <Text style={styles.label}>Contraseña nueva</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Confirmar Contraseña Nueva */}
          <Text style={styles.label}>Confirmar contraseña nueva</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* Botón Recuperar */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Recuperar</Text>
            )}
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/LoginScreen")}
            >
              <Text style={styles.linkText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 80, // Un poco más de espacio arriba
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28, // Tamaño ajustado a la imagen
    fontWeight: "bold",
    color: "#000",
    marginBottom: 50,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#EEEEEE", // Gris claro de la imagen
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#0E8388", // Color verde azulado exacto
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    color: "#666",
    fontSize: 15,
  },
  linkText: {
    color: "#0E8388",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default ForgotPassword;
