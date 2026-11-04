import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
  Vibration,
} from 'react-native';

import { useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location';

import { useAuth } from '../../context/AuthContext';
import { getContacts } from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuth();

  const [sendingSOS, setSendingSOS] = useState(false);
  const [fakeCallVisible, setFakeCallVisible] = useState(false);
  const [fakeCallAnswered, setFakeCallAnswered] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // VIBRATION DURING INCOMING CALL
  useEffect(() => {
    if (fakeCallVisible && !fakeCallAnswered) {
      Vibration.vibrate([0, 900, 500], true);
    } else {
      Vibration.cancel();
    }

    return () => Vibration.cancel();
  }, [fakeCallVisible, fakeCallAnswered]);

  // CALL TIMER
  useEffect(() => {
    if (!fakeCallVisible || !fakeCallAnswered) return;

    const timer = setInterval(() => {
      setCallSeconds(seconds => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [fakeCallVisible, fakeCallAnswered]);

  const formatCallTime = seconds => {
    const minutes = Math.floor(seconds / 60)
      .toString().padStart(2, '0');

    const remainingSeconds = (seconds % 60)
      .toString().padStart(2, '0');

    return `${minutes}:${remainingSeconds}`;
  };

  // SOS EMERGENCY
  const activateSOS = async () => {
    if (sendingSOS) return;

    try {
      setSendingSOS(true);

      if (!token) {
        Alert.alert('Login required', 'Please log in first.');
        return;
      }

      const response = await getContacts(token);
      const contacts = response.contacts || [];

      const phoneNumbers = contacts
        .map(contact => contact.phone?.trim())
        .filter(phone => phone && phone.length > 0);

      if (phoneNumbers.length === 0) {
        Alert.alert(
          'No emergency contacts',
          'Please add at least one emergency contact before activating SOS.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Contacts',
              onPress: () => router.push('/(tabs)/contacts'),
            },
          ]
        );
        return;
      }

      const smsAvailable = await SMS.isAvailableAsync();

      if (!smsAvailable) {
        Alert.alert(
          'SMS unavailable',
          'SMS is not available on this device.'
        );
        return;
      }

      let locationMessage = 'Location is currently unavailable.';

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const latitude = location.coords.latitude;
          const longitude = location.coords.longitude;

          const mapLink =
            `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

          locationMessage = `My current location:\n${mapLink}`;
        }
      } catch (locationError) {
        console.log('Location error:', locationError);
      }

      const message =
        `EMERGENCY! I need help. Please contact me as soon as possible.\n\n${locationMessage}\n\nSent using my Women Safety App.`;

      await SMS.sendSMSAsync(phoneNumbers, message);

    } catch (error) {
      console.log('SOS error:', error);

      Alert.alert(
        'SOS error',
        error.message || 'Unable to prepare the emergency message.'
      );
    } finally {
      setSendingSOS(false);
    }
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'This will prepare an emergency SMS for all your saved emergency contacts. You will need to tap Send in your SMS app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm SOS',
          style: 'destructive',
          onPress: activateSOS,
        },
      ]
    );
  };

  // FAKE CALL FUNCTIONS
  const startFakeCall = () => {
    setFakeCallAnswered(false);
    setCallSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setFakeCallVisible(true);
  };

  const declineFakeCall = () => {
    Vibration.cancel();
    setFakeCallVisible(false);
    setFakeCallAnswered(false);
    setCallSeconds(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
  };

  const answerFakeCall = () => {
    Vibration.cancel();
    setFakeCallAnswered(true);
    setCallSeconds(0);
  };

  // EMERGENCY HELPLINES
  const callHelpline = async (number, service) => {
    try {
      const phoneUrl = `tel:${number}`;

      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Unable to open dialler',
          `Please dial ${number} for ${service}.`
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Unable to open the phone dialler. Please dial ${number}.`
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>My SafeSpace</Text>

      <Text style={styles.subtitle}>
        Your personal safety companion
      </Text>

      {/* SOS BUTTON */}
      <View style={styles.sosSection}>
        <Pressable
          style={({ pressed }) => [
            styles.sosButton,
            pressed && styles.sosButtonPressed,
            sendingSOS && styles.disabledButton,
          ]}
          onPress={handleSOS}
          disabled={sendingSOS}
        >
          {sendingSOS ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubtext}>EMERGENCY</Text>
            </>
          )}
        </Pressable>

        <Text style={styles.sosHint}>
          Tap the button if you need emergency assistance
        </Text>
      </View>

      {/* QUICK HELP */}
      <Text style={styles.sectionTitle}>Quick Help</Text>

      <View style={styles.featureGrid}>

        {/* FAKE CALL */}
        <Pressable
          style={({ pressed }) => [
            styles.featureCard,
            pressed && styles.cardPressed,
          ]}
          onPress={startFakeCall}
        >
          <Text style={styles.featureIcon}>📞</Text>
          <Text style={styles.featureTitle}>Fake Call</Text>
          <Text style={styles.featureDescription}>
            Simulate an incoming call
          </Text>
        </Pressable>

        {/* CHILDLINE */}
        <Pressable
          style={({ pressed }) => [
            styles.featureCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() => callHelpline('1098', 'Childline')}
        >
          <Text style={styles.featureIcon}>🧒</Text>
          <Text style={styles.featureTitle}>Childline</Text>
          <Text style={styles.featureDescription}>
            Child protection helpline
          </Text>
          <Text style={styles.featureNumber}>1098</Text>
        </Pressable>

        {/* FIRE */}
        <Pressable
          style={({ pressed }) => [
            styles.featureCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() => callHelpline('101', 'Fire services')}
        >
          <Text style={styles.featureIcon}>🔥</Text>
          <Text style={styles.featureTitle}>Fire Help</Text>
          <Text style={styles.featureDescription}>
            Fire emergency services
          </Text>
          <Text style={styles.featureNumber}>101</Text>
        </Pressable>

        {/* AMBULANCE */}
        <Pressable
          style={({ pressed }) => [
            styles.featureCard,
            pressed && styles.cardPressed,
          ]}
          onPress={() => callHelpline('102', 'Ambulance')}
        >
          <Text style={styles.featureIcon}>🚑</Text>
          <Text style={styles.featureTitle}>Ambulance</Text>
          <Text style={styles.featureDescription}>
            Medical emergency help
          </Text>
          <Text style={styles.featureNumber}>102</Text>
        </Pressable>

      </View>

      <Text style={styles.footer}>
        Stay alert. Stay safe.
      </Text>

      {/* FAKE INCOMING CALL SCREEN */}
      <Modal
        visible={fakeCallVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={declineFakeCall}
      >
        <View style={styles.fakeCallScreen}>

          <View style={styles.callTopSection}>
            <Text style={styles.incomingText}>
              {fakeCallAnswered ? 'Mobile call' : 'Incoming call'}
            </Text>

            <Text style={styles.simulatedLabel}>
              SIMULATED CALL
            </Text>
          </View>

          {/* CALLER DETAILS */}
          <View style={styles.callerContainer}>

            <View style={styles.callerAvatar}>
              <Text style={styles.callerAvatarText}>M</Text>
            </View>

            <Text style={styles.callerName}>Mom</Text>

            <Text style={styles.callerNumber}>Mobile</Text>

            {fakeCallAnswered ? (
              <Text style={styles.callDuration}>
                {formatCallTime(callSeconds)}
              </Text>
            ) : (
              <Text style={styles.ringingText}>
                Ringing...
              </Text>
            )}

          </View>

          {/* INCOMING CALL BUTTONS */}
          {!fakeCallAnswered ? (

            <View style={styles.callButtons}>

              <View style={styles.callButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.declineButton,
                    pressed && styles.callButtonPressed,
                  ]}
                  onPress={declineFakeCall}
                >
                  <Text style={styles.callButtonIcon}>✕</Text>
                </Pressable>

                <Text style={styles.callButtonLabel}>
                  Decline
                </Text>
              </View>

              <View style={styles.callButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.answerButton,
                    pressed && styles.callButtonPressed,
                  ]}
                  onPress={answerFakeCall}
                >
                  <Text style={styles.callButtonIcon}>☎</Text>
                </Pressable>

                <Text style={styles.callButtonLabel}>
                  Answer
                </Text>
              </View>

            </View>

          ) : (

            /* ACTIVE CALL SCREEN */
            <View style={styles.activeCallArea}>

              <View style={styles.callToolsRow}>

                <Pressable
                  style={[
                    styles.callTool,
                    isMuted && styles.callToolActive,
                  ]}
                  onPress={() => setIsMuted(value => !value)}
                >
                  <Text style={styles.callToolIcon}>🎙</Text>
                  <Text style={styles.callToolLabel}>
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.callTool,
                    isSpeakerOn && styles.callToolActive,
                  ]}
                  onPress={() => setIsSpeakerOn(value => !value)}
                >
                  <Text style={styles.callToolIcon}>🔊</Text>
                  <Text style={styles.callToolLabel}>
                    Speaker
                  </Text>
                </Pressable>

              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.endCallButton,
                  pressed && styles.callButtonPressed,
                ]}
                onPress={declineFakeCall}
              >
                <Text style={styles.callButtonIcon}>✕</Text>
              </Pressable>

              <Text style={styles.callButtonLabel}>
                End call
              </Text>

              <Text style={styles.simulationNote}>
                This is a simulated call. No real call is connected.
              </Text>

            </View>
          )}

        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  content: {
    padding: 24,
    paddingTop: 65,
    paddingBottom: 35,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222222',
  },

  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 6,
  },

  sosSection: {
    alignItems: 'center',
    marginVertical: 35,
  },

  sosButton: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 5,
    borderColor: '#F5B5B5',
  },

  sosButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  disabledButton: {
    opacity: 0.7,
  },

  sosText: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
  },

  sosSubtext: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 1,
  },

  sosHint: {
    color: '#777777',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 16,
  },

  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  featureCard: {
    width: '48%',
    minHeight: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  cardPressed: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 0.97 }],
  },

  featureIcon: {
    fontSize: 37,
    marginBottom: 9,
  },

  featureTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
  },

  featureDescription: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 6,
  },

  featureNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D32F2F',
    marginTop: 7,
  },

  footer: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 13,
    marginTop: 15,
  },

  // FAKE CALL SCREEN

  fakeCallScreen: {
    flex: 1,
    backgroundColor: '#17212F',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 75,
    paddingBottom: 45,
  },

  callTopSection: {
    alignItems: 'center',
  },

  incomingText: {
    color: '#FFFFFF',
    fontSize: 17,
    letterSpacing: 0.3,
  },

  simulatedLabel: {
    color: '#AAB5C4',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 8,
  },

  callerContainer: {
    alignItems: 'center',
    marginTop: 15,
  },

  callerAvatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: '#687B91',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    borderWidth: 3,
    borderColor: '#8798AA',
  },

  callerAvatarText: {
    color: '#FFFFFF',
    fontSize: 58,
    fontWeight: '300',
  },

  callerName: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '600',
  },

  callerNumber: {
    color: '#B8C2CF',
    fontSize: 15,
    marginTop: 8,
  },

  ringingText: {
    color: '#D5DCE5',
    fontSize: 14,
    marginTop: 22,
  },

  callDuration: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 18,
    fontVariant: ['tabular-nums'],
  },

  callButtons: {
    width: '72%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  callButtonContainer: {
    alignItems: 'center',
  },

  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },

  answerButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#20B65A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  callButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.94 }],
  },

  callButtonIcon: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '700',
  },

  callButtonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
  },

  activeCallArea: {
    alignItems: 'center',
    width: '100%',
  },

  callToolsRow: {
    width: '65%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 38,
  },

  callTool: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#344355',
    alignItems: 'center',
    justifyContent: 'center',
  },

  callToolActive: {
    backgroundColor: '#52677F',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  callToolIcon: {
    fontSize: 23,
  },

  callToolLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 5,
  },

  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },

  simulationNote: {
    color: '#AAB5C4',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
    paddingHorizontal: 20,
  },

});