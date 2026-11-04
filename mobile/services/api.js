
const API_BASE_URL = 'http://192.168.0.100:5000/api';

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// REGISTER USER
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
}

// LOGIN USER
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
}

// GET EMERGENCY CONTACTS
export async function getContacts(token) {
  const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}

// ADD EMERGENCY CONTACT
export async function addContact(contactData, token) {
  const response = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contactData),
  });

  return handleResponse(response);
}

// UPDATE EMERGENCY CONTACT
export async function updateContact(id, contactData, token) {
  const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contactData),
  });

  return handleResponse(response);
}

// DELETE EMERGENCY CONTACT
export async function deleteContact(id, token) {
  const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
}
