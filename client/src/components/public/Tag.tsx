type TagVariant = 'free' | 'paid';

interface TagProps {
  variant: TagVariant;
  children: React.ReactNode;
}

const styles: Record<TagVariant, string> = {
  free: 'bg-[#E8F5E9] text-[#2E7D32]',
  paid: 'bg-[#FFF0EB] text-[#D4714E]',
};

export default function Tag({ variant, children }: TagProps) {
  return (
    <span className={`inline-block text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}
