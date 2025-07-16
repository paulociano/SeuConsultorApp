import { motion } from 'framer-motion';

const FlippableCard = ({ isFlipped, front, back }) => {
    return (
        // Define o ambiente 3D para o efeito de perspectiva
        <div style={{ perspective: '1200px' }}>
            <motion.div
                className="relative w-full h-[500px]" // Altura fixa para o card
                style={{ transformStyle: 'preserve-3d' }}
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                {/* Lado da Frente (Login) */}
                <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    {front}
                </div>
                {/* Lado de Trás (Cadastro), já pré-rotacionado */}
                <div className="absolute w-full h-full" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    {back}
                </div>
            </motion.div>
        </div>
    );
};

export default FlippableCard;