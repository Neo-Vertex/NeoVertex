import { useEffect, useRef } from 'react';

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.018;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${a})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 88) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,175,55,${0.07 * (1 - dist / 88)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      />
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div style={{
          position:'absolute', width:600, height:600, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,175,55,0.13) 0%, transparent 70%)',
          top:-200, left:-150, filter:'blur(90px)',
          animation:'driftA 14s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(170,100,15,0.08) 0%, transparent 70%)',
          bottom:-150, right:100, filter:'blur(90px)',
          animation:'driftB 17s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          top:'45%', right:-60, filter:'blur(80px)',
          animation:'driftC 10s ease-in-out infinite alternate',
        }} />
      </div>
    </>
  );
}
