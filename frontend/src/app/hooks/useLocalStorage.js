import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Always initialize state with the default value on both server and client
  const [storedValue, setStoredValue] = useState(initialValue);

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // This effect runs only on the client, after the initial render.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage; 