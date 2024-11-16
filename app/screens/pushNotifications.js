import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Function to request permission and get push token
export async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    alert('Permission for push notifications is required!');
    return;
  }

  // Get the push token
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Get current user
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    // Save token to Firebase Firestore
    const db = getFirestore();
    await setDoc(doc(db, 'users', currentUser.uid), {
      expoPushToken: token.data,  // Save the token in Firestore for the current user
    });
    console.log('Expo Push Token saved:', token.data);
  }
}
