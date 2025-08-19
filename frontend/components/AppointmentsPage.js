import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetAppointmentsQuery, useMarkAppointmentMissedMutation, useCancelAppointmentMutation } from '../services/courtsApi';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { setCancelableStatus } from '../slices/cancelableStatusSlice';
import { useNavigation } from '@react-navigation/native';

const AppointmentsPage = () => {
  const { data: appointments, error, isLoading, refetch } = useGetAppointmentsQuery();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [markAppointmentMissed] = useMarkAppointmentMissedMutation();
  const [filter, setFilter] = useState('all');
  const cancelableStatus = useSelector((state) => state.cancelableStatus);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      if (appointments) {
        appointments.forEach((appointment) => {
          const HMS = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });
          //test code
          // HMS = '14:00:00';
          if (appointment.Status === 'Waiting' && HMS >= appointment.Time) {
            markAppointmentMissed({ AppointmentID: appointment.AppointmentID, CourtID: appointment.CourtID, Time: appointment.Time });
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appointments, refetch, markAppointmentMissed]);

  // check cancel status
  useEffect(() => {
    if (appointments) {
      appointments.forEach((appointment) => {
        if (!(appointment.AppointmentID in cancelableStatus)) { // check coi appointment nay co trong cancelableStatus chua
          dispatch(setCancelableStatus({ appointmentId: appointment.AppointmentID, status: true })); // chua co thi set status = true
          setTimeout(() => { // set timeout 1p
            dispatch(setCancelableStatus({ appointmentId: appointment.AppointmentID, status: false })); // sau 1p set status = false
          }, 60000); // 1p
        }
      });
    }
  }, [appointments, cancelableStatus, dispatch]);

  const handleCancel = async (AppointmentID, CourtID, Time) => {
    try {
      await cancelAppointment({ AppointmentID: parseInt(AppointmentID), CourtID, Time }).unwrap();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      console.log('AppointmentID:', AppointmentID);
    }
  };

  const handlePay = (appointment) => {
    navigation.navigate('PaymentPage', { appointment });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter); // update state cua filter
  };

  const filteredAppointments = appointments?.filter(appointment => { // appointment nao co status nhu filter thi hien thi
    if (filter === 'all') return true; // neu filter = all thi return true, co nghia la hien thi tat ca appointment
    return appointment.Status.toLowerCase() === filter; // neu filter != all thi chi hien thi appointment co status = filter
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      <Picker
        selectedValue={filter}
        style={styles.picker}
        onValueChange={(itemValue) => handleFilterChange(itemValue)} // set filter bang du lieu tu picker
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="OnGoing" value="ongoing" />
        <Picker.Item label="Completed" value="completed" />
        <Picker.Item label="Missed" value="missed" />
        <Picker.Item label="Waiting" value="waiting" />
      </Picker>
      <FlatList
        data={filteredAppointments} // appointment da duoc filter tu tren
        keyExtractor={(item) => item.AppointmentID.toString()}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text style={styles.appointmentText}>Court: {item.CourtName}</Text>
            <Text style={styles.appointmentText}>Time: {item.Time}</Text>
            <Text style={styles.appointmentText}>Status: {item.Status}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  !cancelableStatus[item.AppointmentID] && styles.disabledButton
                ]}
                onPress={() => handleCancel(item.AppointmentID, item.CourtID, item.Time)}
                disabled={!cancelableStatus[item.AppointmentID]} // neu status = false thi tat button cancel
              >
                <Ionicons name="close-circle-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.payButton]}
                onPress={() => handlePay(item)}
              >
                <Ionicons name="cash-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Pay</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ff6347',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: '#d3d3d3', 
  },
  payButton: {
    backgroundColor: '#32cd32',
  },
});

export default AppointmentsPage;