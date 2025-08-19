import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useGetCourtsQuery, useUpdateCourtMutation, useDeleteCourtMutation } from '../services/courtsApi';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HomePage = ({ navigation }) => {
  const { data: courts, error, isLoading, refetch } = useGetCourtsQuery();
  const role = useSelector((state) => state.login.role);
  const [updateCourt] = useUpdateCourtMutation();
  const [deleteCourt] = useDeleteCourtMutation();
  const [sortedCourts, setSortedCourts] = useState([]);

  //const pan = useRef(new Animated.ValueXY()).current;// theo doi vi tri x y cua icon chatbot

  // const panResponder = useRef(
  //   PanResponder.create({
  //     onMoveShouldSetPanResponder: () => true,
  //     onPanResponderMove: Animated.event(
  //       [null, { dx: pan.x, dy: pan.y }], // dx va dy la vi tri chuot theo chieu ngang va doc
  //       // chua ro null la gi, native event object?
  //       { useNativeDriver: true } // chua ro ve cai nay, co the lam icon smooth hon
  //     ),
  //     onPanResponderRelease: () => { // khi tha chuot, reset offset de object dung yen 
  //       pan.flattenOffset(); 
  //     },
  //     onPanResponderGrant: () => { // khi giu chuot, set offset de object di chuyen theo chuot
  //       pan.setOffset({
  //         x: pan.x._value,
  //         y: pan.y._value, // gia tri hien tai 
  //       });
  //     },
  //   })
  // ).current; // current di chung voi useRef, muc dich la giu lai gia tri 

  // khi fetch xong data, set sortedCourts = courts
  useEffect(() => {
    if (courts) {
      setSortedCourts(courts);
    }
  }, [courts]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      if (courts) {
        courts.forEach((court) => {
          const HMS = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false });

          // Check occupied
          if (court.Time1Status === 'Occupied' && court.Time2Status === 'Occupied' && court.Time3Status === 'Occupied') {
            updateCourt({ CourtID: court.CourtID, Status: 'Occupied' });
          } else if (court.Time1Status === 'Passed' && court.Time2Status === 'Passed' && court.Time3Status === 'Passed') {
            // Check passed
            updateCourt({ CourtID: court.CourtID, Status: 'Passed' });
          } else {
            updateCourt({ CourtID: court.CourtID, Status: 'Available' });
          }

          // Update time slots
          if (court.Time1Status === 'Free' && HMS >= court.time1) {
            updateCourt({ CourtID: court.CourtID, Time1Status: 'Passed' });
          }
          if (court.Time2Status === 'Free' && HMS >= court.time2) {
            updateCourt({ CourtID: court.CourtID, Time2Status: 'Passed' });
          }
          if (court.Time3Status === 'Free' && HMS >= court.time3) {
            updateCourt({ CourtID: court.CourtID, Time3Status: 'Passed' });
          }

          // Reset court status to Free 
          if (court.Time1Status === 'Passed' && HMS < court.time1) {
            updateCourt({ CourtID: court.CourtID, Time1Status: 'Free' });
          }
          if (court.Time2Status === 'Passed' && HMS < court.time2) {
            updateCourt({ CourtID: court.CourtID, Time2Status: 'Free' });
          }
          if (court.Time3Status === 'Passed' && HMS < court.time3) {
            updateCourt({ CourtID: court.CourtID, Time3Status: 'Free' });
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [courts, refetch, updateCourt]);

  const sortCourts = () => {
    const sorted = [...courts].sort((a, b) => { // a va b dai dien cho cac san
      const aFreeSlots = [a.Time1Status, a.Time2Status, a.Time3Status].filter(status => status === 'Free').length;
      const bFreeSlots = [b.Time1Status, b.Time2Status, b.Time3Status].filter(status => status === 'Free').length;
      return bFreeSlots - aFreeSlots; // court nao free nhieu nhat thi len dau
    });
    setSortedCourts(sorted);
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time.slice(0, 5); // cut the seconds part
  };

  const CheckAllTimeSlotsPassed = (court) => {
    return ['Time1Status', 'Time2Status', 'Time3Status'].every(status => court[status] === 'Passed');
  };
  
  const CheckAllTimeSlotsOccupied = (court) => {
    return ['Time1Status', 'Time2Status', 'Time3Status'].every(status => court[status] === 'Occupied');
  };

  const CheckAllTimeSlot = (court) => {
    const statuses = [court.Time1Status, court.Time2Status, court.Time3Status];
    const passedCount = statuses.filter(status => status === 'Passed').length;
    const occupiedCount = statuses.filter(status => status === 'Occupied').length;
    return (passedCount === 1 && occupiedCount === 2) || (passedCount === 2 && occupiedCount === 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Account')}>
          <Ionicons name="person-circle-outline" size={24} color="white" />
          <Text style={styles.headerButtonText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Appointments')}>
          <Ionicons name="calendar-outline" size={24} color="white" />
          <Text style={styles.headerButtonText}>Appointments</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Courts</Text>
      <TouchableOpacity style={styles.sortButton} onPress={sortCourts}>
        <Text style={styles.sortButtonText}>See Free Slots</Text>
      </TouchableOpacity>
      <FlatList
        data={sortedCourts}
        keyExtractor={(item) => item.CourtID.toString()}
        renderItem={({ item }) => (
          <View style={styles.courtItem}>
            <Text style={styles.courtName}>{item.CourtName}</Text>
            <Text style={styles.courtDetail}><Ionicons name="information-circle-outline" size={16} />{item.Status}</Text>
            <Text style={styles.courtDetail}><Ionicons name="cash-outline" size={16} /> ${item.PricePerHour}</Text>
            <Text style={styles.courtDetail}><Ionicons name="alert-circle-outline" size={16} /> {item.Conditions}</Text>
            <Text style={styles.courtDetail}><Ionicons name="location-outline" size={16} /> {item.Location}</Text>
            <Text style={styles.courtDetail}><Ionicons name="time-outline" size={16} /> {formatTime(item.time1)}: {item.Time1Status}</Text>
            <Text style={styles.courtDetail}><Ionicons name="time-outline" size={16} /> {formatTime(item.time2)}: {item.Time2Status}</Text>
            <Text style={styles.courtDetail}><Ionicons name="time-outline" size={16} /> {formatTime(item.time3)}: {item.Time3Status}</Text>
            <TouchableOpacity
              style={[styles.button, (CheckAllTimeSlotsPassed(item) || CheckAllTimeSlotsOccupied(item) || CheckAllTimeSlot(item)) && styles.disabledButton]}
              onPress={() => navigation.navigate('Set Appointment', { courtId: item.CourtID })}
              disabled={CheckAllTimeSlotsPassed(item) || CheckAllTimeSlotsOccupied(item) || CheckAllTimeSlot(item)}
            >
              <Text style={styles.buttonText}>Set Appointment</Text>
            </TouchableOpacity>
            {role === 'admin' && (
              <>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Modify Court', { courtId: item.CourtID })}>
                  <Text style={styles.buttonText}>Modify Court</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteCourt(item.CourtID)}>
                  <Text style={styles.buttonText}>Delete Court</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
      {role === 'admin' && (
        <View style={styles.adminControls}>
          <Text style={styles.adminTitle}>Admin Section</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Manage Accounts')}>
            <Text style={styles.buttonText}>Manage Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Add Court')}>
            <Text style={styles.buttonText}>Add Court</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Manage Appointments')}>
            <Text style={styles.buttonText}>Manage Appointments</Text>
          </TouchableOpacity>
        </View>
      )}
      {role === 'manager' && (
        <View style={styles.adminControls}>
          <Text style={styles.adminTitle}>Manager Section</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Manage Appointments')}>
            <Text style={styles.buttonText}>Manage Appointments</Text>
          </TouchableOpacity>
        </View>
      )}
      <Animated.View
        // style={[styles.chatIcon, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
        // {...panResponder.panHandlers}
        style={[styles.chatIcon]}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Chatbot')}>
          <Icon name="chat" size={50} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4682b4',
    padding: 10,
    borderRadius: 5,
  },
  headerButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: '#4682b4',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  sortButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  courtItem: {
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
  courtName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#4682b4',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  adminControls: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#e6e6fa',
    borderRadius: 10,
  },
  adminTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 16,
  },
  chatIcon: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  courtDetail: {
    fontSize: 16,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
});

export default HomePage;