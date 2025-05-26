import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Summarizer = ({
  inputText,
  setInputText,
  summary,
  handleSummarize,
  handleReset,
  model,
  setModel,
  loading,
}) => {
  const [fileLoading, setFileLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true); // Set loading di awal

    if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";
          }
          // Tambahkan filter blockquote di sini
          const cleanText = (text) => {
            return text
              .split("\n")
              .filter((line) => !/^>{3,}/.test(line))
              .join("\n");
          };
          setInputText((prev) => prev + "\n" + cleanText(text));
        } catch (err) {
          alert("Gagal membaca PDF.");
        } finally {
          setFileLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith("image/")) {
      try {
        const { data } = await Tesseract.recognize(file, "eng");
        setInputText((prev) => prev + "\n" + data.text);
      } catch (err) {
        alert("Gagal membaca gambar.");
      } finally {
        setFileLoading(false);
      }
    } else {
      alert("File harus berupa gambar atau PDF.");
      setFileLoading(false);
    }
  };

  return (
    <>
      <p className="mb-4 text-lg">Masukkan teks untuk diringkas:</p>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="mb-4 p-2 border rounded bg-gray-400"
      >
        <option value="deepseek/deepseek-chat-v3-0324:free">DeepSeek V3</option>
        <option value="meta-llama/llama-3.3-70b-instruct:free">
          Llama 3.3 70B Instruct (Meta)
        </option>
        <option value="google/gemini-2.0-flash-exp:free">
          Gemini Flash 2.0 Experimental (Google)
        </option>
      </select>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            className="w-full p-3 bg-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 break-all size-x-1"
            rows=""
            placeholder="Masukkan teks di sini"
            style={{ overflow: "hidden" }}
          ></textarea>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleImageUpload}
            className="px-4 py-2 mt-2 bg-gray-400 text-gray-700 rounded hover:bg-gray-300 transition"
          />
          {fileLoading && (
            <div className="text-blue-500 mt-2">Sedang memproses file...</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSummarize}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={fileLoading}
          >
            {fileLoading ? "Tunggu file selesai..." : "Ringkas"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
      <section className="mt-8 bg-gray-400 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Hasil Ringkasan</h2>
        <div className="text-gray-700">
          {summary ? (
            <ReactMarkdown>{summary}</ReactMarkdown>
          ) : loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3">Memproses ringkasan...</span>
            </div>
          ) : (
            "Hasil ringkasan teks akan muncul di sini setelah proses ringkasan selesai."
          )}
        </div>
      </section>
    </>
  );
};

export default Summarizer;
