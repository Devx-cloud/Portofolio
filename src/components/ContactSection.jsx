import { Send } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const ContactSection = () => {
  return (
    <section id="contact" className="flex items-start justify-center px-4 pt-2 pb-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl bg-card border border-border rounded-lg p-6 shadow-lg"
      >
        <motion.h2 variants={itemVariants} className="pixel-font text-2xl md:text-3xl font-bold mb-2 text-center">
          Get In <span className="text-primary">Touch</span>
        </motion.h2>
        <motion.p variants={itemVariants} className="text-center text-muted-foreground text-sm mb-5">
          Ada proyek atau ide yang ingin didiskusikan? Kirim pesan lewat form di bawah.
        </motion.p>

        <form className="space-y-3">
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
              placeholder="Deva Surya..."
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary"
              placeholder="deva@gmail.com"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={3}
              className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
              placeholder="Hallo, i'd like to talk about..."
            />
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="cosmic-button w-full flex items-center justify-center gap-2"
          >
            Send Message
            <Send size={16} />
          </motion.button>
        </form>
      </motion.div>
    </section>
  );
};
