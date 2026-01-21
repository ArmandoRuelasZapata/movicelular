import React, { useState } from 'react'; 
import { 
    View, 
    Text, 
    StyleSheet, // Aún se necesita si usas StyleSheet.hairlineWidth
    Image, 
    TouchableOpacity, 
    Alert, 
    ImageSourcePropType, 
    Modal 
} from 'react-native';
// Asegúrate de que la ruta a GlobalStyles sea correcta
import { GlobalStyles, AppColors } from './GlobalStyles'; // Usaremos GlobalStyles para los estilos del modal
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 

// --- 1. Definición de Tipos ---
interface MenuItem {
    id: number;
    name: string;
    icon: keyof typeof Ionicons.glyphMap; 
    screen?: string; 
    action?: 'logout' | 'delete'; 
    isAction?: boolean;
}

// Define el tipo de la data del perfil
interface ProfileData {
    name: string;
    avatar: string | number; 
    menuItems: MenuItem[];
}

// --- 2. Datos ---
const PROFILE_DATA: ProfileData = {
    name: 'Armando Ruelas Zapata',
    avatar: require('../../assets/images/perfil.png'), 
    menuItems: [
        { id: 1, name: 'Inicio', icon: 'home-outline', screen: 'Home' },
        { id: 2, name: 'Validación de reportes', icon: 'document-text-sharp', screen: 'Reports'},
        { id: 3, name: 'Tus reportes', icon: 'document-text-outline', screen: 'Reports' },
        { id: 4, name: 'Soporte y contacto', icon: 'call-outline', screen: 'Support' },
        { id: 5, name: 'Acerca de', icon: 'information-circle-outline', screen: 'About' },
        { id: 6, name: 'Cerrar sesión', icon: 'exit-outline', action: 'logout', isAction: true },
        { id: 7, name: 'Eliminar cuenta', icon: 'trash-outline', action: 'delete', isAction: true },
    ],
};

const ABOUT_MESSAGE = "En esta aplicación, nuestra misión es mejorar la seguridad y eficiencia vial proporcionando información actualizada sobre el estado de las vías. Facilitamos a la ciudadanía el acceso a datos relevantes y la posibilidad de reportar incidencias en tiempo real, contribuyendo así a una mejor toma de decisiones por parte de las autoridades";


// --- 3. Componente ---
const ProfileScreen: React.FC = () => { 
    
    const router = useRouter(); 
    // Estado para controlar la visibilidad del modal "Acerca de"
    const [showAboutModal, setShowAboutModal] = useState(false); 

    // Función para manejar la navegación o acciones
    const handlePress = (item: MenuItem) => {
        
        if (item.name === 'Inicio') {
            router.push('/inicio'); 
            return; 
        }

        // === LÓGICA: Mostrar Modal al presionar 'Acerca de' ===
        if (item.name === 'Acerca de') {
            setShowAboutModal(true);
            return; 
        }

        // Lógica de acciones (logout/delete)
        if (item.action === 'logout') {
            Alert.alert(
                'Cerrar Sesión',
                '¿Estás seguro de que quieres cerrar la sesión?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Sí', onPress: () => console.log('Lógica de logout ejecutada') },
                ],
            );
        } else if (item.action === 'delete') {
            Alert.alert(
                'Eliminar Cuenta',
                'Esta acción es irreversible. ¿Deseas continuar?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Eliminar', style: 'destructive', onPress: () => console.log('Lógica de eliminar cuenta ejecutada') },
                ],
            );
        } else if (item.screen) {
            Alert.alert("Navegación", `Iría a la pantalla: ${item.name}`);
        }
    };

    return (
        <View style={GlobalStyles.container}>
            
            {/* Contenido principal de la pantalla de perfil */}
            <View style={GlobalStyles.headerContainer}>
                <View style={GlobalStyles.profileHeader}> 
                    <Image 
                        source={PROFILE_DATA.avatar as ImageSourcePropType} 
                        style={GlobalStyles.profileAvatar}
                    />
                    <Text style={[GlobalStyles.textBase, GlobalStyles.profileName]}>
                        {PROFILE_DATA.name}
                    </Text>
                </View>
            </View>

            <View style={GlobalStyles.menuContainer}>
                {PROFILE_DATA.menuItems.map((item, index) => {
                    const isLast = index === PROFILE_DATA.menuItems.length - 1;
                    
                    const itemStyle = [
                        GlobalStyles.menuItem,
                        // Usamos la propiedad borderBottomWidth con StyleSheet.hairlineWidth
                        isLast ? GlobalStyles.menuItemLast : { borderBottomWidth: StyleSheet.hairlineWidth }, 
                    ];
                    
                    let textStyle = [GlobalStyles.textBase, GlobalStyles.menuItemText];
                    let iconColor = AppColors.TEXT_DARK; 

                    if (item.action === 'logout') {
                        textStyle.push(); 
                        iconColor = 'green';
                    } else if (item.action === 'delete') {
                        textStyle.push(); 
                        iconColor = 'red';
                    }

                    return (
                        <TouchableOpacity 
                            key={item.id} 
                            style={itemStyle}
                            onPress={() => handlePress(item)} 
                        >
                            <Ionicons name={item.icon} size={24} color={iconColor} />
                            <Text style={textStyle}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            
            <View style={{ flex: 1, backgroundColor: AppColors.BACKGROUND }} />

            {/* === COMPONENTE MODAL "ACERCA DE" - Usando GlobalStyles === */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showAboutModal}
                onRequestClose={() => setShowAboutModal(false)}
            >
                {/* Usando GlobalStyles.centeredView */}
                <View style={GlobalStyles.centeredView}>
                    {/* Usando GlobalStyles.modalView */}
                    <View style={GlobalStyles.modalView}>
                        
                        {/* Botón de cierre - Usando GlobalStyles.closeButton */}
                        <TouchableOpacity 
                            onPress={() => setShowAboutModal(false)} 
                            style={GlobalStyles.closeButton} 
                        >
                            <Ionicons name="close-circle" size={24} color="red" />
                        </TouchableOpacity>

                        {/* Contenido del mensaje - Usando GlobalStyles.modalText */}
                        <Text style={GlobalStyles.modalText}>
                            {ABOUT_MESSAGE}
                        </Text>
                        
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ProfileScreen;