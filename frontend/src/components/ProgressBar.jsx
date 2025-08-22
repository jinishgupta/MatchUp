import { motion } from "framer-motion";

function ProgressBar({ value, maxValue, className, variant = "blue", showLabel = true }) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  // Define color classes based on variant
  const getColorClass = () => {
    switch (variant) {
      case 'red':
        return 'bg-gradient-to-r from-red-600 to-red-500';
      case 'yellow':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-500';
      case 'green':
        return 'bg-gradient-to-r from-green-600 to-green-500';
      case 'blue':
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-500';
    }
  };
  
  return (
    <div className={`w-full flex items-center gap-2 ${className}`}>
      <div className="w-full bg-slate-700 rounded-full overflow-hidden h-2">
        <motion.div
          className={`${getColorClass()} h-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
      
      {showLabel && (
        <div className="text-xs text-gray-400 w-8 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export default ProgressBar; 