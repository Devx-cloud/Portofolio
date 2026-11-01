import { useState } from "react";
import { useMotionValueEvent } from "framer-motion";

/* Membaca MotionValue sebagai state, hanya di komponen yang memanggilnya.
   Sinyal scroll sengaja disimpan sebagai MotionValue, bukan state ProfileSection:
   state di sana merender ulang seluruh panggung (ratusan bintang, kunang-kunang,
   keempat panel) tiap kali gerakan scroll mulai atau berhenti - tepat saat
   frame paling dibutuhkan. */
export const useMotionState = (value) => {
  const [current, setCurrent] = useState(() => value.get());
  useMotionValueEvent(value, "change", setCurrent);
  return current;
};
