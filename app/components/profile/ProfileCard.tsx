import { motion } from "framer-motion";

interface ProfileCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function ProfileCard({ icon, title, description, color }: ProfileCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        <div className={`${color} p-3 rounded-lg bg-opacity-10`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}