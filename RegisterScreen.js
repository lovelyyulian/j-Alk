// RegisterScreen.js
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const InputField = React.memo(({ placeholder, value, onChangeText, secureTextEntry }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    placeholderTextColor="#bbb"
    keyboardAppearance="dark"
    secureTextEntry={secureTextEntry}
  />
));

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const { email, password, username } = formData;

    if (!email || !password || !username) {
      return alert('Por favor, preencha todos os campos');
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const userId = auth.currentUser.uid;

      await setDoc(doc(db, 'users', userId), { username, email });

      alert('Conta criada com sucesso! Faça login.');
      navigation.navigate('Login');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email já está em uso. Tente outro.',
      'auth/invalid-email': 'O email fornecido é inválido. Verifique e tente novamente.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    };
    alert(errorMessages[error.code] || `Erro ao criar conta: ${error.message}`);
  };

  const handleChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Text style={styles.heading}>Cadastrar</Text>
      {['username', 'email', 'password'].map((field, index) => (
        <InputField
          key={index}
          placeholder={field === 'username' ? 'Nome de Usuário' : field.charAt(0).toUpperCase() + field.slice(1)}
          value={formData[field]}
          onChangeText={(value) => handleChange(field, value)}
          secureTextEntry={field === 'password'}
          keyboardType={field === 'email' ? 'email-address' : 'default'}
          autoCapitalize={field === 'email' ? 'none' : 'sentences'}
        />
      ))}
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Já tem uma conta? Faça login
      </Text>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  heading: {
    fontSize: 32,
    marginBottom: 32,
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
