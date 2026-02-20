import React, { useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppColors, GlobalStyles } from "./GlobalStyles";

const LoginScreen = () => {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!correo || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    Alert.alert("Login exitoso");
  };

  return (
    <View style={GlobalStyles.container}>
      <SafeAreaView style={localStyles.safeArea}>
        {/* LOGO */}
        <Image
          source={require("../../assets/images/logoMOVI.png")}
          style={localStyles.logo}
          resizeMode="contain"
        />

        {/* FORM */}
        <View style={localStyles.form}>
          <TextInput
            style={[localStyles.input, GlobalStyles.textBase]}
            placeholder="Usuario o Correo Electrónico"
            placeholderTextColor="#888"
            autoCapitalize="none"
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

          <TouchableOpacity>
            <Text style={[localStyles.forgotText, GlobalStyles.textBase]}>
              ¿Olvidaste tu Contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.loginButton}
            onPress={handleLogin}
          >
            <Text style={localStyles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* LOGIN CON REDES SOCIALES*/}
          <Text style={[localStyles.socialText, GlobalStyles.textBase]}>
            Or login with
          </Text>

          <View style={localStyles.socialContainer}>
            <Ionicons name="logo-facebook" size={28} color="#3b5998" />
            <Ionicons name="logo-google" size={28} color="#DB4437" />
            <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
            <Ionicons name="logo-apple" size={28} color="#000" />
          </View>
        </View>

        {/* REGISTER */}
        <View style={localStyles.registerContainer}>
          <Text style={[localStyles.registerText, GlobalStyles.textBase]}>
            ¿No tienes una cuenta?
          </Text>

          <TouchableOpacity onPress={() => router.push("./RegisterScreen")}>
            <Text style={[localStyles.registerLink, GlobalStyles.textBase]}>
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
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 140,
    height: 140,
    marginTop: 40,
    marginBottom: 50,
    alignSelf: "center",
  },

  form: {
    width: "100%",
  },

  input: {
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },

  forgotText: {
    alignSelf: "flex-end",
    color: AppColors.PRIMARY,
    marginBottom: 25,
  },

  loginButton: {
    backgroundColor: AppColors.PRIMARY,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  socialText: {
    textAlign: "center",
    marginTop: 35,
    marginBottom: 15,
    color: "#444",
  },

  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 30,
  },

  registerContainer: {
    flexDirection: "row",
    marginTop: 40,
  },

  registerText: {
    color: "#444",
    marginRight: 5,
  },

  registerLink: {
    color: AppColors.PRIMARY,
    fontWeight: "bold",
  },
});

export default LoginScreen;
