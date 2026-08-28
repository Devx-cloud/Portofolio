import { motion } from "framer-motion";
import { DirectChannels } from "./components/DirectChannels";
import { MessageForm } from "./components/MessageForm";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const ContactSection = () => (
  <section id="contact" className="relative px-4 pt-4 pb-16 md:pt-6 md:pb-20">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-5xl"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8 flex flex-col items-center gap-3 text-center md:mb-10"
      >
        <h2 className="pixel-font text-pix-lg font-bold md:text-pix-xl">
          Get In <span className="text-primary">Touch</span>
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Punya ide proyek, tawaran kerja, atau sekadar ingin berdiskusi soal teknologi? Pilih jalur
          tercepat di kiri, atau tinggalkan pesan lewat form.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-5">
        <motion.div variants={itemVariants}>
          <DirectChannels />
        </motion.div>
        <motion.div variants={itemVariants}>
          <MessageForm />
        </motion.div>
      </div>
    </motion.div>
  </section>
);
