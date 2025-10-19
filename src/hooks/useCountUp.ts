import { useState, useEffect } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
}

export const useCountUp = ({ end, duration = 1000, start = 0, decimals = 0 }: UseCountUpOptions) => {
  const [current, setCurrent] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (end === current) return;

    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = current;
    const difference = end - startValue;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newValue = startValue + (difference * easeOutQuart);

      setCurrent(decimals > 0 ? 
        parseFloat(newValue.toFixed(decimals)) : 
        Math.floor(newValue)
      );

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCurrent(end);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration, decimals, current]);

  return { value: current, isAnimating };
};