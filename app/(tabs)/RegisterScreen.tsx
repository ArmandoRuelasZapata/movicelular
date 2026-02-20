import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import { AppColors, GlobalStyles } from "./GlobalStyles";

const RegisterScreen = () => {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (!nombre || !correo || !password || !confirmPassword) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    Alert.alert("Registro exitoso");
  };

  return (
    <View style={GlobalStyles.container}>
      <SafeAreaView style={localStyles.safeArea}>
        <Text style={[localStyles.title, GlobalStyles.textBase]}>Registro</Text>

        <View style={localStyles.form}>
          <Text style={[localStyles.label, localStyles.textBase]}>Nombre:</Text>
          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={[localStyles.label, localStyles.textBase]}>
            Correo electrónico
          </Text>
          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <Text style={[localStyles.label, localStyles.textBase]}>
            Contraseña
          </Text>
          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={[localStyles.label, localStyles.textBase]}>
            Confirmar contraseña
          </Text>
          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={localStyles.registerButton}
            onPress={handleRegister}
          >
            <Text style={localStyles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>

          <View style={localStyles.loginContainer}>
            <Text style={[localStyles.loginText, GlobalStyles.textBase]}>
              ¿Ya tienes una cuenta?
            </Text>

            <TouchableOpacity onPress={() => router.push("./LoginScreen")}>
              <Text style={[localStyles.loginLink, GlobalStyles.textBase]}>
                Iniciar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 40,
    color: AppColors.TEXT_DARK,
  },

  form: {
    flex: 1,
  },
  textBase: {
    fontFamily: "Arimo-Regular",
    fontWeight: "bold",
  },

  label: {
    fontSize: 15,
    marginBottom: 6,
    color: AppColors.TEXT_DARK,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
    backgroundColor: "#FFF",
  },

  registerButton: {
    backgroundColor: AppColors.PRIMARY, // tu verde/azulito
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  registerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  loginText: {
    color: "#444",
    marginRight: 5,
  },

  loginLink: {
    color: AppColors.PRIMARY,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
