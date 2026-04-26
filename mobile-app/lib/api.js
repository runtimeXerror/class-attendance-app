import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Auto-detect backend URL from Expo's host (same machine as Expo dev server)
// When you run `npx expo start`, hostUri looks like "192.168.1.5:8081"
// We use the same IP with :8000 for the backend.
const getApiUrl = () => {
  // Priority 1: Manual override via env (for APK builds / deployed backend)
  // Set EXPO_PUBLIC_API_URL in .env or via app.json extra.apiUrl
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Constants.expoConfig?.extra?.apiUrl) return Constants.expoConfig.extra.apiUrl;

  // Priority 2: Auto-detect from Expo dev server host
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost && debuggerHost !== 'localhost' && debuggerHost !== '127.0.0.1') {
    return `http://${debuggerHost}:8000`;
  }

  // Priority 3: Manual fallback — ⚠️ CHANGE THIS TO YOUR LAPTOP'S IP
  // Windows cmd: `ipconfig` → look for "IPv4 Address" (usually 192.168.x.x)
  // Mac/Linux:   `ifconfig` or `ip addr` → look for "inet 192.168..."
  //
  // Example: if your laptop IP is 192.168.1.15, set below to:
  //    return 'http://192.168.1.15:8000';
  return 'http://192.168.1.5:8000';
};

export const API_URL = getApiUrl();
console.log('[api] Using backend URL:', API_URL);  // Visible in Expo Metro logs

export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,   // 60 sec — Render free plan cold start takes 30-50 sec
});

// Retry interceptor — if a request times out (cold start), retry up to 2 more times.
// Total wait is ~3 min worst case which is enough for Render free wake-up.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);
    config.__retryCount = config.__retryCount || 0;

    // Retry on timeout / network errors (no response) up to 2 more times
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetwork = !error.response && error.message === 'Network Error';

    if ((isTimeout || isNetwork) && config.__retryCount < 2) {
      config.__retryCount += 1;
      console.log(`[api] Retry ${config.__retryCount}/2 — backend may be waking up...`);
      // Wait a bit before retrying
      await new Promise(r => setTimeout(r, 3000));
      return api.request(config);
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Better error messages for common network failures
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
      err.response = {
        data: {
          detail:
            `Server not responding. Please try again in a few seconds.\n\n` +
            `If this is your first request after a while, the server may take ` +
            `30-60 seconds to wake up. Please be patient and retry.`,
        },
      };
    }
    return Promise.reject(err);
  }
);

export const saveAuth = async (data) => {
  await AsyncStorage.setItem('token', data.access_token);
  await AsyncStorage.setItem('role', data.role);
  await AsyncStorage.setItem('name', data.name);
  await AsyncStorage.setItem('user_id', String(data.user_id));
  if (data.branch_name) await AsyncStorage.setItem('branch_name', data.branch_name);
  if (data.branch_code) await AsyncStorage.setItem('branch_code', data.branch_code);
  if (data.profile_image) await AsyncStorage.setItem('profile_image', data.profile_image);
  if (data.must_change_password !== undefined) {
    await AsyncStorage.setItem('must_change_password', String(data.must_change_password));
  }
};

export const getAuth = async () => ({
  token: await AsyncStorage.getItem('token'),
  role: await AsyncStorage.getItem('role'),
  name: await AsyncStorage.getItem('name'),
  user_id: await AsyncStorage.getItem('user_id'),
  branch_name: await AsyncStorage.getItem('branch_name'),
  branch_code: await AsyncStorage.getItem('branch_code'),
  profile_image: await AsyncStorage.getItem('profile_image'),
  must_change_password: await AsyncStorage.getItem('must_change_password') === 'true',
});

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([
    'token', 'role', 'name', 'user_id',
    'branch_name', 'branch_code', 'profile_image', 'must_change_password',
  ]);
};

// Timezone-safe date: Date → YYYY-MM-DD (in local timezone)
export const toLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ==========================================================
// Generic file downloader — handles Excel + PDF.
// Returns the local file URI after download (no auto share/save).
// Caller decides what to do via the returned uri.
// ==========================================================
export const downloadFile = async (endpoint, suggestedName = 'report') => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Not logged in');

  const url = `${API_URL}${endpoint}`;
  const safeName = suggestedName.replace(/[^a-z0-9._()-]/gi, '_');

  let fileUri;

  // ---- MODERN expo-file-system v19+ File API ----
  try {
    const Modern = require('expo-file-system');
    if (Modern && Modern.File && Modern.Paths?.cache) {
      const dest = new Modern.File(Modern.Paths.cache, safeName);
      try { dest.delete(); } catch (_) {}
      if (typeof Modern.File.downloadFileAsync === 'function') {
        const dl = await Modern.File.downloadFileAsync(url, dest, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fileUri = dl?.uri || dest.uri;
      }
    }
  } catch (_) {}

  // ---- LEGACY fallback ----
  if (!fileUri) {
    let Legacy;
    try { Legacy = require('expo-file-system/legacy'); }
    catch (_) { Legacy = require('expo-file-system'); }
    const dir = Legacy.cacheDirectory || Legacy.documentDirectory;
    if (!dir) throw new Error('No writable directory');
    const target = `${dir}${safeName}`;
    const res = await Legacy.downloadAsync(url, target, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res) throw new Error('Download returned empty');
    if (res.status && res.status !== 200) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    fileUri = res.uri;
  }
  return fileUri;
};

// Auto-saves the file to phone storage. First time asks user to
// pick a folder (e.g. Downloads), then remembers it forever and
// auto-saves all future files there - no picker again.
export const saveToDevice = async (fileUri, mimeType = 'application/octet-stream', fileName = 'file') => {
  const { Platform } = require('react-native');

  let Legacy;
  try { Legacy = require('expo-file-system/legacy'); }
  catch (_) { Legacy = require('expo-file-system'); }

  if (Platform.OS === 'android') {
    if (!Legacy.StorageAccessFramework) {
      throw new Error('Storage Access Framework not available');
    }
    const SAF = Legacy.StorageAccessFramework;

    // Step 1: try to use cached folder URI (picked previously)
    let folderUri = await AsyncStorage.getItem('saved_download_folder');

    // Verify cached folder is still accessible
    if (folderUri) {
      try {
        await SAF.readDirectoryAsync(folderUri);
      } catch (_) {
        folderUri = null;   // permission revoked/folder removed → ask again
        await AsyncStorage.removeItem('saved_download_folder');
      }
    }

    // Step 2: if no cached folder, ask user to pick once
    if (!folderUri) {
      const perm = await SAF.requestDirectoryPermissionsAsync();
      if (!perm.granted) throw new Error('User cancelled folder selection');
      folderUri = perm.directoryUri;
      await AsyncStorage.setItem('saved_download_folder', folderUri);
    }

    // Step 3: read file content
    const base64 = await Legacy.readAsStringAsync(fileUri, {
      encoding: Legacy.EncodingType.Base64,
    });

    // Step 4: create + write file in chosen folder
    const safUri = await SAF.createFileAsync(folderUri, fileName, mimeType);
    await Legacy.writeAsStringAsync(safUri, base64, {
      encoding: Legacy.EncodingType.Base64,
    });

    return { uri: safUri, location: 'your chosen folder' };
  }

  // ----- iOS: MediaLibrary -----
  try {
    const MediaLibrary = require('expo-media-library');
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) throw new Error('Permission denied');
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    return { uri: asset.uri, location: 'Files app' };
  } catch (e) {
    throw new Error(e.message || 'Could not save on iOS');
  }
};

// Lets user reset the saved folder (call from Settings if needed)
export const clearSavedDownloadFolder = async () => {
  await AsyncStorage.removeItem('saved_download_folder');
};

// Opens native share sheet for the given local file URI
export const shareFile = async (fileUri, mimeType) => {
  const Sharing = require('expo-sharing');
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing not available');
  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle: 'Share file',
  });
};

// Backwards-compat alias
export const downloadExcel = async (endpoint, suggestedName = 'report.xlsx') => {
  const fileUri = await downloadFile(endpoint, suggestedName);
  try { await shareFile(fileUri, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); } catch (_) {}
  return fileUri;
};


