import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  category: string;
  className?: string;
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Food: { bg: "bg-green-100", text: "text-green-800" },
  Rent: { bg: "bg-blue-100", text: "text-blue-800" },
  Utilities: { bg: "bg-yellow-100", text: "text-yellow-800" },
  Transportation: { bg: "bg-purple-100", text: "text-purple-800" },
  Entertainment: { bg: "bg-pink-100", text: "text-pink-800" },
  Shopping: { bg: "bg-indigo-100", text: "text-indigo-800" },
  Health: { bg: "bg-red-100", text: "text-red-800" },
  Education: { bg: "bg-cyan-100", text: "text-cyan-800" },
  Other: { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { bg, text } = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  
  return (
    <span className={cn(
      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full", 
      bg,
      text,
      className
    )}>
      {category}
    </span>
  );
}
