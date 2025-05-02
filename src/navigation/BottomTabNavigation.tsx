import {StyleSheet} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from '../screens/ProfileScreen';
import ShareScreen from '../screens/ShareScreen';
import ScanScreen from '../screens/ScanScreen';
import SettingsScreen from '../screens/SettingsScreen';
const BottomTabNavigation = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = 'badge-account';
          } else if (route.name === 'Share') {
            iconName = 'share-variant';
          } else if (route.name === 'Scan') {
            iconName = 'qrcode-scan';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }

          return (
            <Icon name={iconName || 'help-circle'} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: '#4287f5',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'My Profile'}}
      />
      <Tab.Screen
        name="Share"
        component={ShareScreen}
        options={{title: 'Share Card'}}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{title: 'Scan Cards'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigation;
