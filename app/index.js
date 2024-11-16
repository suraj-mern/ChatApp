import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './screens/AuthContext';  // Ensure the correct path
import home from './screens/home';
import signup from './screens/signup';
import login from './screens/login';
import homechat from './screens/homechat';
import ChatRoom from './screens/ChatRoom';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    // Wrap the entire app with AuthProvider
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}

function AppNavigation() {
  const { user } = useAuth();  // Access user from AuthContext

  useEffect(() => {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Authentication persistence set to local.');
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If user is logged in, show homechat screen
        <>
          <Stack.Screen name="homechat" component={homechat} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} />
        </>
      ) : (
        // If user is not logged in, show login and signup screens
        <>
          <Stack.Screen name="home" component={home} />
          <Stack.Screen name="signup" component={signup} />
          <Stack.Screen name="login" component={login} />
        </>
      )}
    </Stack.Navigator>
  );
}
