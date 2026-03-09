import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/useAuth";

interface Comment {
  id: number;
  post_slug: string;
  user_id: string;
  user_name: string;
  user_avatar_url: string | null;
  body: string;
  created_at: string;
}

interface Props {
  slug: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-8 h-8 object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div className="w-8 h-8 bg-surface-elevated flex items-center justify-center text-xs font-medium text-text-secondary">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function AuthPanel({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    if (mode === "signin") {
      const { error: err } = await signInWithEmail(email, password);
      if (err) setError(err.message);
      else onSuccess();
    } else {
      const { error: err } = await signUpWithEmail(email, password);
      if (err) setError(err.message);
      else setMessage("Check your email to confirm your account.");
    }

    setBusy(false);
  };

  return (
    <div className="border border-border p-6">
      <p className="text-sm font-medium text-text-primary mb-4">
        Sign in to leave a comment
      </p>

      <button
        type="button"
        onClick={() => signInWithGoogle()}
        className="w-full flex items-center justify-center gap-2 h-10 border border-border text-sm font-medium text-text-primary hover:bg-surface-elevated transition-colors mb-4"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-text-muted">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-10 px-3 border border-border bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full h-10 px-3 border border-border bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-accent">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full h-10 bg-text-primary text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {busy ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <p className="mt-3 text-xs text-text-muted">
        {mode === "signin" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-accent hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-accent hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

export default function CommentsSection({ slug }: Props) {
  const { user, loading, signOut } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_slug", slug)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim() || posting) return;
    setPosting(true);

    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const avatarUrl = user.user_metadata?.avatar_url || null;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_slug: slug,
        user_id: user.id,
        user_name: userName,
        user_avatar_url: avatarUrl,
        body: body.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data]);
      setBody("");
    }

    setPosting(false);
  };

  const handleDelete = async (commentId: number) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  return (
    <section className="font-sans">
      <h2 className="text-lg font-semibold text-text-primary mb-6">
        Comments{comments.length > 0 && ` (${comments.length})`}
      </h2>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="mb-8 divide-y divide-border border-t border-border">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4">
              <div className="flex items-start gap-3">
                <Avatar
                  name={comment.user_name}
                  url={comment.user_avatar_url}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">
                      {comment.user_name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {relativeTime(comment.created_at)}
                    </span>
                    {user?.id === comment.user_id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-text-muted hover:text-red-600 transition-colors ml-auto"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap break-words">
                    {comment.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auth or compose */}
      {loading ? (
        <div className="text-sm text-text-muted">Loading...</div>
      ) : user ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-text-secondary">
              Signed in as{" "}
              <span className="font-medium text-text-primary">
                {user.user_metadata?.full_name || user.email}
              </span>
            </p>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Sign out
            </button>
          </div>
          <form onSubmit={handlePost}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment..."
              maxLength={2000}
              rows={3}
              required
              className="w-full p-3 border border-border bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={posting || !body.trim()}
                className="px-4 h-9 bg-text-primary text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {posting ? "Posting..." : "Post comment"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <AuthPanel onSuccess={() => {}} />
      )}
    </section>
  );
}
