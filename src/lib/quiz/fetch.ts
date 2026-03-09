import { supabase } from '../supabase';
import type { Quiz } from './types';

export async function getQuizBySlug(slug: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as unknown as Quiz;
}

export async function recordAttempt(quizId: string, score: number, total: number) {
  await supabase.from('quiz_attempts').insert({
    quiz_id: quizId,
    score,
    total,
  });
}
