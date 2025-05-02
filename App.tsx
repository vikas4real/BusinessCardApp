import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import BottomTabNavigation from './src/navigation/BottomTabNavigation';
import nfcManager from 'react-native-nfc-manager';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
nfcManager.start();
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Main" component={BottomTabNavigation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
