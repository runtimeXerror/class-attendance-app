import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';
import AnimatedSplash from '../components/AnimatedSplash';
import { warmupBackend } from '../lib/api';

function Layout() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',   // smooth right→left slide between routes
          animationDuration: 280,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  // Wake the Render free-tier backend the instant the app launches so
  // the eventual login request hits a warm server (~1s) instead of a cold
  // one (30-50s). Fire-and-forget — failures are silent.
  useEffect(() => { warmupBackend(); }, []);

  return (
    <ThemeProvider>
      <Layout />
      {!splashDone && (
        <AnimatedSplash
          minDuration={1800}
          onFinish={() => setSplashDone(true)}
        />
      )}
    </ThemeProvider>
  );
}


