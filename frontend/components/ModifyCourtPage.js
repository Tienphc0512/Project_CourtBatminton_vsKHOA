import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { useUpdateCourtMutation, useGetCourtsQuery } from '../services/courtsApi';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ModifyCourtPage = ({ navigation }) => {
  const route = useRoute();
  const { courtId } = route.params;
  const { data: courts, refetch } = useGetCourtsQuery();
  const court = courts?.find((court) => court.CourtID === courtId);

  const [CourtName, setCourtName] = useState();
  const [PricePerHour, setPricePerHour] = useState();
  const [Conditions, setConditions] = useState();
  const [Location, setLocation] = useState();
  const [Status, setStatus] = useState();
  const [Time1, setTime1] = useState();
  const [Time2, setTime2] = useState();
  const [Time3, setTime3] = useState();

  const [updateCourt] = useUpdateCourtMutation();

  const handleUpdateCourt = async () => {
    await updateCourt({ CourtID: courtId, CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3  });
    refetch();
    navigation.goBack();
  };

  useEffect(() => {
    if (court) {
      setCourtName(court.CourtName);
      setPricePerHour(court.PricePerHour.toString());
      setConditions(court.Conditions);
      setLocation(court.Location);
      setStatus(court.Status);
      setTime1(court.time1);
      setTime2(court.time2);
      setTime3(court.time3);
    }
  }, [court]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modify Court</Text>
      <TextInput
        style={styles.input}
        placeholder="Court Name"
        value={CourtName}
        onChangeText={setCourtName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price Per Hour"
        value={PricePerHour}
        onChangeText={setPricePerHour}
      />
      <TextInput
        style={styles.input}
        placeholder="Conditions"
        value={Conditions}
        onChangeText={setConditions}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={Location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Status"
        value={Status}
        onChangeText={setStatus}
      />
      <TextInput
        style={styles.input}
        placeholder="Time 1"
        value={Time1}
        onChangeText={setTime1}
      />
      <TextInput
        style={styles.input}
        placeholder="Time 2"
        value={Time2}
        onChangeText={setTime2}
      />
      <TextInput
        style={styles.input}
        placeholder="Time 3"
        value={Time3}
        onChangeText={setTime3}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateCourt}>
        <Ionicons name="save-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Update Court</Text>
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

export default ModifyCourtPage;