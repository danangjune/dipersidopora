import { useEffect, useState } from "react";
import { asset } from "../data/siteContent";
import ClipboardDocumentCheckIcon from "@heroicons/react/24/outline/ClipboardDocumentCheckIcon";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import QrCodeIcon from "@heroicons/react/24/outline/QrCodeIcon";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";

const questions = [
  "Kesesuaian persyaratan pelayanan",
  "Kemudahan prosedur pelayanan",
  "Kecepatan waktu pelayanan",
  "Kewajaran biaya/tarif",
  "Kesesuaian produk layanan",
  "Kompetensi petugas",
  "Perilaku petugas",
  "Kualitas sarana prasarana",
  "Penanganan pengaduan layanan",
];

const questionGroups = [
  { title: "Persyaratan & Prosedur", indices: [0, 1] },
  { title: "Waktu & Biaya", indices: [2, 3] },
  { title: "Produk & Kompetensi", indices: [4, 5] },
  { title: "Perilaku & Sarana", indices: [6, 7] },
  { title: "Pengaduan", indices: [8] },
];

const scoreLabels = ["Tidak Baik", "Kurang Baik", "Baik", "Sangat Baik"];
const scoreColors = {
  A: "#166534",
  B: "#854d0e",
  C: "#991b1b",
  D: "#475569",
};

export default function SurveyPage() {
  const [summary, setSummary] = useState(null);
  const [setting, setSetting] = useState(null);
  const [form, setForm] = useState({
    nama: "",
    domisili: "",
    ...Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => [`U${i + 1}`, "4"]),
    ),
  });
  const [message, setMessage] = useState("");

  const loadSummary = () =>
    Promise.all([
      fetch("/api/survey/latest").then((r) => r.json()),
      fetch("/api/site/survey-setting")
        .then((r) => r.json())
        .catch(() => ({ data: null })),
    ]).then(([d, s]) => {
      setSummary(d.data);
      setSetting(s.data || d.data?.setting);
    });
  useEffect(() => {
    loadSummary();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("Menyimpan...");
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(
      data.message || (res.ok ? "Berhasil disimpan." : "Gagal menyimpan."),
    );
    if (res.ok) {
      setForm({
        nama: "",
        domisili: "",
        ...Object.fromEntries(
          Array.from({ length: 9 }, (_, i) => [`U${i + 1}`, "4"]),
        ),
      });
      loadSummary();
    }
  };

  const scoreClass =
    summary?.mutu === "A"
      ? "scoreA"
      : summary?.mutu === "B"
        ? "scoreB"
        : summary?.mutu === "C"
          ? "scoreC"
          : "scoreD";

  return (
    <section className="section">
      <div className="sectionTitle">
        <span>
          <ClipboardDocumentCheckIcon
            style={{ width: 16, height: 16, verticalAlign: -2 }}
          />{" "}
          Survey
        </span>
        <h1>{setting?.title || "Survey Kepuasan Masyarakat"}</h1>
        <p>
          {setting?.description ||
            "Survey mengacu pada SKM KemenPANRB. Hasil digunakan untuk perbaikan layanan secara berkelanjutan."}
        </p>
      </div>

      <div className="surveyGrid">
        <form className="surveyForm" onSubmit={submit}>
          <div className="surveyFormHeader">
            <ClipboardDocumentCheckIcon
              style={{ width: 22, height: 22 }}
            />
            <span>Form SKM Internal</span>
          </div>

          <div className="surveyFormRow">
            <label className="surveyField">
              <span>Nama</span>
              <input
                value={form.nama}
                onChange={(e) =>
                  setForm({ ...form, nama: e.target.value })
                }
                required
                placeholder="Nama lengkap"
              />
            </label>
            <label className="surveyField">
              <span>Domisili</span>
              <input
                value={form.domisili}
                onChange={(e) =>
                  setForm({ ...form, domisili: e.target.value })
                }
                required
                placeholder="Kecamatan / Kota"
              />
            </label>
          </div>

          {questionGroups.map((group) => (
            <div key={group.title} className="surveyQuestionGroup">
              <h4>{group.title}</h4>
              {group.indices.map((i) => (
                <label key={questions[i]} className="surveyQuestion">
                  <span>
                    {i + 1}. {questions[i]}
                  </span>
                  <div className="surveyOptions">
                    {scoreLabels.map((label, si) => {
                      const val = String(4 - si);
                      return (
                        <button
                          key={val}
                          type="button"
                          className={
                            form[`U${i + 1}`] === val
                              ? "optBtn active"
                              : "optBtn"
                          }
                          onClick={() =>
                            setForm({ ...form, [`U${i + 1}`]: val })
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </label>
              ))}
            </div>
          ))}

          <div className="surveySubmitRow">
            <button className="btn" type="submit">
              <ClipboardDocumentCheckIcon
                style={{ width: 18, height: 18 }}
              />
              Kirim Survey
            </button>
            {message && (
              <p className="surveyMessage">{message}</p>
            )}
          </div>
        </form>

        <aside className="surveyAside">
          <div className="surveyScoreCard">
            <div className="surveyScoreHeader">
              <ChartBarIcon style={{ width: 20, height: 20 }} />
              <span>Hasil Terbaru</span>
            </div>
            <div className={`surveyScore ${scoreClass}`}>
              <strong>{summary?.nilai_interval ?? 0}</strong>
              <span>{summary?.mutu || "-"}</span>
            </div>
            <p>{summary?.kategori || "Belum ada data"}</p>
            <div className="surveyMeta">
              <UserGroupIcon style={{ width: 16, height: 16 }} />
              <span>
                Total responden: {summary?.total_votes ?? 0}
              </span>
            </div>
          </div>

          {setting?.qr_image && (
            <div className="surveyCard">
              <div className="surveyCardTitle">
                <QrCodeIcon style={{ width: 18, height: 18 }} />
                <span>Scan Barcode</span>
              </div>
              <img
                className="qrImage"
                src={asset(setting.qr_image)}
                alt="Barcode SKM"
              />
            </div>
          )}

          {setting?.external_url && (
            <a
              className="btn surveyExternalBtn"
              href={setting.external_url}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowTopRightOnSquareIcon
                style={{ width: 18, height: 18 }}
              />
              Buka Link Survey
            </a>
          )}
        </aside>
      </div>
    </section>
  );
}
