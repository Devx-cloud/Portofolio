import { useEffect, useRef, useState } from "react";

export const useChatAgent = (initialMessage) => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: initialMessage },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    // Reset history on every question so the dialogue box only ever shows the latest exchange.
    setMessages([{ role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        let errorMsg =
          response.status === 503
            ? "Server AI lagi sibuk. Coba tanya lagi beberapa saat lagi ya."
            : "Gagal menghubungi server. Coba lagi ya.";
        try {
          const errData = await response.json();
          if (errData.message) errorMsg = errData.message;
          // Sementara: tampilkan penyebab teknis buat diagnosa.
          if (errData.detail) errorMsg += `\n\n[${errData.detail}]`;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setMessages([{ role: "user", content: userMessage }, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      // TypeError = fetch gagal total (offline / server mati), belum sempat dapat respons.
      const friendly =
        error.name === "TypeError"
          ? "Nggak bisa terhubung ke server. Cek koneksi internetmu lalu coba lagi."
          : error.message || "Terjadi kesalahan. Coba lagi ya.";
      setMessages([{ role: "user", content: userMessage }, { role: "assistant", content: friendly }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, input, setInput, isLoading, handleSubmit, messagesContainerRef };
};
