import { Redirect } from "expo-router";

export default function Index() {
  // En el futuro, aquí podrías verificar si el usuario ya está logueado
  // Si no hay sesión, lo mandamos al Login
  return <Redirect href="/(tabs)/LoginScreen" />;
}
