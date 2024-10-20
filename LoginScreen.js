import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const InputField = ({ placeholder, value, onChangeText, secureTextEntry }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    placeholderTextColor="#bbb"
    keyboardAppearance="dark"
    secureTextEntry={secureTextEntry}
  />
);

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login realizado com sucesso!');
      navigation.replace('Comments'); // Navega para a tela de comentários
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          errorMessage = 'Credenciais inválidas. Verifique seu email e senha e tente novamente.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Este usuário foi desativado. Entre em contato com o suporte.';
          break;
        default:
          errorMessage = 'Erro ao fazer login: ' + error.message;
          break;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => setFormData({ ...formData, [name]: value });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Text style={styles.pageTitle}>Acesse o j-Alk 💬!</Text>
      <Text style={styles.heading}>Login</Text>
      <InputField
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <InputField
        placeholder="Senha"
        value={formData.password}
        onChangeText={(value) => handleChange('password', value)}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Não tem uma conta? Cadastre-se
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#fff',
  },
  heading: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'left',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: 'lightgray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 16,
    color: '#007bff',
    textAlign: 'center',
  },
});
