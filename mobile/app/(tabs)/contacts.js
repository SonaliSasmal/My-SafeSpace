
import { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';

import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
} from '../../services/api';

export default function ContactsScreen() {
  const { token, loading: authLoading } = useAuth();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const [error, setError] = useState('');

  const fetchContacts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      const response = await getContacts(token);
      setContacts(response.contacts || []);
    } catch (err) {
      setError(err.message || 'Unable to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      fetchContacts();
    }
  }, [authLoading, fetchContacts]);

  // CALL CONTACT
  async function handleCallContact(number) {
    const phoneNumber = number.replace(/[^\d+]/g, '');

    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (err) {
      Alert.alert('Unable to call', 'Could not open phone dialler.');
    }
  }

  // OPEN ADD FORM
  function openAddModal() {
    setEditingId(null);
    setName('');
    setPhone('');
    setRelationship('');
    setModalVisible(true);
  }

  // OPEN EDIT FORM
  function openEditModal(contact) {
    setEditingId(contact._id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship || '');
    setModalVisible(true);
  }

  // SAVE CONTACT
  async function handleSaveContact() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required fields', 'Enter name and phone number.');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Invalid name', 'Name must have at least 2 characters.');
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone.trim())) {
      Alert.alert('Invalid number', 'Enter a valid phone number.');
      return;
    }

    const contactData = {
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || 'Other',
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateContact(editingId, contactData, token);
      } else {
        await addContact(contactData, token);
      }

      setModalVisible(false);
      setEditingId(null);
      setName('');
      setPhone('');
      setRelationship('');

      await fetchContacts();

    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to save contact.');
    } finally {
      setSaving(false);
    }
  }

  // DELETE CONFIRMATION
  function confirmDelete(contact) {
    Alert.alert(
      'Remove contact?',
      `Are you sure you want to remove ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => handleDeleteContact(contact._id),
        },
      ]
    );
  }

  // DELETE CONTACT
  async function handleDeleteContact(id) {
    try {
      await deleteContact(id, token);

      setContacts(previous =>
        previous.filter(contact => contact._id !== id)
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to delete contact.');
    }
  }

  // CONTACT INITIALS
  function getInitials(fullName) {
    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  // CONTACT CARD
  function renderContact({ item, index }) {
    return (
      <View style={styles.contactCard}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(item.name)}
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.name}</Text>

            <Text style={styles.relationship}>
              {item.relationship || 'Other'}
            </Text>

            <Text style={styles.contactPhone}>{item.phone}</Text>
          </View>

          <Pressable
            style={styles.moreButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.moreText}>•••</Text>
          </Pressable>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <Pressable
            style={styles.callButton}
            onPress={() => handleCallContact(item.phone)}
          >
            <Text style={styles.callButtonText}>☎  Call</Text>
          </Pressable>

          <Pressable
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>

          <Pressable
            style={styles.removeButton}
            onPress={() => confirmDelete(item)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={styles.loadingText}>Loading your contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR SAFETY NETWORK</Text>
          <Text style={styles.title}>Emergency{'\n'}Contacts</Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>♡</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Your trusted people, always within reach.
      </Text>

      {/* CONTACT COUNT */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trusted contacts</Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{contacts.length}</Text>
        </View>
      </View>

      {/* CONTACT LIST */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={fetchContacts}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={item => item._id}
          renderItem={renderContact}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>♡</Text>
              </View>

              <Text style={styles.emptyTitle}>
                Your safety circle starts here
              </Text>

              <Text style={styles.emptyText}>
                Add people you trust. Keep their contact details
                ready whenever you need them.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ⓘ</Text>
              <Text style={styles.infoText}>
                These are your saved trusted contacts. Adding them
                does not automatically send alerts or share your location.
              </Text>
            </View>
          }
        />
      )}

      {/* ADD CONTACT BUTTON */}
      <Pressable
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>＋  Add emergency contact</Text>
      </Pressable>

      {/* ADD / EDIT MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>YOUR SAFETY CIRCLE</Text>
                <Text style={styles.modalTitle}>
                  {editingId ? 'Edit contact' : 'Add a contact'}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter contact name"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#A0A0A0"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>RELATIONSHIP</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mother, Father, Friend"
              placeholderTextColor="#A0A0A0"
              value={relationship}
              onChangeText={setRelationship}
            />

            <Pressable
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSaveContact}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingId ? 'Save changes' : 'Save contact'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 22,
    paddingTop: 65,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },

  loadingText: {
    marginTop: 12,
    color: '#777',
    fontSize: 14,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#C62828',
    marginBottom: 9,
  },

  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#222222',
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FCEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIconText: {
    fontSize: 35,
    color: '#C62828',
  },

  subtitle: {
    fontSize: 14,
    color: '#858585',
    marginTop: 10,
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 9,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#292929',
  },

  countBadge: {
    backgroundColor: '#FCEAEA',
    minWidth: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  countText: {
    color: '#C62828',
    fontWeight: '800',
    fontSize: 12,
  },

  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 53,
    height: 53,
    borderRadius: 18,
    backgroundColor: '#FCEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C62828',
  },

  contactInfo: {
    flex: 1,
    marginLeft: 13,
  },

  contactName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#292929',
  },

  relationship: {
    fontSize: 12,
    color: '#C62828',
    marginTop: 3,
    fontWeight: '600',
  },

  contactPhone: {
    fontSize: 13,
    color: '#888888',
    marginTop: 4,
  },

  moreButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  moreText: {
    fontWeight: '800',
    color: '#555555',
    fontSize: 15,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  callButton: {
    flex: 1.2,
    backgroundColor: '#287A48',
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },

  callButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  editButton: {
    flex: 0.8,
    backgroundColor: '#F1F1F1',
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#444444',
    fontSize: 13,
    fontWeight: '700',
  },

  removeButton: {
    flex: 0.9,
    backgroundColor: '#FCEAEA',
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },

  removeButtonText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: '#FCEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIconText: {
    fontSize: 45,
    color: '#C62828',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#292929',
    marginTop: 19,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#858585',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 9,
  },

  infoCard: {
    backgroundColor: '#F2F3F5',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 5,
    marginBottom: 15,
  },

  infoIcon: {
    fontSize: 17,
    color: '#777777',
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#777777',
  },

  addButton: {
    backgroundColor: '#C62828',
    borderRadius: 15,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#C62828',
    shadowOpacity: 0.2,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
  },

  errorText: {
    color: '#C62828',
    fontSize: 14,
  },

  retryText: {
    color: '#1976D2',
    fontWeight: '800',
    marginTop: 12,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    paddingHorizontal: 24,
    paddingTop: 13,
    paddingBottom: 30,
  },

  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#DDDDDD',
    alignSelf: 'center',
    marginBottom: 23,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 23,
  },

  modalEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#C62828',
    marginBottom: 5,
  },

  modalTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#222222',
  },

  closeButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#555555',
    fontSize: 16,
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#777777',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: '#222222',
    marginBottom: 19,
  },

  saveButton: {
    backgroundColor: '#C62828',
    paddingVertical: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 5,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  cancelButton: {
    padding: 14,
    alignItems: 'center',
  },

  cancelText: {
    color: '#777777',
    fontWeight: '700',
    fontSize: 14,
  },
});
