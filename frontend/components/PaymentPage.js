import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useGetCourtsQuery } from '../services/courtsApi';

const PaymentPage = ({ route }) => {
  const { appointment } = route.params;
  const { data: courts, error, isLoading } = useGetCourtsQuery();
  const court = courts?.find(court => court.CourtID === appointment.CourtID);
  const courtPrice = court?.PricePerHour;

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment for:</Text>
      <Text style={styles.detail}>User: {appointment.CustomerName}</Text>
      <Text style={styles.detail}>Court: {appointment.CourtName}</Text>
      <Text style={styles.detail}>Time: {appointment.Time}</Text>
      <Text style={styles.detail}>Appointment ID: {appointment.AppointmentID}</Text>
      <Text style={styles.detail1}>Please ensure that the appointment ID is included in the transaction details!</Text>
      <Text style={styles.detail}>Price: ${courtPrice}</Text>
      <Text style={styles.sub}>Scan QR code to pay:</Text>
      <Image
        style={styles.qrCode}
        source={{ uri: 'https://th.bing.com/th/id/R.172fe1e748bd68a70da25defb8a0ee26?rik=eykLNdToBgac9w&pid=ImgRaw&r=0' }} 
      />
      <Text style={styles.sub}>Or pay the managers with cash</Text>
      <Text style={styles.sub1}>Please wait for confirmation from the managers before heading out!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 16,
  },
  detail: {
    fontSize: 20,
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 8,
  },
  detail1: {
    fontSize: 20,
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  sub: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  sub1: {
    fontSize: 16,
    color: '#4682b4',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PaymentPage;