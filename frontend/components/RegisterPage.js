import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCreateAccountMutation } from '../services/courtsApi';

const RegisterPage = ({ navigation }) => {
  const [Name, setName] = useState('');
  const [PhoneNumber, setPhoneNumber] = useState('');
  const [Location, setLocation] = useState('');
  const [PasswordHash, setPasswordHash] = useState('');

  const [createAccount] = useCreateAccountMutation();

  const handleRegister = async () => {
    if (!Name || !PhoneNumber || !Location || !PasswordHash) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    try {
      await createAccount({ Name, PhoneNumber, Location, PasswordHash }).unwrap();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={Name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={PhoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={Location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={PasswordHash}
        onChangeText={setPasswordHash}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
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
});

export default RegisterPage;