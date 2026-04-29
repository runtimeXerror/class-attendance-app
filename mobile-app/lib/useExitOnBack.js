import { useCallback, useRef } from 'react';
import { BackHandler, ToastAndroid, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Used on the ROOT dashboard screens (teacher / student / admin / superadmin).
// Behavior:
//   - When the dashboard is the focused screen, hardware back asks for a
//     second press within 2s to confirm exit (and never pops back to /login).
//   - When the user navigates to a sub-screen (e.g. admin → students),
//     the dashboard is no longer focused, the listener is removed, and
//     normal back navigation works (sub-screen → dashboard).
// On iOS this is a no-op (no hardware back button).
export default function useExitOnBack(enabled = true) {
  const lastPress = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || Platform.OS !== 'android') return;

      const onBack = () => {
        const now = Date.now();
        if (now - lastPress.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastPress.current = now;
        try { ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT); } catch (_) {}
        return true; // block default → don't navigate to /login
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [enabled])
  );
}
