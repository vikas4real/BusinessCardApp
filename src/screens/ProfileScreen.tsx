import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    profileImage: null,
  });

  const [errors, setErrors] = useState<{
    email?: string;
    phone?: string;
    website?: string;
  }>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile !== null) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    // Email validation
    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // URL validation for website
    if (
      profile.website &&
      !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}([\/\w-]*)*\/?$/.test(
        profile.website,
      )
    ) {
      newErrors.website = 'Please enter a valid website URL';
      isValid = false;
    }

    // Phone validation (simple check)
    if (
      profile.phone &&
      !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(profile.phone)
    ) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      setEditing(false);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    Alert.alert(
      'Select Profile Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => handleCameraLaunch(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleGalleryLaunch(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const handleCameraLaunch = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 'high',
    };

    launchCamera(options, response => {
      handleImagePickerResponse(response);
    });
  };

  const handleGalleryLaunch = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      handleImagePickerResponse(response);
    });
  };

  const handleImagePickerResponse = (response: any) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
      Alert.alert('Error', 'Failed to pick image');
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      setProfile({
        ...profile,
        profileImage: selectedImage.uri,
      });
    }
  };

  const removeProfileImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove your profile image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setProfile({
              ...profile,
              profileImage: null,
            });
          },
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4287f5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (editing) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView style={styles.container}>
          <View style={styles.editForm}>
            <View style={styles.imageContainer}>
              {profile.profileImage ? (
                <View>
                  <Image
                    source={{uri: profile.profileImage}}
                    style={styles.editProfileImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeProfileImage}>
                    <Icon name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.editProfileImagePlaceholder}>
                  <Icon name="account" size={60} color="#ccc" />
                </View>
              )}
              <TouchableOpacity
                style={styles.imageButton}
                onPress={selectImage}>
                <Icon
                  name="camera"
                  size={18}
                  color="#4287f5"
                  style={styles.buttonIcon}
                />
                <Text style={styles.imageButtonText}>
                  {profile.profileImage ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={text => setProfile({...profile, name: text})}
              placeholder="John Doe"
            />

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={profile.title}
              onChangeText={text => setProfile({...profile, title: text})}
              placeholder="Product Manager"
            />

            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              value={profile.company}
              onChangeText={text => setProfile({...profile, company: text})}
              placeholder="Acme Inc."
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={profile.phone}
              onChangeText={text => {
                setProfile({...profile, phone: text});
                if (errors.phone) {
                  const newErrors = {...errors};
                  delete newErrors.phone;
                  setErrors(newErrors);
                }
              }}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={profile.email}
              onChangeText={text => {
                setProfile({...profile, email: text});
                if (errors.email) {
                  const newErrors = {...errors};
                  delete newErrors.email;
                  setErrors(newErrors);
                }
              }}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <Text style={styles.label}>Website</Text>
            <TextInput
              style={[styles.input, errors.website ? styles.inputError : null]}
              value={profile.website}
              onChangeText={text => {
                setProfile({...profile, website: text});
                if (errors.website) {
                  const newErrors = {...errors};
                  delete newErrors.website;
                  setErrors(newErrors);
                }
              }}
              placeholder="https://example.com"
              autoCapitalize="none"
            />
            {errors.website ? (
              <Text style={styles.errorText}>{errors.website}</Text>
            ) : null}

            <Text style={styles.sectionHeader}>Social Media</Text>

            <Text style={styles.label}>LinkedIn</Text>
            <View style={styles.socialInputContainer}>
              <Icon
                name="linkedin"
                size={20}
                color="#0077B5"
                style={styles.socialInputIcon}
              />
              <TextInput
                style={styles.socialInput}
                value={profile.linkedin}
                onChangeText={text => setProfile({...profile, linkedin: text})}
                placeholder="linkedin.com/in/johndoe"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Twitter</Text>
            <View style={styles.socialInputContainer}>
              <Icon
                name="twitter"
                size={20}
                color="#1DA1F2"
                style={styles.socialInputIcon}
              />
              <TextInput
                style={styles.socialInput}
                value={profile.twitter}
                onChangeText={text => setProfile({...profile, twitter: text})}
                placeholder="@johndoe"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Instagram</Text>
            <View style={styles.socialInputContainer}>
              <Icon
                name="instagram"
                size={20}
                color="#E1306C"
                style={styles.socialInputIcon}
              />
              <TextInput
                style={styles.socialInput}
                value={profile.instagram}
                onChangeText={text => setProfile({...profile, instagram: text})}
                placeholder="@johndoe"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Icon
                  name="check"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  loadProfile();
                  setEditing(false);
                }}>
                <Icon
                  name="close"
                  size={20}
                  color="#555"
                  style={styles.buttonIcon}
                />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.coverPhoto}>
          <TouchableOpacity
            style={styles.editButtonSmall}
            onPress={() => setEditing(true)}>
            <Icon name="pencil" size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileImageContainer}>
          {profile.profileImage ? (
            <Image
              source={{uri: profile.profileImage}}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="account" size={60} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.profileInfoContainer}>
          <Text style={styles.profileName}>
            {profile.name || 'Add Your Name'}
          </Text>
          <Text style={styles.profileTitle}>
            {profile.title || 'Add Your Title'}
          </Text>
          {profile.company ? (
            <View style={styles.companyContainer}>
              <Icon name="office-building" size={16} color="#777" />
              <Text style={styles.profileCompany}>{profile.company}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.contactInfoContainer}>
            {profile.phone && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
                <Icon name="phone" size={20} color="#4287f5" />
                <Text style={styles.contactText}>{profile.phone}</Text>
              </TouchableOpacity>
            )}

            {profile.email && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${profile.email}`)}>
                <Icon name="email" size={20} color="#4287f5" />
                <Text style={styles.contactText}>{profile.email}</Text>
              </TouchableOpacity>
            )}

            {profile.website && (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => {
                  const url = profile.website.startsWith('http')
                    ? profile.website
                    : `https://${profile.website}`;
                  Linking.openURL(url);
                }}>
                <Icon name="web" size={20} color="#4287f5" />
                <Text style={styles.contactText}>{profile.website}</Text>
              </TouchableOpacity>
            )}
          </View>

          {(profile.linkedin || profile.twitter || profile.instagram) && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Connect</Text>
            </>
          )}

          <View style={styles.socialContainer}>
            {profile.linkedin && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => {
                  const linkedinHandle = profile.linkedin.replace(
                    'linkedin.com/in/',
                    '',
                  );
                  Linking.openURL(`https://linkedin.com/in/${linkedinHandle}`);
                }}>
                <Icon name="linkedin" size={24} color="#0077B5" />
                <Text style={styles.socialLabel}>LinkedIn</Text>
              </TouchableOpacity>
            )}

            {profile.twitter && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => {
                  const twitterHandle = profile.twitter.replace('@', '');
                  Linking.openURL(`https://x.com/${twitterHandle}`);
                }}>
                <Icon name="twitter" size={24} color="#1DA1F2" />
                <Text style={styles.socialLabel}>Twitter</Text>
              </TouchableOpacity>
            )}

            {profile.instagram && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => {
                  const instagramHandle = profile.instagram.replace('@', '');
                  Linking.openURL(`https://instagram.com/${instagramHandle}`);
                }}>
                <Icon name="instagram" size={24} color="#E1306C" />
                <Text style={styles.socialLabel}>Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditing(true)}>
          <Icon
            name="account-edit"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  coverPhoto: {
    backgroundColor: '#4287f5',
    height: 100,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
  },
  editButtonSmall: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginTop: -50,
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 75,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfoContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileCompany: {
    fontSize: 16,
    color: '#777',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginVertical: 16,
  },
  contactInfoContainer: {
    width: '100%',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  socialButton: {
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 8,
    alignItems: 'center',
  },
  socialLabel: {
    marginTop: 4,
    color: '#555',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#4287f5',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editForm: {
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  editProfileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: -12,
    marginBottom: 12,
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
    color: '#333',
  },
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  socialInputIcon: {
    paddingHorizontal: 12,
  },
  socialInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#4287f5',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#4287f5',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 6,
  },
});

export default ProfileScreen;
