import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QuizScreen } from '@/types/quiz';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  screen: QuizScreen;
  onNext: () => void;
}

export function WelcomeScreen({ screen, onNext }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        {screen.imageUrl && (
          <img 
            src={screen.imageUrl} 
            alt="" 
            className="w-32 h-32 mx-auto mb-6 rounded-2xl object-cover shadow-soft"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent gradient-primary">
          {screen.title}
        </h1>
        {screen.subtitle && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
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
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={onNext}
          className="gradient-primary text-primary-foreground px-8 py-6 text-lg rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 group"
        >
          {screen.buttonText || 'Começar'}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
