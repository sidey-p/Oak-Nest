import { useEffect, useState } from 'react';
import { Sparkles, Truck, Leaf, Home } from 'lucide-react';

const MESSAGES = [
  { icon: Sparkles, text: 'Thoughtfully designed for the spaces you love.' },
  { icon: Truck, text: 'Easy delivery and order tracking for a smoother shopping experience.' },
  { icon: Leaf, text: 'Discover furniture designed for the way you live.' },
  { icon: Sparkles, text: 'New pieces. Fresh spaces. Better living.' },
  { icon: Home, text: 'Welcome to Oak & Nest — make room for what matters.' },
];

const AnnouncementBar = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const { icon: Icon, text } = MESSAGES[idx];

  return (
    <div className="relative z-50 bg-brand-950 text-brand-100">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-center">
        <Icon className="h-3.5 w-3.5 text-gold-400" />
        <p key={idx} className="animate-fade-in text-[11px] font-semibold tracking-wide sm:text-xs">
          {text}
        </p>
      </div>
    </div>
  );
};

export default AnnouncementBar;
