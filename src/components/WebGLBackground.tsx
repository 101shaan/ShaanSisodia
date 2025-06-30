import { useMemo, useEffect, useState } from 'react';

interface WebGLBackgroundProps {
  className?: string;
}

const WebGLBackground: React.FC<WebGLBackgroundProps> = ({ className = '' }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.01);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const gradientStyle = useMemo(() => ({
    background: `
      radial-gradient(
        ellipse at ${50 + Math.sin(time) * 20}% ${50 + Math.cos(time * 0.7) * 15}%,
        rgba(0, 255, 255, 0.1) 0%,
        rgba(0, 100, 255, 0.05) 30%,
        rgba(0, 0, 0, 0.8) 70%
      ),
      linear-gradient(
        ${time * 10}deg,
        rgba(0, 255, 255, 0.03) 0%,
        rgba(0, 0, 0, 0.9) 50%,
        rgba(255, 0, 255, 0.03) 100%
      )
    `,
    filter: `hue-rotate(${time * 30}deg)`
  }), [time]);

  return (
    <div
      className={`fixed inset-0 ${className}`}
      style={{
        ...gradientStyle,
        zIndex: -10,
        transition: 'all 0.1s ease-out'
      }}
    />
  );
};

export default WebGLBackground;