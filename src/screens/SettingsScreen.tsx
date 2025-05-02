import {Alert, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native';
const SettingsScreen = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const clearAllData = async () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>App Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Theme</Text>
          <TouchableOpacity
            style={styles.themeToggleButton}
            onPress={toggleTheme}>
            <Text style={styles.themeToggleText}>
              {theme === 'light' ? 'Light' : 'Dark'}
            </Text>
            <Icon
              name={theme === 'light' ? 'weather-sunny' : 'weather-night'}
              size={24}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.clearDataButton} onPress={clearAllData}>
          <Text style={styles.clearDataButtonText}>Clear All Data</Text>
        </TouchableOpacity>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>NFC Business Card v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2025 All rights reserved</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#555',
  },
  themeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    marginRight: 8,
    fontSize: 16,
    color: '#555',
  },
  clearDataButton: {
    backgroundColor: '#ff6347',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  clearDataButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#999',
  },
});
export default SettingsScreen;
