import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from 'expo-router'

export default function home() {

    const navigation = useNavigation();

  return (
    <View className='flex-1 justify-center items-center'>
      <View className='flex-1 justify-center items-center' >
        <Text className='absolute top-11  bottom-0 mt-20 text-3xl'> Welcom to BaatCheet </Text>
        <TouchableOpacity className='bg-blue-500 m-3 rounded-full justify-center items-center'
        style={{
            width:200,
            height:55
        }}
        onPress={
            ()=>{
                navigation.navigate('signup')
            }
        }
       >
            <Text> Sign up</Text>
        
        </TouchableOpacity>
        <TouchableOpacity className='bg-blue-500 m-3 rounded-full justify-center items-center'
        style={{
            width:200,
            height:55
        }}
        onPress={
            ()=>{
                navigation.navigate('login')
            }
        }
        >
            <Text> Log in</Text>
        
        </TouchableOpacity>
      </View>
    </View>
  )
}