import { useEffect, useState } from "react";

export default function Timer({ duration, onEnd }) {
  const [time, setTime] = useState(duration * 60);

  useEffect(() => {
    if (time <= 0) {
      onEnd();
      return;
    }

    const timer = setInterval(() => {
      setTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  return (
    <h2>
      Time Left: {Math.floor(time / 60)}:
      {String(time % 60).padStart(2, "0")}
    </h2>
  );
}
