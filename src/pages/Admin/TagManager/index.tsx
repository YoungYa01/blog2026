import { motion } from "framer-motion";

type Props = {};

const TagManager: React.FC<Props> = () => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <h1>标签</h1>
    </motion.div>
  );
};

export default TagManager;
