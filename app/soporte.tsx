import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SoporteScreen = () => {
  const [busqueda, setBusqueda] = useState("");

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Soporte</Text>
        </View>
      </SafeAreaView>

      {/* CONTENIDO */}
      <View style={styles.whiteCard}>
        <View style={styles.centerContent}>
          <Text style={styles.welcomeText}>Hola, Armando</Text>
          <Text style={styles.subText}>¿Con qué te podemos ayudar?</Text>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Buscar..."
              style={styles.input}
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </View>

        <ScrollView style={styles.listContainer}>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push("/guiareporte")}
          >
            <FontAwesome name="file-text" size={24} color="black" />
            <Text style={styles.listText}>
              Guía Soporte ¿Cómo crear un reporte?
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#008080",
  },
  headerSafeArea: {
    backgroundColor: "#008080",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
  },
  centerContent: {
    alignItems: "center",
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 16,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 15,
    width: "100%",
    height: 45,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  listContainer: {
    marginTop: 30,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  listText: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: "500",
  },
});

export default SoporteScreen;
