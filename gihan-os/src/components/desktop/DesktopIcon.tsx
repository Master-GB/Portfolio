"use client";

interface Props {
  title: string;
  icon: React.ElementType;
  onClick: () => void;
}

export default function DesktopIcon({
  title,
  icon: Icon,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
     className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition"
    >
      <Icon size={36} />
      <span>{title}</span>
    </button>
  );
}