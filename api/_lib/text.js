/*
 * Kotak dialog menampilkan balasan apa adanya (whitespace-pre-line), dan Gemini
 * cenderung membalas dengan markdown meski sudah diminta tidak. Tanpa ini
 * pengunjung melihat tanda bintang mentah: "**Laravel**" alih-alih "Laravel".
 *
 * Sengaja hanya melepas penanda - isinya tidak disentuh.
 */
export const toPlainText = (text) =>
  String(text)
    .replace(/\r\n/g, "\n")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // judul
    .replace(/^\s*[*•]\s+/gm, "- ") // butir "* " atau "• " -> "- "
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, "$2") // tebal
    .replace(/(?<![*\w])\*(?=\S)([^*\n]+?)(?<=\S)\*(?![*\w])/g, "$1") // miring
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1") // kode
    .replace(/\n{3,}/g, "\n\n")
    .trim();
