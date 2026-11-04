import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';

import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();

              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);

              Alert.alert(
                'Error',
                'Unable to logout. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* User Information */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : 'U'}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.name || 'User'}
        </Text>

        <Text style={styles.email}>
          {user?.email || 'No email available'}
        </Text>
      </View>

      {/* Account Information */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>

          <Text style={styles.value}>
            {user?.name || 'Not available'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>

          <Text style={styles.value}>
            {user?.email || 'Not available'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>

          <Text style={styles.value}>
            {user?.phone || 'Not available'}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#222222',
    marginTop: 20,
    marginBottom: 25,
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222222',
  },

  email: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },

  label: {
    fontSize: 15,
    color: '#777777',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
    maxWidth: '60%',
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  logoutButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});