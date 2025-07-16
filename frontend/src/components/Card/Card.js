const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#201b5d] p-4 rounded-xl shadow-lg border border-slate-200 dark:border-transparent ${className}`}>
    {children}
  </div>
);
export default Card;