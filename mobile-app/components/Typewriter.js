import { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';

/**
 * Typewriter: types each word, deletes it, moves to next, LOOPS FOREVER.
 * All words cycle continuously — never stops.
 *
 * Props:
 *  words: string[]
 *  typeSpeed: ms per char while typing (default 60)
 *  deleteSpeed: ms per char while deleting (default 30)
 *  pauseAfterType: ms to wait after fully typed (default 1200)
 *  pauseAfterDelete: ms before starting next word (default 300)
 *  style: Text style
 */
export default function Typewriter({
  words = [],
  typeSpeed = 60,
  deleteSpeed = 30,
  pauseAfterType = 1200,
  pauseAfterDelete = 300,
  style,
}) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState('typing');
  const [cursorBlink, setCursorBlink] = useState(true);
  const timer = useRef(null);

  // Cursor blink (always visible, just blinks)
  useEffect(() => {
    const blink = setInterval(() => setCursorBlink(b => !b), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (!words.length) return;
    const current = words[wordIdx];

    if (phase === 'typing') {
      if (text.length < current.length) {
        timer.current = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeSpeed
        );
      } else {
        // Finished typing; pause then delete (always loop, even last word)
        timer.current = setTimeout(() => setPhase('deleting'), pauseAfterType);
      }
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timer.current = setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          deleteSpeed
        );
      } else {
        // Move to next word (loop back to 0 when end reached)
        timer.current = setTimeout(() => {
          setPhase('typing');
          setWordIdx((i) => (i + 1) % words.length);
        }, pauseAfterDelete);
      }
    }

    return () => clearTimeout(timer.current);
  }, [text, phase, wordIdx, words]);

  return (
    <Text style={style}>
      {text}
      <Text style={{ opacity: cursorBlink ? 1 : 0 }}>|</Text>
    </Text>
  );
}
