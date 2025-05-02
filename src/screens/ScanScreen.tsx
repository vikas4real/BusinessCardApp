import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import nfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ScanScreen = () => {
  const [scanning, setScanning] = useState(false);

  const startNfcScan = async () => {
    try {
      setScanning(true);

      // Check if NFC is supported
      const isSupported = await nfcManager.isSupported();
      if (!isSupported) {
        Alert.alert('Error', 'NFC is not supported on this device');
        setScanning(false);
        return;
      }

      // Request technology
      await nfcManager.requestTechnology(NfcTech.Ndef);

      // Register for tag discovery
      const tag = await nfcManager.getTag();
      console.log('Tag found:', tag);

      // Parse NDEF messages
      if (tag && tag.ndefMessage && tag.ndefMessage.length > 0) {
        const message = tag.ndefMessage[0];
        const text = Ndef.text.decodePayload(Uint8Array.from(message.payload));

        // If it's a URL, open it
        if (text.startsWith('http')) {
          await Linking.openURL(text);
        } else {
          Alert.alert('Contact Info Received', text);
        }
      } else {
        Alert.alert('Error', 'No NDEF message found on the tag');
      }
    } catch (error) {
      console.error('Error scanning NFC:', error);
      if (
        error instanceof Error &&
        error.message !== 'User cancelled NFC session'
      ) {
        Alert.alert('Error', 'Failed to scan NFC tag');
      }
    } finally {
      // Cancel any pending NFC operations
      nfcManager.cancelTechnologyRequest();
      setScanning(false);
    }
  };

  const scanQrCode = () => {
    // In a real app, you would use a QR code scanner library
    Alert.alert(
      'Feature Note',
      'QR code scanning would be implemented using react-native-camera or similar in a complete app.',
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.scanCard}>
        <Text style={styles.scanTitle}>Scan Business Cards</Text>

        <View style={styles.scanButtonsContainer}>
          <TouchableOpacity
            style={[styles.scanButton, scanning && styles.scanningButton]}
            onPress={startNfcScan}
            disabled={scanning}>
            <Icon name="nfc" size={32} color="white" />
            <Text style={styles.scanButtonText}>
              {scanning ? 'Scanning for NFC...' : 'Scan NFC Card'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.scanButton} onPress={scanQrCode}>
            <Icon name="qrcode-scan" size={32} color="white" />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.scanInstructions}>
          Hold your phone near an NFC business card or scan a QR code to add a
          new contact
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  scanButtonsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#4287f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  scanningButton: {
    backgroundColor: '#f5a742',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 12,
  },
  scanInstructions: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
export default ScanScreen;
