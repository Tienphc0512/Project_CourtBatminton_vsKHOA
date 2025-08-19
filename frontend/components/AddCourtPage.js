import React, { useState } from 'react';
import { useCreateCourtMutation } from '../services/courtsApi';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddCourtPage = ({ navigation }) => {
  const [CourtName, setCourtName] = useState('');
  const [PricePerHour, setPricePerHour] = useState('');
  const [Conditions, setConditions] = useState('');
  const [Location, setLocation] = useState('');
  const [Status, setStatus] = useState('Available');
  const [Time1, setTime1] = useState('');
  const [Time2, setTime2] = useState('');
  const [Time3, setTime3] = useState('');

  const [createCourt] = useCreateCourtMutation();

  const handleAddCourt = async () => {
    try {
      await createCourt({ CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3 }).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add court:', error);
    }
  };

  // const handleAddCourt = async () => {
  //   try {
  //     const result = await createCourt({ CourtName, PricePerHour, Conditions, Location, Status, Time1, Time2, Time3 });
      
  //     if (result.error) {
  //       throw new Error(result.error);
  //     }
  
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error('Failed to add court:', error);
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Court</Text>
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
        placeholder="Conditions must be Excellent, Good, Fair, or Poor"
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
        placeholder="Time1 must be in the format HH:MM:SS"
        value={Time1}
        onChangeText={setTime1}
      />
      <TextInput
        style={styles.input}
        placeholder="Time2 must be in the format HH:MM:SS"
        value={Time2}
        onChangeText={setTime2}
      />
      <TextInput
        style={styles.input}
        placeholder="Time3 must be in the format HH:MM:SS"
        value={Time3}
        onChangeText={setTime3}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddCourt}>
        <Ionicons name="add-circle-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Add Court</Text>
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

export default AddCourtPage;