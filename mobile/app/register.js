import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { router } from 'expo-router';

import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Missing information',
        'Please complete all the fields.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.'
      );
      return;
    }

    if (!/^[0-9+\-\s()]{7,15}$/.test(cleanPhone)) {
      Alert.alert(
        'Invalid phone number',
        'Please enter a valid phone number.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Your password must contain at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Your passwords do not match. Please check again.'
      );
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password,
      });

      await login(data.token, data.user);

      router.replace('/(tabs)');

      Alert.alert(
        'Registration successful',
        `Welcome, ${data.user.name}!`
      );

    } catch (error) {
      console.error('Registration error:', error);

      Alert.alert(
        'Registration unsuccessful',
        'We could not create your account. Please check your details or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        backgroundColor="#F8F7F5"
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* BRAND */}
        <View style={styles.brandSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>

          <Text style={styles.brandName}>My SafeSpace</Text>

          <Text style={styles.brandTagline}>
            Your safety, our priority
          </Text>
        </View>

        {/* HEADING */}
        <View style={styles.headingSection}>
          <Text style={styles.title}>
            Create Your{'\n'}Account
          </Text>

          <Text style={styles.subtitle}>
            Join us and take a step towards a safer tomorrow.
          </Text>
        </View>

        {/* REGISTRATION FORM */}
        <View style={styles.formCard}>

          <Text style={styles.formHeading}>
            Personal Information
          </Text>

          {/* NAME */}
          <Text style={styles.label}>FULL NAME</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>●</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* EMAIL */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* PHONE */}
          <Text style={styles.label}>PHONE NUMBER</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>☎</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor="#A0A0A0"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* PASSWORD */}
          <Text style={styles.label}>PASSWORD</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>●</Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />

            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
            >
              <Text style={styles.showPassword}>
                {showPassword ? 'HIDE' : 'SHOW'}
              </Text>
            </Pressable>
          </View>

          {/* CONFIRM PASSWORD */}
          <Text style={styles.label}>CONFIRM PASSWORD</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>●</Text>

            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="#A0A0A0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              hitSlop={10}
            >
              <Text style={styles.showPassword}>
                {showConfirmPassword ? 'HIDE' : 'SHOW'}
              </Text>
            </Pressable>
          </View>

          {/* REGISTER BUTTON */}
          <Pressable
            style={({ pressed }) => [
              styles.registerButton,
              pressed && styles.buttonPressed,
              loading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>

            {!loading && (
              <Text style={styles.buttonArrow}>→</Text>
            )}
          </Pressable>

          {/* LOGIN LINK */}
          <View style={styles.loginSection}>
            <Text style={styles.loginQuestion}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace('/login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>
                Login
              </Text>
            </Pressable>
          </View>

        </View>

        {/* BOTTOM MESSAGE */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomIcon}>♡</Text>

          <Text style={styles.bottomText}>
            Your safety journey starts here.
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: '#F8F7F5',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30,
  },

  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D94343',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
    elevation: 4,
  },

  logoIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  brandName: {
    color: '#202C40',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },

  brandTagline: {
    color: '#858585',
    fontSize: 11,
    marginTop: 4,
  },

  headingSection: {
    marginBottom: 23,
  },

  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#202C40',
    lineHeight: 43,
  },

  subtitle: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 21,
    marginTop: 9,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 21,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  formHeading: {
    color: '#202C40',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 22,
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#626C7B',
    letterSpacing: 1,
    marginBottom: 8,
  },

  inputWrapper: {
    height: 53,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E9ED',
    backgroundColor: '#FAFAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 17,
  },

  inputIcon: {
    color: '#D94343',
    fontSize: 16,
    width: 27,
    textAlign: 'center',
  },

  input: {
    flex: 1,
    color: '#202C40',
    fontSize: 13,
    height: '100%',
  },

  showPassword: {
    color: '#D94343',
    fontSize: 10,
    fontWeight: '800',
    paddingLeft: 7,
  },

  registerButton: {
    height: 55,
    backgroundColor: '#D94343',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 9,
    elevation: 3,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    position: 'absolute',
    right: 19,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 23,
    flexWrap: 'wrap',
  },

  loginQuestion: {
    color: '#777777',
    fontSize: 12,
  },

  loginLink: {
    color: '#D94343',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 5,
  },

  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  bottomIcon: {
    color: '#D94343',
    fontSize: 20,
    marginRight: 7,
  },

  bottomText: {
    color: '#777777',
    fontSize: 11,
  },

});