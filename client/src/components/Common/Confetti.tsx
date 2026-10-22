import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 }
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 }
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const triggerSmallCelebration = () => {
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { y: 0.8 }
  });
};
