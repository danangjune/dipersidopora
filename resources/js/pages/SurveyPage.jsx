import { useEffect, useState } from "react";
import QRCode from "qrcode";
import ClipboardDocumentCheckIcon from "@heroicons/react/24/outline/ClipboardDocumentCheckIcon";
import QrCodeIcon from "@heroicons/react/24/outline/QrCodeIcon";
import ArrowTopRightOnSquareIcon from "@heroicons/react/24/outline/ArrowTopRightOnSquareIcon";

const DEFAULT_SURVEY_URL =
  "https://skm.go.id/share/instansi/e3a2df95-2de3-4b11-993d-9e37053593bd/1";

export default function SurveyPage() {
  const [setting, setSetting] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const surveyUrl = setting?.external_url || DEFAULT_SURVEY_URL;

  useEffect(() => {
    fetch("/api/site/survey-setting")
      .then((r) => r.json())
      .then((s) => setSetting(s.data || null))
      .catch(() => setSetting(null));
  }, []);

  useEffect(() => {
    QRCode.toDataURL(surveyUrl, { width: 240, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [surveyUrl]);

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
            "Survey mengacu pada SKM dari KemenPANRB. Silakan isi melalui tautan atau pindai kode QR di bawah ini."}
        </p>
      </div>

      <div className="surveyRedirect">
        <div className="surveyCard">
          <div className="surveyCardTitle">
            <QrCodeIcon style={{ width: 18, height: 18 }} />
            <span>Pindai untuk Mengisi Survei</span>
          </div>
          {qrDataUrl && (
            <img className="qrImage" src={qrDataUrl} alt="QR Code Survei SKM" />
          )}
          atau 
          <a
            className="btn surveyExternalBtn"
            href={surveyUrl}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowTopRightOnSquareIcon style={{ width: 18, height: 18 }} />
            Isi Survei SKM
          </a>
        </div>
      </div>
    </section>
  );
}
