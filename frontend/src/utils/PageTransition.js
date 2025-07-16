import { motion } from "framer-motion";

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 15 }} // Estado inicial (invisível e um pouco à direita)
    animate={{ opacity: 1, x: 0 }}  // Estado final (visível e na posição correta)
    exit={{ opacity: 0, x: -15 }}   // Estado de saída (invisível e um pouco à esquerda)
    transition={{ duration: 0.3 }}  // Duração da animação (0.3 segundos)
  >
    {children}
  </motion.div>
);

export default PageTransition;