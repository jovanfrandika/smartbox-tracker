import { useRef, useEffect } from 'react';

type Props = {
  cb: () => any;
  delay: number;
};

const useInterval = ({ cb, delay }: Props) => {
  const savedCallback = useRef<() => any>();

  useEffect(() => {
    savedCallback.current = cb;
  }, [cb]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, []);
};

export default useInterval;
