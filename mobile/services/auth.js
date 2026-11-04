import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'women_safety_token';
const USER_KEY = 'women_safety_user';

export async function saveAuth(token, user) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify(user)
  );
}

export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getUser() {
  const user = await SecureStore.getItemAsync(USER_KEY);

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}