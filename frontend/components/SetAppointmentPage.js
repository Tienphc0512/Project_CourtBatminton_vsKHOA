import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { useCreateAppointmentMutation, useGetCourtsQuery, useGetAccountQuery } from '../services/courtsApi';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const SetAppointmentPage = ({ navigation }) => {
  const route = useRoute();
  const { courtId, CustomerID } = route.params;
  const { data: courts, error, isLoading } = useGetCourtsQuery();
  const [selectedTime, setSelectedTime] = useState('');
  const [createAppointment] = useCreateAppointmentMutation();
  const customer = useGetAccountQuery();

  const court = courts?.find(court => court.CourtID === courtId); // lay du lieu theo courtID

  //get customer name
  const customerName = customer?.data?.Name;

  const isValidTimeSlot = (time, status) => {
    if (!time) return false; // neu time la null thi return false
    return status === 'Free'; 
  };

  const availableTimes = [ 
    { time: court?.time1, status: court?.Time1Status },
    { time: court?.time2, status: court?.Time2Status },
    { time: court?.time3, status: court?.Time3Status }
  ].filter(({ time, status }) => isValidTimeSlot(time, status)); // ap dung logic isValidTimeSlot

  //auto select first available time slot
  useEffect(() => { 
    if (court) {
      if (availableTimes.length > 0) {
        setSelectedTime(availableTimes[0].time);
      }
    }
  }, [court]); 

  const handleSetAppointment = async () => {
    try {
      await createAppointment({ CourtID: courtId, CourtName: court?.CourtName, Time: selectedTime, CustomerName: customerName }).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to set appointment:', error);
    }
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.slice(0, 5); // cat phan giay, chi lay gio va phut
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Appointment</Text>
      <Text style={styles.label}>Select Time Slot:</Text>
      <Picker
        selectedValue={selectedTime} // ko co cai nay la time slot no nhay len nhay xuong
        style={styles.picker}
        onValueChange={(itemValue) => {
          setSelectedTime(itemValue);
        }}
      >
        {availableTimes.map(({ time }, index) => ( 
          <Picker.Item key={index} label={`${formatTime(time)}`} value={time} /> // map qua tung time slot
        ))} 
      </Picker>
      <TouchableOpacity style={styles.button} onPress={handleSetAppointment}>
        <Ionicons name="calendar-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Set Appointment</Text>
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
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: '#4682b4',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
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

export default SetAppointmentPage;