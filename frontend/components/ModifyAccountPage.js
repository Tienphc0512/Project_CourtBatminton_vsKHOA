import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useModifyAccountMutation, useGetAllAccountsQuery } from '../services/courtsApi';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ModifyAccountPage = ({ navigation }) => {
  const route = useRoute();
  const { customerId } = route.params;
  const { data: accounts, refetch } = useGetAllAccountsQuery();
  const account = accounts?.find((account) => account.CustomerID === customerId);

  const [Name, setName] = useState();
  const [PhoneNumber, setPhoneNumber] = useState(); 
  const [Location, setLocation] = useState();
  const [CreditScore, setCreditScore] = useState();
  const [PasswordHash, setPasswordHash] = useState();

  const [modifyAccount] = useModifyAccountMutation();  

  const handleModifyAccount = async () => {
    try {
      await modifyAccount({ CustomerID: customerId, Name, PhoneNumber, Location, CreditScore, PasswordHash }).unwrap(); 
      refetch(); // cap nhat lai du lieu tren page
      navigation.goBack();
    } catch (error) {
      console.error('Failed to modify account:', error);
    }
  };

  useEffect(() => {
    if (account) {
      setName(account.Name);
      setPhoneNumber(account.PhoneNumber);
      setLocation(account.Location);
      setCreditScore(account.CreditScore.toString());
      setPasswordHash(account.PasswordHash);
    }
  }, [account]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modify Account</Text>
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
        placeholder="Credit Score"
        value={CreditScore}
        onChangeText={setCreditScore}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={PasswordHash}
        onChangeText={setPasswordHash}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleModifyAccount}>
        <Ionicons name="save-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default ModifyAccountPage;