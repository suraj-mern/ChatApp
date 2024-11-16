import { View, Text, FlatList } from 'react-native'
import React from 'react'
import Chatlist from './chatlist'

export default function list({user}) {
  return (
    <View className='flex-1'>
      <FlatList data={user}
      contentContainerStyle={{flex:1,paddingVertical:25}}
      keyExtractor={item=>Math.random()}
      showsVerticalScrollIndicator={false}
      renderItem={({item,index})=> <Chatlist item={item} index={index}/>}
      />
                 
    </View>
  )
}