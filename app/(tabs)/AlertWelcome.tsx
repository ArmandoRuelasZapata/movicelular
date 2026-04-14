import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors, GlobalStyles } from "./GlobalStyles";

const AlertWelcome = () => {
  return (
    <View style={GlobalStyles.container}>
      <SafeAreaView style={localStyles.safeArea}>
        {/* FORM */}
        <View style={localStyles.form}>
          <Text style={GlobalStyles.modalTitle}>
            !Tu cuenta ha sido creada exitosamente!
          </Text>
          <TouchableOpacity>
            <Text style={[GlobalStyles.textBase]}>
              Te damos la bienvenida Ingresa tu correo y contraseña para
              continuar.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.loginButton}>
            <Text style={localStyles.loginButtonText}>Ir a MoviDGO</Text>
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

  form: {
    width: "100%",
  },

  loginButton: {
    backgroundColor: AppColors.PRIMARY,
    paddingVertical: 13,
    margin: 90,
    borderRadius: 10,
    alignItems: "center",
  },

  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
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
});

export default AlertWelcome;
