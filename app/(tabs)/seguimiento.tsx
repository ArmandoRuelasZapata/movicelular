import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, AppColors } from './GlobalStyles';
import { useRouter } from 'expo-router';

export default function TrackingScreen() {
    const router = useRouter();

    return (
        // Fondo PRIMARY en el contenedor padre para que se vea en el área del header
        <SafeAreaView style={[GlobalStyles.container, { backgroundColor: AppColors.PRIMARY }]}>
            
            {/* Header: Quitamos bordes redondeados para que el color sea sólido detrás de la tarjeta */}
            <View style={[GlobalStyles.headerContainer, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
                <View style={[GlobalStyles.profileHeader, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/tusReportes')} style={localStyles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={AppColors.TEXT_LIGHT} />
                    </TouchableOpacity>
                    <Text style={[GlobalStyles.textBase, GlobalStyles.profileName, { marginLeft: 10 }]}>
                        Seguimiento de reporte
                    </Text>
                </View>
            </View>

            {/* Contenedor Blanco con Curvas Pronunciadas (Efecto de la imagen) */}
            <View style={[GlobalStyles.menuContainer,GlobalStyles.menuItem]}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    
                    <Text style={[GlobalStyles.textBase, localStyles.reportIdText]}>
                        Reporte #01_17:02_11/11/2025
                    </Text>

                    <View style={localStyles.detailsContainer}>
                        <DetailItem label="Título del reporte" value="Escribe un título:" isPlaceholder />
                        <DetailItem label="Descripción general" value="Comenta que ha ocurrido:" isPlaceholder />
                        
                        {/* Imagen del reporte */}
                        <Image 
                            source={require('../../assets/images/perfil.png')} // Asegúrate que esta ruta exista
                            style={localStyles.reportImage}
                        />

                        <DetailItem label="Ubicación" value="Mi ubicación actual" isPlaceholder />
                        <DetailItem label="Recomendaciones" value="Recomendaciones para peatones o conductores cercanos" isPlaceholder />
                        <DetailItem label="Más detalles" value="(Opcional) algo más que deseas compartir" isPlaceholder />
                    </View>

                    {/* Tarjeta de Estatus interna con borde negro fino */}
                    <View style={localStyles.statusCard}>
                        <Text style={[GlobalStyles.textBase, localStyles.statusTitle]}>Estatus de Reporte</Text>
                        
                        <View style={localStyles.stepperContainer}>
                            <View style={localStyles.progressLine} />
                            <View style={localStyles.stepsRow}>
                                <StepNode label="Aprobado" active />
                                <StepNode label="En Revisión" active />
                                <StepNode label="En Atención" active />
                                <StepNode label="Finalizado" isLast color="#00C49A" />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const DetailItem = ({ label, value, isPlaceholder }: any) => (
    <View style={localStyles.itemBox}>
        <Text style={[GlobalStyles.textBase, localStyles.label]}>{label}</Text>
        <Text style={[GlobalStyles.textBase, isPlaceholder ? localStyles.placeholder : localStyles.value]}>
            {value}
        </Text>
    </View>
);

const StepNode = ({ label, active, isLast, color }: any) => (
    <View style={localStyles.stepItem}>
        <View style={[
            localStyles.circle, 
            { backgroundColor: color || (active ? AppColors.PRIMARY : '#CCC'), borderColor: '#333', borderWidth: 1 }
        ]} />
        <Text style={[GlobalStyles.textBase, localStyles.stepLabel]}>{label}</Text>
    </View>
);

const localStyles = StyleSheet.create({
    backButton: { padding: 5 },
    
    // Contenedor principal blanco con curvas superiores
    mainCard: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Un blanco hueso ligero para resaltar
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 25,
        paddingTop: 30,
        // Eliminamos el margen para que la curva pegue a los bordes
        marginTop: 0, 
    },
    
    reportIdText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#000', 
        marginBottom: 25,
        textAlign: 'left'
    },
    detailsContainer: { marginBottom: 1 },
    itemBox: { marginBottom: 10 },
    label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    value: { fontSize: 14, color: '#333' },
    placeholder: { fontSize: 14, color: '#999' },
    reportImage: { 
        width: 100, 
        height: 90, 
        borderRadius: 12, 
        marginVertical: 10,
        backgroundColor: '#EEE'
    },

    statusCard: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 25,
        paddingVertical: 30,
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 20
    },
    statusTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 40, color: '#000' },
    stepperContainer: { width: '100%', position: 'relative', justifyContent: 'center' },
    progressLine: {
        position: 'absolute',
        top: 15,
        left: '10%',
        right: '10%',
        height: 1.5,
        backgroundColor: '#333',
    },
    stepsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    stepItem: { alignItems: 'center', width: '24%' },
    circle: { width: 32, height: 32, borderRadius: 16, zIndex: 2 },
    stepLabel: { fontSize: 11, marginTop: 10, textAlign: 'center', fontWeight: 'bold', color: '#333' }
});