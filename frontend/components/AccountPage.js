import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useGetAccountQuery } from '../services/courtsApi';
import { logout } from '../slices/loginSlice';
import { Ionicons } from '@expo/vector-icons';

const AccountPage = ({ navigation }) => {
  const { data: account, error, isLoading, refetch } = useGetAccountQuery();
  const token = useSelector((state) => state.login.token);
  const role = useSelector((state) => state.login.role);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) { // neu co token thi fetch data
      refetch();
    }
  }, [token, refetch]);

  const handleLogout = () => {
    dispatch(logout());
    // khong can navigate den Login vi dang xai rendering co dieu kien
    // co nghia la no se render dua tren state cua login
    // khi logout = ko co token => render LoginPage
  };

  if (!token) {
    return <Text>You are not logged in.</Text>;
  }

  if (isLoading) return <Text>Loading...</Text>;
  if (error) {
    console.error('Error:', error);
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Information</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Name: {account.Name}</Text>
        <Text style={styles.infoText}>Phone Number: {account.PhoneNumber}</Text>
        <Text style={styles.infoText}>Location: {account.Location}</Text>
        <Text style={styles.infoText}>Credit Score: {account.CreditScore}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Modify Account', { customerId: account.CustomerID })}>
        <Ionicons name="create-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Modify Account</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Logout</Text>
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
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4682b4',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
});

export default AccountPage;