import React, { useState } from "react";
import { 
  Alert, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  ScrollView 
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfigUsuarios"; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const RegisterScreen = () => {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Validar campos vacíos
    if (!nombre || !correo || !password || !confirmPassword) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    // 2. Validar mínimo de caracteres (NUEVO)
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // 3. Validar coincidencia
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, correo.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre: nombre,
        correo: correo.toLowerCase(),
        rol: "usuario",
        estado: "activo",
        fechaRegistro: new Date(),
      });

      router.replace("/(tabs)/inicio");
    } catch (error: any) {
      // Manejo de errores específico de Firebase
      let errorMessage = "No se pudo crear la cuenta";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo ya está registrado";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del correo es inválido";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <Text style={styles.headerTitle}>Registro</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput 
            style={styles.input} 
            value={nombre} 
            onChangeText={setNombre} 
            placeholder="Tu nombre completo"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput 
            style={styles.input} 
            value={correo} 
            onChangeText={setCorreo} 
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="ejemplo@correo.com"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput 
            style={styles.input} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholder="Mínimo 6 caracteres"
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput 
            style={styles.input} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry 
            placeholder="Repite tu contraseña"
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/LoginScreen")}>
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
    paddingTop: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 40,
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
    backgroundColor: "#EEEEEE",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
    color: "#777777",
  },
  button: {
    backgroundColor: "#0E8388",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
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

export default RegisterScreen;