import { useEffect } from 'react';
import AdminNav from './AdminNav';
import { useAdminRouter } from './useAdminRouter';
import AdminDashboard from './pages/AdminDashboard';
import PostList from './pages/PostList';
import PostEditor from './pages/PostEditor';
import QuizList from './pages/QuizList';
import QuizEditor from './pages/QuizEditor';

interface AdminShellProps {
  signOut: () => void;
}

export default function AdminShell({ signOut }: AdminShellProps) {
  const { path, navigate } = useAdminRouter();

  // Lock body scroll so the admin shell owns the full viewport
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.margin = '';
    };
  }, []);

  const renderPage = () => {
    // /admin/posts/new
    if (path === '/admin/posts/new') {
      return <PostEditor navigate={navigate} />;
    }
    // /admin/posts/:id (edit)
    const postEditMatch = path.match(/^\/admin\/posts\/(.+)$/);
    if (postEditMatch) {
      return <PostEditor postId={postEditMatch[1]} navigate={navigate} />;
    }
    // /admin/posts
    if (path.startsWith('/admin/posts')) {
      return <PostList navigate={navigate} />;
    }
    // /admin/quizzes/:id (edit)
    const quizEditMatch = path.match(/^\/admin\/quizzes\/(.+)$/);
    if (quizEditMatch && quizEditMatch[1] !== 'new') {
      return <QuizEditor quizId={quizEditMatch[1]} navigate={navigate} />;
    }
    // /admin/quizzes/new
    if (path === '/admin/quizzes/new') {
      return <QuizEditor navigate={navigate} />;
    }
    // /admin/quizzes
    if (path.startsWith('/admin/quizzes')) {
      return <QuizList navigate={navigate} />;
    }
    // /admin (dashboard)
    return <AdminDashboard navigate={navigate} />;
  };

  return (
    <div
      className="fixed inset-0 flex overflow-hidden"
      style={{ borderTop: '2px solid var(--color-accent)' }}
    >
      <AdminNav path={path} navigate={navigate} signOut={signOut} />
      <main
        className="flex-1 min-w-0 overflow-y-auto"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {renderPage()}
      </main>
    </div>
  );
}
