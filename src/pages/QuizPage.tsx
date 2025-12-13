import { forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

const QuizPage = forwardRef<HTMLDivElement>((_, ref) => {
  const { slug } = useParams<{ slug: string }>();
  
  return <QuizPlayer ref={ref} slug={slug} />;
});

QuizPage.displayName = 'QuizPage';

export default QuizPage;
