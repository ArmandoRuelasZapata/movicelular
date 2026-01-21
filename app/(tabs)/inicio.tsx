import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, StyleSheet, Modal } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GlobalStyles, AppColors, ASPECT_RATIO } from './GlobalStyles'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; // Importamos useLocalSearchParams
import * as Location from 'expo-location';

const DURANGO_BOUNDS = {
  minLatitude: 23.90,
  maxLatitude: 24.15,
  minLongitude: -104.75,
  maxLongitude: -104.55,
};

const DURANGO_REGION = {
  latitude: 24.0277,
  longitude: -104.6531,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0922 * ASPECT_RATIO,
};

const MapScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams(); // Capturamos los datos enviados desde el formulario
  const mapRef = useRef<MapView>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [targetLocation, setTargetLocation] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // EFECTO: Detectar si venimos de un reporte exitoso
  useEffect(() => {
    if (params.mostrarAlerta === 'true') {
      setShowSuccess(true);
    }
  }, [params]);

  const cerrarAlertaExito = () => {
    setShowSuccess(false);
    // Limpiamos los parámetros para que la alerta no vuelva a salir al recargar
    router.setParams({ mostrarAlerta: undefined, folio: undefined, motivo: undefined });
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para buscar lugares.');
        return;
      }
      const localizedQuery = `${searchQuery}, Durango, Dgo, Mexico`;
      let result = await Location.geocodeAsync(localizedQuery);

      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        const isInsideDurango = 
          latitude >= DURANGO_BOUNDS.minLatitude &&
          latitude <= DURANGO_BOUNDS.maxLatitude &&
          longitude >= DURANGO_BOUNDS.minLongitude &&
          longitude <= DURANGO_BOUNDS.maxLongitude;

        if (isInsideDurango) {
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01 * ASPECT_RATIO,
          };
          mapRef.current?.animateToRegion(newRegion, 1500);
          setTargetLocation({ latitude, longitude });
        } else {
          Alert.alert('Ubicación no permitida', 'Solo se permite buscar dentro de Durango, Dgo.');
        }
      } else {
        Alert.alert('No encontrado', 'No se encontraron resultados en Durango.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al realizar la búsqueda.');
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <SafeAreaView style={GlobalStyles.headerContainer}>
        <View style={GlobalStyles.searchBar}>
          <TouchableOpacity onPress={handleSearch}>
            <MaterialIcons name="search" size={24} color={AppColors.ICON_SEARCH} style={GlobalStyles.searchIcon} />
          </TouchableOpacity>
          <TextInput
            placeholder="Buscar en Durango..."
            placeholderTextColor="#888"
            style={[GlobalStyles.searchInput, GlobalStyles.textBase]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </SafeAreaView>

      <MapView ref={mapRef} style={localStyles.map} initialRegion={DURANGO_REGION}>
        {targetLocation && (
          <Marker coordinate={targetLocation} title="Destino encontrado" pinColor={AppColors.PRIMARY} />
        )}
      </MapView>
      
      {/* BARRA DE NAVEGACIÓN */}
      <View style={GlobalStyles.bottomNav}> 
        <TouchableOpacity style={GlobalStyles.navItem} onPress={() => router.push('/inicio')}>
          <Ionicons name="home" size={30} color={AppColors.TEXT_LIGHT} /> 
          <Text style={[GlobalStyles.navText, GlobalStyles.textBase]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={localStyles.navItemCenter} onPress={() => router.push('/report')}>
          <View style={localStyles.centerOuterCircle}>
            <View style={localStyles.centerInnerCircle}>
              <Ionicons name="add" size={30} color={AppColors.PRIMARY} />
            </View>
          </View>
          <Text style={[localStyles.navTextCenter, GlobalStyles.textBase]}>Crear reporte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={GlobalStyles.navItem} onPress={() => router.push('/explore')}>
          <View style={GlobalStyles.accountCircle}>
            <Ionicons name="person" size={24} color={AppColors.PRIMARY} />
          </View>
          <Text style={[GlobalStyles.navText, GlobalStyles.textBase]}>Cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL DE ÉXITO REUBICADO AQUÍ --- */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalBox}>
            <Text style={localStyles.modalTitle}>Se ha generado el reporte</Text>
            
            <Text style={localStyles.modalBoldLabel}>Motivo:</Text>
            <Text style={localStyles.modalValue}>{params.motivo}</Text>

            <Text style={localStyles.modalBoldLabel}>Folio:</Text>
            <Text style={localStyles.modalValue}>{params.folio}</Text>

            <TouchableOpacity style={localStyles.btnAceptarSuccess} onPress={cerrarAlertaExito}>
              <Text style={localStyles.btnAceptarText}>aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  map: { flex: 1 },
  navItemCenter: { flex: 1, alignItems: 'center', marginTop: -25 },
  centerOuterCircle: { backgroundColor: AppColors.PRIMARY, padding: 1, borderRadius: 30, borderWidth: 5, borderColor: AppColors.TEXT_LIGHT, elevation: 5 },
  centerInnerCircle: { backgroundColor: AppColors.BACKGROUND, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  navTextCenter: { fontSize: 12, color: AppColors.TEXT_LIGHT, marginTop: 5 },
  
  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '75%', backgroundColor: '#E0E0E0', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  modalBoldLabel: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  modalValue: { fontSize: 16, color: '#555', marginBottom: 5, textAlign: 'center' },
  btnAceptarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnAceptarSuccess: { backgroundColor: '#43BB7E', paddingVertical: 8, paddingHorizontal: 40, borderRadius: 20, marginTop: 20 },
});

export default MapScreen;