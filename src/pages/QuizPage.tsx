import { useParams } from 'react-router-dom';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  
  return <QuizPlayer slug={slug} />;
}
