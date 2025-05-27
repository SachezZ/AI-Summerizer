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
    <div className="bg-gray-400 p-4 rounded shadow-lg w-full min-h-[500px]">
      <p className="mb-4 text-lg bg-gray-600 rounded text-gray-50 p-2 font-semibold">
        Masukkan teks untuk diringkas:
      </p>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="mb-4 p-2 border rounded bg-gray-300"
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
            className="w-145 p-3 bg-gray-300 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 break-all size-x-4 "
            rows=""
            placeholder="Masukkan teks di sini"
            style={{ overflow: "hidden" }}
          ></textarea>
          {fileLoading && (
            <div className="text-blue-500 mt-2">Sedang memproses file...</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSummarize}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
            disabled={fileLoading}
          >
            {fileLoading ? "Tunggu file selesai..." : "Ringkas"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
      <input
        id="file-upload"
        type="file"
        accept="image/*,application/pdf"
        onChange={handleImageUpload}
        className="hidden"
      />
      <label
        htmlFor="file-upload"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition border mb-4"
      >
        Choose File
      </label>
      <section className="mt-8 bg-gray-300 p-4 rounded shadow">
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
    </div>
  );
};

export default Summarizer;
