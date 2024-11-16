import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword } from '@firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import SimpleToast from 'react-native-simple-toast';
import app from '../firebase.Config';

const database = getDatabase();
const auth = getAuth(app);

export default function Signup() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  // Handle user sign up
  const handleSignin = async () => {
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile in Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        email: email,
        name: name,
        about: about,
        createdAt: new Date().toISOString(),
      });

      // Show success message
      SimpleToast.show('Sign-Up Successful! Please log in.', SimpleToast.LONG);

      // After the toast, navigate to the login screen
      setTimeout(() => {
        navigation.navigate('login');
      }, 2000); // Wait 2 seconds before navigating

    } catch (error) {
      console.error('Sign up error:', error);
      SimpleToast.show('Sign-Up Failed! ' + error.message, SimpleToast.LONG);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Text style={{ position: 'absolute', top: 50, fontSize: 24, fontWeight: 'bold' }}>
            Create Account on BaatCheet
          </Text>

          <TextInput
            className='border-2 border-black m-2'
            style={{ width: 300 }}
            placeholder='Enter your Name'
            onChangeText={value => setName(value)}
          />

          <TextInput
            className='border-2 border-black m-2'
            style={{ width: 300 }}
            placeholder='Enter your Email'
            onChangeText={value => setEmail(value)}
          />

          <TextInput
            className='border-2 border-black m-2'
            style={{ width: 300 }}
            placeholder='Enter your Password'
            secureTextEntry
            onChangeText={value => setPassword(value)}
          />

          <TextInput
            className='border-2 border-black m-2'
            style={{ width: 300 }}
            placeholder='Enter About you'
            onChangeText={value => setAbout(value)}
          />

          <TouchableOpacity
            className='bg-blue-500 m-3 rounded-full justify-center items-center'
            style={{ width: 150, height: 55 }}
            onPress={handleSignin}
          >
            <Text>Sign up</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text>
            Already have an Account?{' '}
            <Text
              style={{ color: 'blue' }}
              onPress={() => navigation.navigate('login')}
            >
              Login In
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
