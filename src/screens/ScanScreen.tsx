import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import nfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
const ScanScreen = () => {
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  useEffect(() => {
    const checkNfc = async () => {
      try {
        // Check if NFC is supported
        const isSupported = await nfcManager.isSupported();
        setNfcSupported(isSupported);

        if (isSupported) {
          await nfcManager.start();
        }
      } catch (error) {
        console.error('Error initializing NFC:', error);
      }
    };

    checkNfc();

    // Clean up NFC manager when component unmounts
    return () => {
      const cleanUp = async () => {
        if (scanning) {
          try {
            await nfcManager.cancelTechnologyRequest();
          } catch (error) {
            console.error('Error cleaning up NFC:', error);
          }
        }
        nfcManager.unregisterTagEvent();
      };

      cleanUp();
    };
  }, [scanning]);

  const startNfcScan = async () => {
    try {
      setScanning(true);

      if (!nfcSupported) {
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

      // Handle specific NFC errors with better user messaging
      if (error instanceof Error) {
        if (error.message === 'User cancelled NFC session') {
          // User cancelled, no need to show an error
          console.log('NFC scan was cancelled by user');
        } else if (error.message.includes('NFC hardware')) {
          Alert.alert(
            'NFC Error',
            'Please ensure NFC is enabled in your device settings',
          );
        } else if (error.message.includes('timeout')) {
          Alert.alert('Timeout', 'NFC scan timed out. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to scan NFC tag: ' + error.message);
        }
      }
    } finally {
      // Cancel any pending NFC operations
      try {
        await nfcManager.cancelTechnologyRequest();
      } catch (error) {
        console.error('Error cancelling NFC technology request:', error);
      }
      setScanning(false);
    }
  };

  const scanQrCode = () => {
    setShowQrScanner(true);
  };
  const onQrCodeScanned = async (event: any) => {
    try {
      const {data} = event;
      console.log('QR code scanned:', data);

      setShowQrScanner(false);

      // If it's a URL, open it
      if (data.startsWith('http')) {
        await Linking.openURL(data);
      } else {
        // Assuming the QR contains contact info
        Alert.alert('Contact Info Received', data);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code');
    }
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

        {!nfcSupported && (
          <View style={styles.warningContainer}>
            <Icon name="alert-circle" size={24} color="#f44336" />
            <Text style={styles.warningText}>
              NFC is not supported on this device
            </Text>
          </View>
        )}

        <Text style={styles.scanInstructions}>
          Hold your phone near an NFC business card or scan a QR code to add a
          new contact
        </Text>
      </View>
      {showQrScanner && (
        <View style={styles.qrScannerContainer}>
          <QRCodeScanner
            onRead={onQrCodeScanned}
            flashMode={RNCamera.Constants.FlashMode.auto}
            topContent={
              <Text style={styles.qrScannerText}>
                Scan a QR code business card
              </Text>
            }
            bottomContent={
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowQrScanner(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    color: '#d32f2f',
    marginLeft: 8,
    fontSize: 14,
  },
  qrScannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 1000,
  },
  qrScannerText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanScreen;
