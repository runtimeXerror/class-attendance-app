import { View } from 'react-native';

/**
 * Icon — Simple line-style icons built from View primitives.
 * All icons take `color` and `size` props, so they can match app theme.
 *
 * Usage:  <Icon name="home" color={theme.primary} size={20} />
 *
 * Available: home, info, users, edit, share, check, close, lock,
 *            shield, file-check, person-plus, gallery, crown, cap
 */
export default function Icon({ name, color = '#000', size = 20 }) {
  const s = size;
  const stroke = Math.max(1.6, s * 0.1);   // line thickness scales with size

  switch (name) {
    // ========== HOME ==========
    case 'home': {
      const roof = s * 0.55;
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'flex-end' }}>
          {/* Roof triangle (rotated square) */}
          <View
            style={{
              position: 'absolute',
              top: s * 0.05,
              width: roof,
              height: roof,
              borderTopWidth: stroke,
              borderLeftWidth: stroke,
              borderColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
          {/* Body */}
          <View
            style={{
              width: s * 0.7,
              height: s * 0.45,
              borderWidth: stroke,
              borderColor: color,
              borderTopWidth: 0,
              marginBottom: s * 0.05,
            }}
          />
          {/* Door */}
          <View
            style={{
              position: 'absolute',
              bottom: s * 0.05,
              width: s * 0.2,
              height: s * 0.25,
              borderTopWidth: stroke,
              borderLeftWidth: stroke,
              borderRightWidth: stroke,
              borderColor: color,
              borderTopLeftRadius: s * 0.1,
              borderTopRightRadius: s * 0.1,
            }}
          />
        </View>
      );
    }

    // ========== INFO (circle with i) — "About App" ==========
    case 'info': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: s * 0.9, height: s * 0.9, borderRadius: s * 0.45,
              borderWidth: stroke, borderColor: color,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <View style={{ width: stroke, height: stroke, borderRadius: stroke/2, backgroundColor: color, marginBottom: s * 0.06 }} />
            <View style={{ width: stroke, height: s * 0.3, backgroundColor: color, borderRadius: stroke/2 }} />
          </View>
        </View>
      );
    }

    // ========== USERS (two overlapping people) — "About Developers" ==========
    case 'users': {
      const head = s * 0.22;
      return (
        <View style={{ width: s, height: s }}>
          {/* Back person */}
          <View style={{
            position: 'absolute', right: s * 0.08, top: s * 0.1,
            width: head, height: head, borderRadius: head / 2,
            borderWidth: stroke, borderColor: color,
          }} />
          <View style={{
            position: 'absolute', right: 0, top: s * 0.42,
            width: s * 0.45, height: s * 0.42,
            borderTopLeftRadius: s * 0.2, borderTopRightRadius: s * 0.2,
            borderWidth: stroke, borderColor: color, borderBottomWidth: 0,
          }} />
          {/* Front person */}
          <View style={{
            position: 'absolute', left: s * 0.08, top: s * 0.15,
            width: head, height: head, borderRadius: head / 2,
            borderWidth: stroke, borderColor: color,
            backgroundColor: 'white',
          }} />
          <View style={{
            position: 'absolute', left: 0, top: s * 0.48,
            width: s * 0.55, height: s * 0.4,
            borderTopLeftRadius: s * 0.2, borderTopRightRadius: s * 0.2,
            borderWidth: stroke, borderColor: color, borderBottomWidth: 0,
            backgroundColor: 'white',
          }} />
        </View>
      );
    }

    // ========== EDIT (pencil) — "Write a Review" ==========
    case 'edit': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: s * 0.18, height: s * 0.85,
            borderWidth: stroke, borderColor: color,
            borderRadius: s * 0.03,
            transform: [{ rotate: '45deg' }],
          }}>
            {/* Tip triangle */}
            <View style={{
              position: 'absolute', bottom: -s * 0.06, left: -stroke,
              width: 0, height: 0,
              borderLeftWidth: s * 0.09, borderRightWidth: s * 0.09,
              borderTopWidth: s * 0.1,
              borderLeftColor: 'transparent', borderRightColor: 'transparent',
              borderTopColor: color,
            }} />
            {/* Cap divider */}
            <View style={{
              position: 'absolute', top: s * 0.18, left: -stroke,
              width: s * 0.18 + stroke * 2, height: stroke,
              backgroundColor: color,
            }} />
          </View>
        </View>
      );
    }

    // ========== SHARE (upload arrow from box) — "Share this App" ==========
    case 'share': {
      // Centered upload-from-tray icon
      const arrowH = s * 0.5;
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          {/* Tray (open top) */}
          <View style={{
            position: 'absolute', bottom: s * 0.05,
            width: s * 0.7, height: s * 0.4,
            borderWidth: stroke, borderColor: color,
            borderTopWidth: 0,
            borderBottomLeftRadius: s * 0.05,
            borderBottomRightRadius: s * 0.05,
          }} />
          {/* Arrow shaft - centered */}
          <View style={{
            position: 'absolute', top: s * 0.1,
            width: stroke, height: arrowH,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }} />
          {/* Arrow head left line */}
          <View style={{
            position: 'absolute', top: s * 0.18, left: s * 0.32,
            width: s * 0.22, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-45deg' }],
          }} />
          {/* Arrow head right line */}
          <View style={{
            position: 'absolute', top: s * 0.18, right: s * 0.32,
            width: s * 0.22, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }],
          }} />
        </View>
      );
    }

    // ========== PERSON-PLUS (for Super Admin — developer/admin person) ==========
    case 'person-plus': {
      const head = s * 0.28;
      return (
        <View style={{ width: s, height: s }}>
          {/* Head */}
          <View style={{
            position: 'absolute', left: s * 0.18, top: s * 0.1,
            width: head, height: head, borderRadius: head / 2,
            borderWidth: stroke, borderColor: color,
          }} />
          {/* Body */}
          <View style={{
            position: 'absolute', left: s * 0.05, top: s * 0.5,
            width: s * 0.55, height: s * 0.4,
            borderTopLeftRadius: s * 0.25, borderTopRightRadius: s * 0.25,
            borderWidth: stroke, borderColor: color, borderBottomWidth: 0,
          }} />
          {/* Plus badge */}
          <View style={{
            position: 'absolute', right: 0, bottom: s * 0.05,
            width: s * 0.4, height: s * 0.4, borderRadius: s * 0.2,
            backgroundColor: color,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <View style={{
              position: 'absolute', width: s * 0.22, height: stroke,
              backgroundColor: 'white',
            }} />
            <View style={{
              position: 'absolute', width: stroke, height: s * 0.22,
              backgroundColor: 'white',
            }} />
          </View>
        </View>
      );
    }

    // ========== GALLERY (picture frame with photo) — for teacher profile ==========
    case 'gallery': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: s * 0.9, height: s * 0.7,
            borderWidth: stroke, borderColor: color,
            borderRadius: s * 0.08,
            overflow: 'hidden',
          }}>
            {/* Sun */}
            <View style={{
              position: 'absolute', top: s * 0.1, left: s * 0.15,
              width: s * 0.15, height: s * 0.15, borderRadius: s * 0.08,
              backgroundColor: color,
            }} />
            {/* Mountains */}
            <View style={{
              position: 'absolute', bottom: -stroke, left: s * 0.05,
              width: 0, height: 0,
              borderLeftWidth: s * 0.22, borderRightWidth: s * 0.22,
              borderBottomWidth: s * 0.35,
              borderLeftColor: 'transparent', borderRightColor: 'transparent',
              borderBottomColor: color,
            }} />
            <View style={{
              position: 'absolute', bottom: -stroke, right: s * 0.02,
              width: 0, height: 0,
              borderLeftWidth: s * 0.18, borderRightWidth: s * 0.18,
              borderBottomWidth: s * 0.25,
              borderLeftColor: 'transparent', borderRightColor: 'transparent',
              borderBottomColor: color,
              opacity: 0.7,
            }} />
          </View>
        </View>
      );
    }

    // ========== PLUS (for small + badges) ==========
    // ========== DOWNLOAD (arrow into tray) — Save to Device ==========
    case 'download': {
      // Centered download-into-tray icon
      const arrowH = s * 0.5;
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          {/* Arrow shaft - centered */}
          <View style={{
            position: 'absolute', top: s * 0.05,
            width: stroke, height: arrowH,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }} />
          {/* Arrow head left line */}
          <View style={{
            position: 'absolute', top: s * 0.4, left: s * 0.32,
            width: s * 0.22, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }],
          }} />
          {/* Arrow head right line */}
          <View style={{
            position: 'absolute', top: s * 0.4, right: s * 0.32,
            width: s * 0.22, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-45deg' }],
          }} />
          {/* Tray (open top) */}
          <View style={{
            position: 'absolute', bottom: s * 0.05,
            width: s * 0.7, height: s * 0.25,
            borderWidth: stroke, borderColor: color,
            borderTopWidth: 0,
            borderBottomLeftRadius: s * 0.05,
            borderBottomRightRadius: s * 0.05,
          }} />
        </View>
      );
    }

    // ========== EXCEL (spreadsheet grid) ==========
    case 'excel': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: s * 0.85, height: s * 0.9,
            borderWidth: stroke, borderColor: color, borderRadius: s * 0.06,
            overflow: 'hidden',
          }}>
            <View style={{
              position: 'absolute', top: '33%', left: 0, right: 0,
              height: stroke, backgroundColor: color,
            }} />
            <View style={{
              position: 'absolute', top: '66%', left: 0, right: 0,
              height: stroke, backgroundColor: color,
            }} />
            <View style={{
              position: 'absolute', top: 0, bottom: 0, left: '50%',
              width: stroke, backgroundColor: color,
            }} />
          </View>
        </View>
      );
    }

    // ========== PDF (document with fold) ==========
    case 'pdf': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            width: s * 0.7, height: s * 0.9,
            borderWidth: stroke, borderColor: color, borderRadius: s * 0.04,
            paddingTop: s * 0.4, alignItems: 'center',
          }}>
            <View style={{ width: s * 0.45, height: stroke, backgroundColor: color, marginBottom: s * 0.06 }} />
            <View style={{ width: s * 0.45, height: stroke, backgroundColor: color, marginBottom: s * 0.06 }} />
            <View style={{ width: s * 0.3, height: stroke, backgroundColor: color }} />
          </View>
          <View style={{
            position: 'absolute', top: s * 0.05, right: s * 0.15,
            width: 0, height: 0,
            borderLeftWidth: s * 0.12, borderTopWidth: s * 0.12,
            borderLeftColor: 'transparent', borderTopColor: color,
          }} />
        </View>
      );
    }

    // ========== LOGOUT (arrow exiting door) ==========
    // ========== CHECK (tick) ==========
    case 'check': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          {/* Short stroke (left) */}
          <View style={{
            position: 'absolute',
            left: s * 0.18, top: s * 0.5,
            width: s * 0.28, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }],
          }} />
          {/* Long stroke (right) */}
          <View style={{
            position: 'absolute',
            left: s * 0.34, top: s * 0.42,
            width: s * 0.5, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-50deg' }],
          }} />
        </View>
      );
    }

    // ========== CLOSE (X / cross) ==========
    case 'close': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{
            position: 'absolute',
            width: s * 0.75, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }],
          }} />
          <View style={{
            position: 'absolute',
            width: s * 0.75, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-45deg' }],
          }} />
        </View>
      );
    }

    case 'logout': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          {/* Door frame (left side, open right) */}
          <View style={{
            position: 'absolute', left: s * 0.05, top: s * 0.1,
            width: s * 0.4, height: s * 0.8,
            borderWidth: stroke, borderColor: color,
            borderRightWidth: 0,
            borderTopLeftRadius: s * 0.04,
            borderBottomLeftRadius: s * 0.04,
          }} />
          {/* Arrow shaft (horizontal, pointing right) */}
          <View style={{
            position: 'absolute', top: s * 0.475, left: s * 0.32,
            width: s * 0.55, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }} />
          {/* Arrow head top */}
          <View style={{
            position: 'absolute', top: s * 0.32, right: s * 0.1,
            width: s * 0.22, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }],
          }} />
          {/* Arrow head bottom */}
          <View style={{
            position: 'absolute', top: s * 0.55, right: s * 0.1,
            width: s * 0.22, height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-45deg' }],
          }} />
        </View>
      );
    }

    case 'plus': {
      return (
        <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', width: s * 0.7, height: stroke, backgroundColor: color, borderRadius: stroke / 2 }} />
          <View style={{ position: 'absolute', width: stroke, height: s * 0.7, backgroundColor: color, borderRadius: stroke / 2 }} />
        </View>
      );
    }

    default:
      return <View style={{ width: s, height: s }} />;
  }
}
