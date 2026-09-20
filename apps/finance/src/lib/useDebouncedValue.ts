import { useEffect, useRef, useState } from 'react';

/**
 * Return a copy of `value` that only settles after `delay` ms of stillness.
 *
 * Used to keep the result live region from firing on every keystroke: typing
 * "450000" would otherwise announce six intermediate answers. The final value
 * always arrives, so no update is ever silently swallowed.
 */
export function useDebouncedValue<T>(value: T, delay = 700): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
}

/**
 * Track the last non-empty announcement so an unrelated re-render (a hover, a
 * tab switch) cannot repeat the same sentence. Returns the message to speak,
 * or '' when there is nothing new.
 */
export function useAnnouncementOnce(message: string): string {
  const lastSpoken = useRef<string>('');

  useEffect(() => {
    if (message && message !== lastSpoken.current) {
      lastSpoken.current = message;
    }
  }, [message]);

  return message === lastSpoken.current || !message ? '' : message;
}
