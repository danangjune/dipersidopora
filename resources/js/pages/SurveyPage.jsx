import { useEffect, useState } from 'react';
import { asset } from '../data/siteContent';

const questions = [
  'Kesesuaian persyaratan pelayanan', 'Kemudahan prosedur pelayanan', 'Kecepatan waktu pelayanan', 'Kewajaran biaya/tarif', 'Kesesuaian produk layanan', 'Kompetensi petugas', 'Perilaku petugas', 'Kualitas sarana prasarana', 'Penanganan pengaduan layanan'
];

export default function SurveyPage() {
  const [summary, setSummary] = useState(null);
  const [setting, setSetting] = useState(null);
  const [form, setForm] = useState({ nama: '', domisili: '', ...Object.fromEntries(Array.from({length:9}, (_,i)=>[`U${i+1}`, '4'])) });
  const [message, setMessage] = useState('');

  const loadSummary = () => Promise.all([
    fetch('/api/survey/latest').then(r=>r.json()),
    fetch('/api/site/survey-setting').then(r=>r.json()).catch(()=>({data:null})),
  ]).then(([d, s]) => { setSummary(d.data); setSetting(s.data || d.data?.setting); });
  useEffect(() => { loadSummary(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setMessage('Menyimpan...');
    const res = await fetch('/api/survey', {method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify(form)});
    const data = await res.json();
    setMessage(data.message || (res.ok ? 'Berhasil disimpan.' : 'Gagal menyimpan.'));
    if (res.ok) { setForm({ nama:'', domisili:'', ...Object.fromEntries(Array.from({length:9}, (_,i)=>[`U${i+1}`, '4'])) }); loadSummary(); }
  };

  return <section className="section surveyPage">
    <div className="sectionTitle"><span>Survey</span><h1>{setting?.title || 'Survey Kepuasan Masyarakat'}</h1><p>{setting?.description || 'Survey mengacu pada SKM KemenPANRB. Link survey dan barcode bisa diganti dari Admin Page.'}</p></div>
    <div className="surveyGrid">
      <form className="cardForm" onSubmit={submit}>
        <h2>Form SKM Internal</h2>
        <label>Nama<input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} required /></label>
        <label>Domisili<input value={form.domisili} onChange={e=>setForm({...form,domisili:e.target.value})} required /></label>
        {questions.map((q,i) => <label key={q}>{i+1}. {q}<select value={form[`U${i+1}`]} onChange={e=>setForm({...form,[`U${i+1}`]:e.target.value})}><option value="4">Sangat Baik</option><option value="3">Baik</option><option value="2">Kurang Baik</option><option value="1">Tidak Baik</option></select></label>)}
        <button className="btn" type="submit">Kirim Survey</button>{message && <p>{message}</p>}
      </form>
      <aside className="summaryCard surveyAside"><h2>Survey KemenPANRB</h2>{setting?.qr_image && <img className="qrImage" src={asset(setting.qr_image)} alt="Barcode SKM" />}{setting?.external_url && <a className="btn" href={setting.external_url} target="_blank" rel="noreferrer">Buka Link Survey</a>}<hr /><h2>Hasil Terbaru</h2><strong>{summary?.nilai_interval ?? 0}</strong><p>{summary?.kategori || 'Belum ada data'}</p><small>Total responden: {summary?.total_votes ?? 0}</small></aside>
    </div>
  </section>;
}
