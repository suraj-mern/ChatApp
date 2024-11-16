import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from '@firebase/auth';
import app from '../firebase.Config';

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  // Handle user sign in
  const handleSignin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user);
      navigation.navigate('homechat');
      console.log("Sign In successfully");
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        console.error('Invalid email address.');
      } else if (error.code === 'auth/user-not-found') {
        console.error('No user found for this email.');
      } else if (error.code === 'auth/wrong-password') {
        console.error('Incorrect password.');
      } else {
        console.error('Login error:', error);
      }
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
            Welcome Back to BaatCheet
          </Text>

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

          <TouchableOpacity
            className='bg-blue-500 m-3 rounded-full justify-center items-center'
            style={{ width: 150, height: 55 }}
            onPress={() => handleSignin(email, password)}
          >
            <Text>Log In</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text>
            New user? Create an Account{' '}
            <Text
              style={{ color: 'blue' }}
              onPress={() => navigation.navigate('signup')}
            >
              Sign up
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
