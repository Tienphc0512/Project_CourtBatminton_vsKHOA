import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet} from 'react-native';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import AccountPage from './components/AccountPage';
import AppointmentsPage from './components/AppointmentsPage';
import ManageAccountsPage from './components/ManageAccountsPage';
import ModifyCourtPage from './components/ModifyCourtPage';
import ModifyAccountPage from './components/ModifyAccountPage';
import RegisterPage from './components/RegisterPage';
import SetAppointmentPage from './components/SetAppointmentPage';
import AddCourtPage from './components/AddCourtPage';
import ManageAppointmentsPage from './components/ManageAppointmentsPage';
import Chatbot from './components/Chatbot';
import PaymentPage from './components/PaymentPage';


const Stack = createStackNavigator();

function AppNavigator() {
  const token = useSelector((state) => state.login.token);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={token ? "Home" : "Login"}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={HomePage}/>
            <Stack.Screen name="Account" component={AccountPage} />
            <Stack.Screen name="Appointments" component={AppointmentsPage} />
            <Stack.Screen name="Manage Accounts" component={ManageAccountsPage} />
            <Stack.Screen name="Modify Court" component={ModifyCourtPage} />
            <Stack.Screen name="Modify Account" component={ModifyAccountPage} />
            <Stack.Screen name="Set Appointment" component={SetAppointmentPage} />
            <Stack.Screen name="Add Court" component={AddCourtPage} />
            <Stack.Screen name="Manage Appointments" component={ManageAppointmentsPage} />
            <Stack.Screen name="Chatbot" component={Chatbot} />
            <Stack.Screen name="PaymentPage" component={PaymentPage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4682b4',
    textAlign: 'center',
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#4682b4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  drawerItemText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#ffffff',
  },
});