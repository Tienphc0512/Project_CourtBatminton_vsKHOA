import React, { useState, useEffect, useRef } from 'react';
import { useGetAllAppointmentsQuery, useDeleteAppointmentMutation, useMarkAppointmentCompletedMutation, useMarkAppointmentOnGoingMutation, useGetAccountQuery, useGetCourtsQuery, useConfirmPaymentMutation } from '../services/courtsApi';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const ManageAppointmentsPage = () => {
  const { data: appointments, error, isLoading, refetch } = useGetAllAppointmentsQuery();
  const { data: courts, error: courtsError, isLoading: isLoadingCourts } = useGetCourtsQuery();
  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [markAppointmentCompleted] = useMarkAppointmentCompletedMutation();
  const [markAppointmentOnGoing] = useMarkAppointmentOnGoingMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [filter, setFilter] = useState('all');
  const role = useSelector((state) => state.login.role);
  const alertedAppointments = useRef(new Set());

  const customer = useGetAccountQuery();
  const customerPhone = customer?.data?.PhoneNumber;

  // const court = courts?.find(court => court.CourtID === appointments.CourtID);
  // const courtPrice = court?.PricePerHour;
  const getCourtPrice = (courtID) => {
    const court = courts?.find(court => court.CourtID === courtID);
    return court?.PricePerHour;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      if (appointments) {
        appointments.forEach((appointment) => {
          notifyEndingAppointment(appointment);
        });
      }
    }, 1000); // 1 sec

    return () => clearInterval(interval);
  }, [refetch, appointments]);

  // thong bao appointment sap ket thuc
  const notifyEndingAppointment = (appointment) => {
    const now = new Date();
    const HMS = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });
    //const endingTime = appointment.Time + 1 * 60000;
    const [hours, minutes, seconds] = appointment.Time.split(':').map(Number); // lay gio, phut, giay cua appointment
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, seconds);

    // + 1 minute
    const endingTime = new Date(appointmentTime.getTime() + 1 * 60000); // test 1p
    const endingHMS = endingTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });

    //console.log('now:', HMS);
    //console.log('endingTime:', endingHMS);

    if (appointment.Status === 'OnGoing' && HMS >= endingHMS && (role === 'admin' || role === 'manager')) {
      if (!alertedAppointments.current.has(appointment.AppointmentID)) {
        Alert.alert(`Appointment for ${appointment.CustomerName}, ${appointment.Time}, ${appointment.CourtName} is ending soon!`);
        console.log(`Appointment for ${appointment.CustomerName}, ${appointment.Time}, ${appointment.CourtName} is ending soon!`);
        alertedAppointments.current.add(appointment.AppointmentID);
      }
    } else if (appointment.Status === 'Completed') {
      //console.log(`Appointment for ${appointment.CustomerName}, ${appointment.Time}, ${appointment.CourtName} has ended.`);
      return;
    }
  };

  const handleDelete = async (AppointmentID) => {
    try {
      await deleteAppointment(parseInt(AppointmentID)).unwrap();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      console.log('AppointmentID:', AppointmentID);
    }
  };

  const handleMarkCompleted = async (appointment) => {
    try {
      await markAppointmentCompleted({ AppointmentID: appointment.AppointmentID, CourtID: appointment.CourtID, Time: appointment.Time }).unwrap();
    } catch (error) {
      console.error('Failed to mark appointment as completed:', error);
    }
  };

  const handleMarkOnGoing = async (appointment) => {
    try {
      await markAppointmentOnGoing({ AppointmentID: appointment.AppointmentID }).unwrap();
    } catch (error) {
      console.error('Failed to mark appointment as on going:', error);
    }
  };

  const handleConfirmPayment = async (appointment) => {
    try {
      await confirmPayment({ AppointmentID: appointment.AppointmentID }).unwrap();
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    }
  };

  const callCustomer = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredAppointments = appointments?.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.Status.toLowerCase() === filter;
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Appointments</Text>
      <Picker
        selectedValue={filter}
        style={styles.picker}
        onValueChange={(itemValue) => handleFilterChange(itemValue)}
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="OnGoing" value="ongoing" />
        <Picker.Item label="Completed" value="completed" />
        <Picker.Item label="Missed" value="missed" />
        <Picker.Item label="Waiting" value="waiting" />
      </Picker>
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.AppointmentID.toString()}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text style={styles.appointmentText}>Court: {item.CourtName}</Text>
            <Text style={styles.appointmentText}>Time: {item.Time}</Text>
            <Text style={styles.appointmentText}>Customer: {item.CustomerName}</Text>
            <Text style={styles.appointmentText}>Status: {item.Status}</Text>
            <Text style={styles.appointmentText}>Price: ${getCourtPrice(item.CourtID)}</Text>
            <Text style={styles.appointmentText}>Appointment ID: {item.AppointmentID}</Text>
            <Text style={styles.appointmentText}>Payment: {item.payment}</Text>
            <View style={styles.buttonContainer}>
              {item.Status === 'Completed' && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDelete(item.AppointmentID)}
                >
                  <Ionicons name="trash-outline" size={24} color="white" />
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              )}
              {item.Status === 'Waiting' && (
                <TouchableOpacity
                  style={[styles.button, styles.arrivedButton]}
                  onPress={() => handleMarkOnGoing(item)}
                >
                  <Ionicons name="play-outline" size={24} color="white" />
                  <Text style={styles.buttonText}>Mark OnGoing</Text>
                </TouchableOpacity>
              )}
              {item.Status === 'OnGoing' && (
                <TouchableOpacity
                  style={[styles.button, styles.arrivedButton]}
                  onPress={() => handleMarkCompleted(item)}
                >
                  <Ionicons name="checkmark-done-outline" size={24} color="white" />
                  <Text style={styles.buttonText}>Mark Completed</Text>
                </TouchableOpacity>
              )}
              {item.payment === 'Unconfirmed' && (
                <TouchableOpacity
                  style={[styles.button, styles.arrivedButton]}
                  onPress={() => handleConfirmPayment(item)}
                >
                  <Ionicons name="play-outline" size={24} color="white" />
                  <Text style={styles.buttonText}>Confirm Payment</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.callButton]}
                onPress={() => callCustomer(customerPhone)}
              >
                <Ionicons name="call-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Call Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  appointmentItem: {
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
  appointmentText: {
    fontSize: 18,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ff6347',
  },
  arrivedButton: {
    backgroundColor: '#4682b4',
  },
  callButton: {
    backgroundColor: '#32cd32',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'column', // vertical buttons
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default ManageAppointmentsPage;