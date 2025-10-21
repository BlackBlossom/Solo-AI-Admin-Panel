import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '',
  hover = false,
  glass = true,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      className={`${
        glass 
          ? 'backdrop-blur-xl bg-white/10 border border-purple-500/20 shadow-xl shadow-purple-900/10' 
          : 'bg-white shadow-md'
      } rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-purple-500/20 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-purple-200/70 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
