import { cn } from "@/lib/utils";

type DefaultAvatarSize = "sm" | "md";

type DefaultAvatarProps = {
  name?: string | null;
  size?: DefaultAvatarSize;
  className?: string;
};

const sizeClasses: Record<DefaultAvatarSize, string> = {
  sm: "size-9 text-sm sm:size-10",
  md: "size-10 text-sm",
};

export function DefaultAvatar({
  name,
  size = "md",
  className,
}: DefaultAvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() || "L";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-neutral-950 font-bold text-white",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}
