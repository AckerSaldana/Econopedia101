import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Props {
  slug: string;
}

export default function LikeButton({ slug }: Props) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(`liked_${slug}`) === "1");

    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_slug", slug)
      .then(({ count: c }) => {
        if (c !== null) setCount(c);
      });
  }, [slug]);

  const handleLike = async () => {
    if (liked || busy) return;
    setBusy(true);

    setCount((prev) => prev + 1);
    setLiked(true);
    localStorage.setItem(`liked_${slug}`, "1");

    const { error } = await supabase.from("likes").insert({ post_slug: slug });

    if (error) {
      setCount((prev) => prev - 1);
      setLiked(false);
      localStorage.removeItem(`liked_${slug}`);
    }

    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked}
      className={`inline-flex items-center gap-1.5 px-3 h-9 border text-sm transition-colors ${
        liked
          ? "border-accent/30 text-accent"
          : "border-border text-text-muted hover:text-text-primary hover:bg-surface-elevated"
      }`}
      aria-label={liked ? "Liked" : "Like this article"}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>{count}</span>
    </button>
  );
}
