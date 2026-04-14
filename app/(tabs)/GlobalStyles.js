import Constants from "expo-constants";
import { Dimensions, StyleSheet } from "react-native";

// --- Constantes Reutilizables ---
const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

export const AppColors = {
  PRIMARY: "#087D83",
  SECONDARY: "#2F4F4F",
  BACKGROUND: "#fff",
  TEXT_LIGHT: "white",
  TEXT_DARK: "#333",
  ICON_SEARCH: "#666",
  SEPARATOR: "#E0E0E0",
};

export const GlobalStyles = StyleSheet.create({
  // Tipografía Base
  textBase: {
    fontFamily: "Arimo-Regular",
  },

  container: {
    flex: 1,
    backgroundColor: AppColors.BACKGROUND,
  },
  headerContainer: {
    backgroundColor: AppColors.PRIMARY,
    paddingTop: Constants.statusBarHeight * 0.3,
  },

  // ✅ CORREGIDO: height fijo para evitar colapso en Mapbox,
  // borderRadius actualizado a 10, padding y sombra consistentes
  // con los estilos locales de MapScreen y MapScreenModerador.
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.BACKGROUND, // "#fff" garantizado
    borderRadius: 10,
    margin: 10,
    paddingHorizontal: 12,
    height: 46, // ← evita que colapse en Mapbox
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // ✅ CORREGIDO: fontSize y color alineados con los estilos locales.
  // Nota: placeholderTextColor NO es una prop de StyleSheet; debe
  // pasarse directamente al <TextInput> como prop. Se deja aquí
  // el estilo base del input y el comentario para recordarlo.
  searchInput: {
    flex: 1,
    fontSize: 15, // era 16, ajustado a 15 para consistencia
    color: AppColors.TEXT_DARK,
    // ⚠️ Recuerda agregar en tu <TextInput>:
    //   placeholderTextColor="#999"
    //   returnKeyType="search"
  },

  searchIcon: {
    marginRight: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    backgroundColor: AppColors.PRIMARY,
    paddingBottom: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 5,
  },
  navText: {
    fontSize: 12,
    color: AppColors.TEXT_LIGHT,
    marginTop: 2,
  },
  accountCircle: {
    backgroundColor: AppColors.BACKGROUND,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- ESTILOS DE PERFIL ---
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  profileAvatar: {
    width: 39,
    height: 39,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: AppColors.BACKGROUND,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: AppColors.TEXT_LIGHT,
  },
  menuContainer: {
    backgroundColor: AppColors.BACKGROUND,
    borderRadius: 15,
    margin: 0,
    marginTop: -10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomColor: AppColors.SEPARATOR,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "bold",
    color: AppColors.TEXT_DARK,
    marginLeft: 15,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },

  // --- ESTILOS DEL MODAL ---
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.TEXT_DARK,
  },
  modalText: {
    textAlign: "justify",
    fontSize: 15,
    lineHeight: 20,
    color: AppColors.TEXT_DARK,
  },
  closeButton: {
    position: "absolute",
    top: -5,
    right: -2,
    zIndex: 10,
    padding: 5,
  },
});

export { ASPECT_RATIO, height, width };

export default {};
