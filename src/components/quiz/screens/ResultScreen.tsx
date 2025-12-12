import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QuizScreen } from '@/types/quiz';
import { PartyPopper, ArrowRight } from 'lucide-react';

interface ResultScreenProps {
  screen: QuizScreen;
  onComplete: () => void;
}

export function ResultScreen({ screen, onComplete }: ResultScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-8 shadow-glow"
      >
        <PartyPopper className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{screen.title}</h1>
        {screen.subtitle && (
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            {screen.subtitle}
          </p>
        )}
        {screen.description && (
          <p className="text-sm text-muted-foreground mt-4">
            {screen.description}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          size="lg"
          onClick={onComplete}
          className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 group"
        >
          {screen.buttonText || 'Concluir'}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
