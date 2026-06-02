import { useEffect, useState } from 'react';

export function useKeyboard() {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    grab: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys((keys) => {
        switch (e.code) {
          case 'KeyW': return { ...keys, forward: true };
          case 'KeyS': return { ...keys, backward: true };
          case 'KeyA': return { ...keys, left: true };
          case 'KeyD': return { ...keys, right: true };
          case 'ArrowUp': return { ...keys, povUp: true };
          case 'ArrowDown': return { ...keys, povDown: true };
          case 'ArrowLeft': return { ...keys, povLeft: true };
          case 'ArrowRight': return { ...keys, povRight: true };
          case 'Space': return { ...keys, up: true };
          case 'ShiftLeft':
          case 'ShiftRight': return { ...keys, down: true };
          case 'KeyE': return { ...keys, grab: true };
          default: return keys;
        }
      });
    };

    const handleKeyUp = (e) => {
      setKeys((keys) => {
        switch (e.code) {
          case 'KeyW': return { ...keys, forward: false };
          case 'KeyS': return { ...keys, backward: false };
          case 'KeyA': return { ...keys, left: false };
          case 'KeyD': return { ...keys, right: false };
          case 'ArrowUp': return { ...keys, povUp: false };
          case 'ArrowDown': return { ...keys, povDown: false };
          case 'ArrowLeft': return { ...keys, povLeft: false };
          case 'ArrowRight': return { ...keys, povRight: false };
          case 'Space': return { ...keys, up: false };
          case 'ShiftLeft':
          case 'ShiftRight': return { ...keys, down: false };
          case 'KeyE': return { ...keys, grab: false };
          default: return keys;
        }
      });
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) setKeys((k) => ({ ...k, grab: true }));
    };
    const handleMouseUp = (e) => {
      if (e.button === 0) setKeys((k) => ({ ...k, grab: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return keys;
}
