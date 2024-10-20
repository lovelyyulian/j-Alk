import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig'; // Importe o auth do seu arquivo de configuração
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import CommentsScreen from './CommentsScreen';

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        await AsyncStorage.setItem('user', JSON.stringify(currentUser)); // Armazena o usuário
        setInitialRoute('Comments');
      } else {
        await AsyncStorage.removeItem('user'); // Remove o usuário ao deslogar
        const storedUser = await AsyncStorage.getItem('user');
        setInitialRoute(storedUser ? 'Comments' : 'Login');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar
  }, []);

  if (loading) {
    return null; // Você pode adicionar um componente de carregamento se desejar
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Comments" component={CommentsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
