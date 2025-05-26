import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const History = ({ history, handleDelete }) => {
  const handleDownload = (index) => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "normal");
    doc.text(`Summary ${index + 1}:\n`, 10, 10);
    const lines = doc.splitTextToSize(history[index], 180);
    doc.text(lines, 10, 20);
    doc.save(`summary_${index + 1}.pdf`);
  };

  return (
    <div vlasName="bg-gray-400 p-4 rounded shadow-lg w-full max-w-md">
      <section className="mt-8 bg-blue-150 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 bg-gray-400 text-gray-950 p-2 rounded text-center">
          Riwayat Ringkasan
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-50">Tidak ada riwayat ringkasan.</p>
        ) : (
          <ul className="list-disc list-inside text-gray-950 flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2">
            {history.map((item, index) => (
              <li
                key={index}
                className="flex flex-col gap-2 p-2 border-b border-b-gray-800"
              >
                <div>
                  <h1 className="text-black font-semibold">
                    Summary {index + 1}:
                  </h1>
                  <ReactMarkdown>{item}</ReactMarkdown>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleDownload(index)}
                    className="px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 transition"
                  >
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default History;
