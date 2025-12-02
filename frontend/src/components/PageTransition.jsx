import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 40,
    scale: 0.95,
    filter: 'blur(12px)',
    clipPath: 'inset(0% 0% 100% 0%)'
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.97,
    filter: 'blur(8px)',
    clipPath: 'inset(100% 0% 0% 0%)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const childVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full"
        style={{ 
          width: '100%', 
          maxWidth: '100vw', 
          overflowX: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
        <motion.div 
          variants={childVariants}
          style={{ 
            width: '100%', 
            maxWidth: '100%',
            overflowX: 'hidden'
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;

