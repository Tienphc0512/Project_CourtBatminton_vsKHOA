import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../slices/loginSlice';

const LoginPage = ({ navigation }) => {
  const [Name, setUsername] = useState('');
  const [PasswordHash, setPassword] = useState('');
  const dispatch = useDispatch();
  const { status, error, token } = useSelector((state) => state.login);

  // useEffect(() => {
  //   if (status === 'succeeded') {
  //     // khong can navigate den Home vi dang xai rendering co dieu kien
  //     // co nghia la no se render dua tren state cua login
  //     // khi login thanh cong = co token => render HomePage
  //   }
  // }, [status, navigation]);

  const handleLogin = () => {
    dispatch(login({ Name, PasswordHash }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={Name}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={PasswordHash}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Ionicons name="log-in-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      {status === 'loading' && <Text>Loading...</Text>}
      {status === 'failed' && <Text style={styles.errorText}>Error: {error}</Text>}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Ionicons name="person-add-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4682b4',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LoginPage;