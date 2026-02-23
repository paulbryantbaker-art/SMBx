import PublicNav from './PublicNav';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
  /** Hide nav/footer for auth pages */
  minimal?: boolean;
}

export default function PublicLayout({ children, minimal }: Props) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#FAF8F4]">
      {!minimal && <PublicNav />}
      <main className="flex-1">{children}</main>
      {!minimal && <Footer />}
    </div>
  );
}
