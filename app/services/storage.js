import * as SecureStore from 'expo-secure-store';

export const getItem = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn('SecureStore.getItemAsync failed', key, error);
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    return await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn('SecureStore.setItemAsync failed', key, error);
    throw error;
  }
};

export const removeItem = async (key) => {
  try {
    return await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn('SecureStore.deleteItemAsync failed', key, error);
    throw error;
  }
};

export const multiRemove = async (keys = []) => {
  try {
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
  } catch (error) {
    console.warn('SecureStore.multiRemove failed', keys, error);
    throw error;
  }
};
