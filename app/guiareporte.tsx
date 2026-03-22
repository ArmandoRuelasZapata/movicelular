import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GuiaReporteScreen = () => {
  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Ocultamos el header nativo para usar el nuestro */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
          <Text style={styles.headerTitle}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.whiteCard}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>¿Cómo crear un reporte?</Text>
          
          <View style={styles.stepBox}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>1</Text></View>
            <Text style={styles.stepDescription}>Presione el botón de <Text style={{fontWeight: 'bold'}}>(+)</Text> en el inicio de la aplicación.</Text>
          </View>

          <View style={styles.stepBox}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>2</Text></View>
            <Text style={styles.stepDescription}>Seleccione el tipo de incidencia (bache, calle bloqueada, accidente, etc.).</Text>
          </View>

          <View style={styles.stepBox}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>3</Text></View>
            <Text style={styles.stepDescription}>Rellene todos los campos obligatorios marcados con asterisco <Text style={{color: 'red'}}>*</Text>.</Text>
          </View>

          <View style={styles.stepBox}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>4</Text></View>
            <Text style={styles.stepDescription}>Presione el botón <Text style={{fontWeight: 'bold'}}>"Continuar"</Text>.</Text>
          </View>

          <View style={styles.stepBox}>
            <View style={styles.numberCircle}><Text style={styles.numberText}>5</Text></View>
            <Text style={styles.stepDescription}>La app le devolverá un <Text style={{fontWeight: 'bold'}}>Token</Text> si la creación fue exitosa. ¡Guárdelo!</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#008080' },
  header: { padding: 20, paddingTop: 50 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, marginLeft: 10, fontWeight: '600' },
  whiteCard: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 30,
    marginTop: 10 
  },
  title: { fontSize: 30, fontWeight: 'bold', color: '#333', marginBottom: 30, textAlign: 'center' },
  stepBox: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 25 },
  numberCircle: { 
    backgroundColor: '#008080', 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  numberText: { color: 'white', fontWeight: 'bold' },
  stepDescription: { flex: 1, fontSize: 16, color: '#444', lineHeight: 22 },
});

export default GuiaReporteScreen;