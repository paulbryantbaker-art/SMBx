import { useDarkMode, DarkModeToggle } from '../shared/DarkModeToggle';

export default function BuyBelow() {
  const [dark, setDark] = useDarkMode();

  return (
    <div className="dark:bg-[#1a1c1e] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24">
        {/* Content will be rebuilt from Stitch */}
      </div>
      <DarkModeToggle dark={dark} setDark={setDark} />
    </div>
  );
}
