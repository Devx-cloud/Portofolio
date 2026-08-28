/*
 * PRNG bersemai (LCG). Dipakai kunang-kunang dan pejalan latar: keduanya butuh
 * pola yang berbeda satu sama lain tapi STABIL antar render - Math.random()
 * akan mengocok ulang tiap kali komponennya ter-render, dan panggung Profile
 * ter-render setiap babak berganti.
 */
export const seeded = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
