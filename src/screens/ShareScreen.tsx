import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import nfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ShareScreen = () => {
  const [profile, setProfile] = useState<{
    name: string;
    title: string;
    company: string;
    phone: string;
    email: string;
    website: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  }>({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    linkedin: '',
    twitter: '',
    instagram: '',
  });
  const [qrValue, setQrValue] = useState('');
  const [nfcSupported, setNfcSupported] = useState(false);

  useEffect(() => {
    loadProfile();
    checkNfcSupport();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile !== null) {
        const profileData = JSON.parse(savedProfile);
        setProfile(profileData);

        // Create URL for QR code
        const profileUrl = createProfileUrl(profileData);
        setQrValue(profileUrl);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const checkNfcSupport = async () => {
    const supported = await nfcManager.isSupported();
    setNfcSupported(supported && Platform.OS === 'android');
  };

  const createProfileUrl = (profileData: any) => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profileData.name || ''}`,
      `TITLE:${profileData.title || ''}`,
      `ORG:${profileData.company || ''}`,
      `TEL:${profileData.phone || ''}`,
      `EMAIL:${profileData.email || ''}`,
      `URL:${profileData.website || ''}`,
      `X-SOCIALPROFILE;type=linkedin:${profileData.linkedin || ''}`,
      `X-SOCIALPROFILE;type=twitter:${profileData.twitter || ''}`,
      `X-SOCIALPROFILE;type=instagram:${profileData.instagram || ''}`,
      'END:VCARD',
    ].join('\\n');

    return `data:text/vcard;${vCardData}`;
  };

  useEffect(() => {
    const checkNfcSupport = async () => {
      try {
        // Check if NFC is supported
        const isSupported = await nfcManager.isSupported();
        setNfcSupported(isSupported);

        if (isSupported) {
          // Start NFC manager if supported
          await nfcManager.start();
        }
      } catch (error) {
        console.error('Error checking NFC support:', error);
        setNfcSupported(false);
      }
    };

    checkNfcSupport();

    // Clean up when component unmounts
    return () => {
      nfcManager.cancelTechnologyRequest().catch(() => {});
      nfcManager.unregisterTagEvent().catch(() => {});
    };
  }, []);

  const handleNfcShare = async () => {
    try {
      // Check if the device supports NFC
      if (!nfcSupported) {
        Alert.alert('Error', 'NFC is not supported on this device');
        return;
      }

      // Validate qrValue before proceeding
      if (!qrValue) {
        Alert.alert('Error', 'No content to share via NFC');
        return;
      }

      // Request technology with timeout handling
      const tech = await Promise.race([
        nfcManager.requestTechnology(NfcTech.Ndef),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('NFC request timed out')), 5000),
        ),
      ]);

      // Create an NDEF message
      const uriRecord = Ndef.uriRecord(qrValue);

      // Write the message
      const writeResult = await nfcManager.ndefHandler.writeNdefMessage(
        Ndef.encodeMessage([uriRecord]),
      );
      console.log('Write successful:', writeResult);

      Alert.alert(
        'Success',
        'Ready to share. Hold your phone near another NFC-enabled device.',
      );
    } catch (error) {
      console.error('Error sharing via NFC:', error);

      // More specific error messages based on error type
      if (error instanceof Error && error.message.includes('user canceled')) {
        Alert.alert('Cancelled', 'NFC operation was cancelled');
      } else if (
        error instanceof Error &&
        error.message.includes('timed out')
      ) {
        Alert.alert('Timeout', 'NFC operation timed out. Please try again.');
      } else {
        Alert.alert(
          'Error',
          `Failed to share via NFC: ${
            (error instanceof Error && error.message) || 'Unknown error'
          }`,
        );
      }
    } finally {
      // Cancel any pending NFC operations
      nfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const handleShareVCard = async () => {
    try {
      // Create vCard content
      const vCardContent = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${profile.name || ''}`,
        `TITLE:${profile.title || ''}`,
        `ORG:${profile.company || ''}`,
        `TEL:${profile.phone || ''}`,
        `EMAIL:${profile.email || ''}`,
        `URL:${profile.website || ''}`,
        'END:VCARD',
      ].join('\n');

      // Create a temporary file path
      const filePath = `${RNFS.CachesDirectoryPath}/contact.vcf`;

      // Write the vCard content to the file
      await RNFS.writeFile(filePath, vCardContent, 'utf8');

      // Share the file
      await Share.open({
        url: `file://${filePath}`,
        type: 'text/vcard',
        title: 'Share Contact Information',
      });
    } catch (error) {
      console.error('Error sharing vCard:', error);
      if (error instanceof Error && error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share contact information');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.shareCard}>
        <Text style={styles.shareTitle}>Share Your Digital Card</Text>
        <View style={styles.qrContainer}>
          {qrValue ? (
            <QRCode
              value={qrValue}
              size={200}
              color="black"
              backgroundColor="white"
            />
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text>Add profile info first</Text>
            </View>
          )}
        </View>

        <Text style={styles.shareSubtitle}>
          Scan this QR code to share your details
        </Text>

        <View style={styles.shareButtonsContainer}>
          {nfcSupported && (
            <TouchableOpacity style={styles.nfcButton} onPress={handleNfcShare}>
              <Icon name="nfc" size={24} color="white" />
              <Text style={styles.nfcButtonText}>Share via NFC</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.vcardButton}
            onPress={handleShareVCard}>
            <Icon name="card-account-mail" size={24} color="white" />
            <Text style={styles.vcardButtonText}>Share as vCard</Text>
          </TouchableOpacity>
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
  shareCard: {
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
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  shareButtonsContainer: {
    width: '100%',
  },
  nfcButton: {
    backgroundColor: '#4287f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  nfcButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  vcardButton: {
    backgroundColor: '#3cb371',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  vcardButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
export default ShareScreen;
