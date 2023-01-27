import { useEffect, useRef, useState } from 'react';

const useCountDown: (
  total: number,
  ms?: number,
) => [number, () => void, () => void, () => void] = (
  total: number,
  ms: number = 1000,
) => {
  const [counter, setCountDown] = useState(total);
  const [startCountDown, setStartCountDown] = useState(false);
  // Store the created interval
  const intervalId = useRef<any>();
  const start: () => void = () => setStartCountDown(true);
  const pause: () => void = () => setStartCountDown(false);
  const reset: () => void = () => {
    clearInterval(intervalId.current);
    setStartCountDown(false);
    setCountDown(total);
  };

  useEffect(() => {
    intervalId.current = setInterval(() => {
      if (startCountDown && counter > 0) {
        setCountDown((prev) => prev - 1);
      }
    }, ms);
    // Clear interval when count to zero
    if (counter === 0) clearInterval(intervalId.current);
    // Clear interval when unmount
    return () => clearInterval(intervalId.current);
  }, [startCountDown, counter, ms]);

  return [counter, start, pause, reset];
};

export default useCountDown;
