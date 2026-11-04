
import { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const SERVICES = [
  {
    id: 'police',
    title: 'Police Stations',
    subtitle: 'Police assistance',
    icon: '🚔',
    color: '#2563EB',
    search: 'police station',
  },
  {
    id: 'hospital',
    title: 'Hospitals',
    subtitle: 'Medical emergencies',
    icon: '🏥',
    color: '#DC2626',
    search: 'hospital',
  },
  {
    id: 'clinic',
    title: 'Clinics',
    subtitle: 'Medical clinics',
    icon: '🩺',
    color: '#059669',
    search: 'medical clinic',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacies',
    subtitle: 'Medicines nearby',
    icon: '💊',
    color: '#9333EA',
    search: 'pharmacy',
  },
];

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Get current device location
  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to find nearby emergency services.'
        );
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(newLocation);
    } catch (error) {
      console.log('Location Error:', error);

      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Search nearby services through Google Maps
  const openGoogleMapsSearch = async (service) => {
    if (!location) {
      Alert.alert(
        'Location Unavailable',
        'Please refresh your location first.'
      );
      return;
    }

    const query = encodeURIComponent(service.search);

    const url =
      `https://www.google.com/maps/search/${query}/@` +
      `${location.latitude},${location.longitude},15z`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log('Google Maps Error:', error);

      Alert.alert(
        'Unable to Open Maps',
        'Please check whether Google Maps or a browser is available.'
      );
    }
  };

  // Recenter the map on the user's location
  const recenterMap = () => {
    if (!location) {
      getCurrentLocation();
      return;
    }

    setMapReady(false);

    // Changing the location object triggers the map to use
    // the updated coordinates.
    setLocation({ ...location });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explore Nearby</Text>
          <Text style={styles.subtitle}>
            Your safety, within reach.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerEmoji}>🛡️</Text>
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Location</Text>

          <Pressable
            style={styles.refreshSmall}
            onPress={getCurrentLocation}
          >
            <Text style={styles.refreshSmallText}>↻ Refresh</Text>
          </Pressable>
        </View>

        <View style={styles.mapContainer}>
          {location ? (
            <MapView
              key={`${location.latitude}-${location.longitude}`}
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              onMapReady={() => setMapReady(true)}
            >
              <Marker
                coordinate={location}
                title="Your Current Location"
                description="You are here"
                pinColor="#2563EB"
              />
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              {loading ? (
                <>
                  <ActivityIndicator
                    size="large"
                    color="#2563EB"
                  />
                  <Text style={styles.placeholderText}>
                    Finding your location...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.placeholderEmoji}>📍</Text>
                  <Text style={styles.placeholderText}>
                    Location unavailable
                  </Text>

                  <Pressable
                    style={styles.retryButton}
                    onPress={getCurrentLocation}
                  >
                    <Text style={styles.retryText}>
                      Try Again
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>

        {location && (
          <View style={styles.locationInfo}>
            <View style={styles.locationDot} />

            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>
                Current position detected
              </Text>

              <Text style={styles.coordinates}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Emergency Services */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>
          Emergency Services
        </Text>

        <Text style={styles.servicesSubtitle}>
          Find essential services around your location.
        </Text>

        <View style={styles.servicesGrid}>
          {SERVICES.map((service) => (
            <Pressable
              key={service.id}
              style={({ pressed }) => [
                styles.serviceCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => openGoogleMapsSearch(service)}
              disabled={!location}
            >
              <View
                style={[
                  styles.serviceIcon,
                  { backgroundColor: `${service.color}15` },
                ]}
              >
                <Text style={styles.serviceEmoji}>
                  {service.icon}
                </Text>
              </View>

              <Text style={styles.serviceTitle}>
                {service.title}
              </Text>

              <Text style={styles.serviceSubtitle}>
                {service.subtitle}
              </Text>

              <View style={styles.findRow}>
                <Text
                  style={[
                    styles.findText,
                    { color: service.color },
                  ]}
                >
                  Find Nearby
                </Text>

                <Text
                  style={[
                    styles.arrow,
                    { color: service.color },
                  ]}
                >
                  →
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Refresh Location */}
      <Pressable
        style={styles.refreshButton}
        onPress={getCurrentLocation}
      >
        <Text style={styles.refreshButtonText}>
          ↻  Update My Location
        </Text>
      </Pressable>

      {/* Information */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          ℹ️  Important Information
        </Text>

        <Text style={styles.infoText}>
          Selecting an emergency service opens Google Maps
          with a nearby search based on your current location.
          Check the displayed details before travelling.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerEmoji: {
    fontSize: 25,
  },

  mapSection: {
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },

  refreshSmall: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  refreshSmallText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },

  mapContainer: {
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    elevation: 3,
  },

  map: {
    flex: 1,
  },

  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },

  placeholderEmoji: {
    fontSize: 35,
  },

  placeholderText: {
    color: '#475569',
    fontSize: 14,
    marginTop: 10,
  },

  retryButton: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 12,
    marginTop: 12,
    elevation: 1,
  },

  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    marginRight: 11,
  },

  locationDetails: {
    flex: 1,
  },

  locationLabel: {
    color: '#0F172A',
    fontWeight: '600',
    fontSize: 13,
  },

  coordinates: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 3,
  },

  servicesSection: {
    marginBottom: 22,
  },

  servicesSubtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 5,
    marginBottom: 16,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 13,
  },

  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    minHeight: 165,
  },

  cardPressed: {
    opacity: 0.75,
  },

  serviceIcon: {
    width: 47,
    height: 47,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  serviceEmoji: {
    fontSize: 25,
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },

  serviceSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 5,
  },

  findRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
  },

  findText: {
    fontSize: 12,
    fontWeight: '700',
  },

  arrow: {
    fontSize: 17,
    marginLeft: 5,
    fontWeight: 'bold',
  },

  refreshButton: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },

  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 15,
    borderRadius: 13,
  },

  infoTitle: {
    color: '#1E40AF',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 7,
  },

  infoText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 19,
  },
});
