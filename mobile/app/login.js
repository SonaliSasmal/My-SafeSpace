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

import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter your email and password.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: cleanEmail,
        password,
      });

      await login(data.token, data.user);

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);

      Alert.alert(
        'Login unsuccessful',
        'We could not log you in. Please check your email and password and try again.'
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
        {/* TOP DECORATION */}
        <View style={styles.topDecoration}>
          <View style={styles.circleOne} />
          <View style={styles.circleTwo} />
        </View>

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

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome Back!
          </Text>

          <Text style={styles.welcomeDescription}>
            Your safety companion is always here.
            Sign in to continue.
          </Text>
        </View>

        {/* LOGIN FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formHeading}>Login to your account</Text>

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

          <Text style={styles.label}>PASSWORD</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>●</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
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

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>

            {!loading && (
              <Text style={styles.buttonArrow}>→</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>NEW HERE?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              Create a New Account
            </Text>
          </Pressable>
        </View>

        {/* BOTTOM MESSAGE */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomIcon}>♡</Text>
          <Text style={styles.bottomText}>
            You deserve to feel safe, always.
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
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 25,
  },

  topDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
    overflow: 'hidden',
  },

  circleOne: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FCE5E2',
    top: -65,
    right: -50,
  },

  circleTwo: {
    position: 'absolute',
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#F7D1CC',
    top: -25,
    right: -25,
  },

  brandSection: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 35,
  },

  logoBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#D94343',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4,
  },

  logoIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },

  brandName: {
    color: '#202C40',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 3,
  },

  brandTagline: {
    color: '#858585',
    fontSize: 12,
    marginTop: 5,
    letterSpacing: 0.5,
  },

  welcomeSection: {
    marginBottom: 25,
  },

  welcomeTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#202C40',
    lineHeight: 49,
  },

  welcomeDescription: {
    color: '#777777',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 290,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  formHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#202C40',
    marginBottom: 25,
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#626C7B',
    letterSpacing: 1,
    marginBottom: 9,
  },

  inputWrapper: {
    height: 56,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E8E9ED',
    backgroundColor: '#FAFAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 22,
  },

  inputIcon: {
    fontSize: 17,
    color: '#D94343',
    width: 28,
    textAlign: 'center',
  },

  input: {
    flex: 1,
    color: '#202C40',
    fontSize: 14,
    height: '100%',
  },

  showPassword: {
    fontSize: 10,
    color: '#D94343',
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingLeft: 8,
  },

  loginButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#D94343',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    elevation: 3,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    position: 'absolute',
    right: 20,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  disabledButton: {
    opacity: 0.6,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 23,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  dividerText: {
    color: '#999999',
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 12,
    letterSpacing: 1,
  },

  registerButton: {
    height: 53,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D94343',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  registerButtonText: {
    color: '#D94343',
    fontSize: 14,
    fontWeight: '800',
  },

  bottomSection: {
    alignItems: 'center',
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  bottomIcon: {
    color: '#D94343',
    fontSize: 20,
    marginRight: 7,
  },

  bottomText: {
    color: '#777777',
    fontSize: 12,
  },
});