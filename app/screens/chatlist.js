import { View, Text, TouchableOpacity,Image } from 'react-native'
import React from 'react'

export default function chatlist({item}) {
  return (
    <TouchableOpacity className='flex-row justify-between mx-4 items-center gap-3 mb-4 pb-2 border-b border-b-neutral-200'>
        <Image source={require('../../assets/images/favicon.png')} 
        style={{height:50,width:50}}
        className='rounded-full'
        />
        <View className="flex-1 gap-1">
            <View className="flex-row justify-between">
<Text>Suraj</Text>
            </View>
        </View>
    </TouchableOpacity>
  )
}