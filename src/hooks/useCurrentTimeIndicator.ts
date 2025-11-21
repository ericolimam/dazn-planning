import { useState, useEffect } from 'react';

export const useCurrentTimeIndicator = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate position in minutes from 5:00 AM
  const getCurrentPositionMinutes = () => {
    let hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    
    // Adjust for 5am start - if before 5am, treat as next day
    if (hour < 5) hour += 24;
    
    return (hour - 5) * 60 + minutes;
  };

  // Check if current time is within an event's time range
  const isEventCurrentlyAiring = (startDate: Date, endDate: Date) => {
    const now = currentTime.getTime();
    return now >= startDate.getTime() && now <= endDate.getTime();
  };

  return {
    currentTime,
    currentPositionMinutes: getCurrentPositionMinutes(),
    isEventCurrentlyAiring,
  };
};
