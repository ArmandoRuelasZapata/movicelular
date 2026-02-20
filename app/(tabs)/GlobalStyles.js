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
  // Añadimos un color para el borde o separator si no existe
  SEPARATOR: "#E0E0E0",
};

export const GlobalStyles = StyleSheet.create({
  // Tipografía Base: ESTÁS USANDO CORRECTAMENTE 'Arimo-Regular'
  textBase: {
    fontFamily: "Arimo-Regular",
  },
  // ... (Resto de estilos de navegación y contenedor) ...
  container: {
    flex: 1,
    backgroundColor: AppColors.BACKGROUND,
  },
  headerContainer: {
    backgroundColor: AppColors.PRIMARY,
    paddingTop: Constants.statusBarHeight,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.BACKGROUND,
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.TEXT_DARK,
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
    borderBottomWidth: StyleSheet.hairlineWidth, // Usar hairlineWidth para una línea fina
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

  // --- 4. ESTILOS DEL MODAL (NUEVOS) ---
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20, // Reducido ligeramente para ajustarse a la imagen
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
    // La imagen no muestra un título, solo el cuerpo y el botón de cierre.
    // Podríamos quitar el título, pero lo mantengo por si lo necesitas:
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.TEXT_DARK,
  },
  modalText: {
    // Texto de la misión
    textAlign: "justify",
    fontSize: 15,
    lineHeight: 20,
    color: AppColors.TEXT_DARK,
  },
  closeButton: {
    // Estilo para posicionar el botón 'x' en la esquina
    position: "absolute",
    top: -5,
    right: -2,
    zIndex: 10, // Asegura que esté por encima de otros elementos
    padding: 5,
  },
});

export { ASPECT_RATIO, height, width };

