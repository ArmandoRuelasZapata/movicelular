import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles, AppColors } from './GlobalStyles';
import { useRouter } from 'expo-router';

const MY_REPORTS = [
    { id: '1', title: 'Reporte #01_17:02_11/11/2025' },
    { id: '2', title: 'Reporte #02_22:15_12/11/2025' },
];

export default function MyReportsScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={GlobalStyles.container}>
            {/* Encabezado con el estilo PRIMARY del perfil */}
            <View style={GlobalStyles.headerContainer}>
                <View style={localStyles.headerContent}>
                    <TouchableOpacity onPress={() => router.push('/explore')} style={localStyles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={AppColors.TEXT_LIGHT} />
                    </TouchableOpacity>
                    <Text style={[GlobalStyles.textBase, GlobalStyles.profileName, { marginLeft: 10 }]}>
                        Tus reportes
                    </Text>
                </View>
            </View>

            {/* Contenedor tipo Tarjeta (Igual al menú del perfil) */}
            <View style={[GlobalStyles.menuContainer]}>
                <FlatList
                    data={MY_REPORTS}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // Para que el contenedor dicte el tamaño si son pocos
                    renderItem={({ item, index }) => {
                        const isLast = index === MY_REPORTS.length - 1;
                        return (
                            <TouchableOpacity 
                                style={[
                                    GlobalStyles.menuItem,
                                    isLast && GlobalStyles.menuItemLast
                                ]}
                                onPress={() => router.push({ pathname: '/seguimiento', params: { id: item.id } })}
                            >
                                <Ionicons name="document-text-outline" size={24} color={AppColors.PRIMARY} />
                                <Text style={[GlobalStyles.textBase, GlobalStyles.menuItemText, { flex: 1 }]}>
                                    {item.title}
                                </Text>
                                <Ionicons name="chevron-forward" size={20} color={AppColors.ICON_SEARCH} />
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
            
            <View style={{ flex: 0, backgroundColor: AppColors.BACKGROUND }} />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    backButton: {
        padding: 5,
    }
});