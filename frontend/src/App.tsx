import React, { useState } from 'react';
import { 
  Upload, Sparkles, CheckCircle2, AlertTriangle, 
  Bot, Receipt, Boxes, MessageSquare, Send, RefreshCw, 
  ShieldCheck, Activity, QrCode
} from 'lucide-react';

interface BillItem {
  name: string;
  hsn: string;
  qty: number;
  price: number;
  gst: string;
  tax_amount?: number;
  total: number;
}

interface AnalysisResult {
  extracted_bill: { 
    vendor: string; 
    items: BillItem[]; 
    subtotal: number; 
    tax: number; 
    grand_total: number; 
  };
  inventory_sync: { 
    synced_items: Array<{ name: string; current_stock: number; min_threshold: number }>; 
    low_stock_alerts: Array<{ name: string; current_stock: number; min_threshold: number }>; 
  };
  hindi_advice: { 
    hindi: string; 
    english: string; 
    estimated_profit: number; 
    action: string; 
  };
  execution_time: number;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); 
      setPreview(URL.createObjectURL(e.target.files[0])); 
      setData(null); 
      setError(null);
    }
  };

  const runPipeline = async () => {
    if (!file) return;
    setLoading(true); setError(null); setActiveStep(1);
    const formData = new FormData(); formData.append('file', file);

    try {
      setTimeout(() => setActiveStep(2), 800);
      setTimeout(() => setActiveStep(3), 1600);
      setTimeout(() => setActiveStep(4), 2500);

      const res = await fetch('https://vyaparmind-ai.onrender.com/api/process-bill', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!res.ok) throw new Error("Server returned status " + res.status);
      const rawResult = await res.json();
      setData(rawResult.data ? rawResult.data : rawResult);
      setActiveStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to process bill. Please verify backend server.');
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalWhatsAppShare = () => {
    if (!data) return;
    
    const itemsListText = data.extracted_bill.items.map((item: any, idx: number) => 
      "*" + (idx + 1) + ". " + item.name + "*\n" +
      "   ▫️ HSN: " + item.hsn + " | Qty: " + item.qty + "\n" +
      "   ▫️ Rate: ₹" + item.price + " | *Total: ₹" + item.total + "*"
    ).join('\n\n');

    const whatsappMessage = [
      "🧾 *TAX INVOICE SUMMARY*",
      "*" + data.extracted_bill.vendor + "*",
      "-----------------------------------",
      "📋 *Invoice Ref:* VYAPAR-2026-MSME",
      "📅 *Date:* " + new Date().toLocaleDateString('en-IN'),
      "",
      "*Itemized Breakdown:*",
      itemsListText,
      "-----------------------------------",
      "🔹 *Subtotal:* ₹" + data.extracted_bill.subtotal,
      "🔹 *Tax (CGST + SGST):* ₹" + data.extracted_bill.tax,
      "🎯 *Grand Total:* *₹" + data.extracted_bill.grand_total + "*",
      "-----------------------------------",
      "⚡ *Pay Instantly via UPI:*",
      "https://pay.upi/pay?pa=merchant@upi&pn=" + encodeURIComponent(data.extracted_bill.vendor) + "&am=" + data.extracted_bill.grand_total + "&cu=INR",
      "",
      "_Verified & Processed autonomously by VyaparMind AI Copilot for Bharat MSMEs._"
    ].join('\n');

    window.open("https://wa.me/?text=" + encodeURIComponent(whatsappMessage), '_blank');
  };

  const handleUPIGenerate = () => {
    if (!data) return;
    const amount = data.extracted_bill.grand_total;
    const storeName = encodeURIComponent(data.extracted_bill.vendor);
    const upiUrl = "upi://pay?pa=merchant@upi&pn=" + storeName + "&am=" + amount + "&cu=INR";
    const qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(upiUrl);
    
    const win = window.open("", "UPI QR", "width=400,height=480");
    if (win) {
      const htmlContent = [
        "<div style='font-family: sans-serif; text-align: center; padding: 25px; background: #0a0f1c; color: white; height: 100%;'>",
        "<h3 style='margin-bottom: 5px; color: #38bdf8;'>Scan & Pay via UPI</h3>",
        "<p style='font-size: 13px; color: #94a3b8; margin-top: 0;'>Vendor: " + data.extracted_bill.vendor + "</p>",
        "<p style='font-size: 18px; font-weight: black; color: #34d399; margin: 10px 0;'>Amount: ₹" + amount + "</p>",
        "<img src='" + qrImageUrl + "' alt='Live UPI QR Code' style='margin: 15px auto; border-radius: 16px; border: 4px solid #1e293b; background: white; padding: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);' />",
        "<p style='font-size: 12px; font-weight: bold; color: #64748b; margin-top: 20px;'>● Live Gateway Connected</p>",
        "</div>"
      ].join('');
      win.document.write(htmlContent);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* GLOWING PREMIUM HEADER */}
      <header className="border-b border-white/5 bg-[#0a0f1c]/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[14px] shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                VyaparMind <span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-[10px] text-cyan-500 font-bold tracking-widest mt-0.5">AUTONOMOUS MSME BACK-OFFICE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Activity className="w-4 h-4 animate-pulse" /> ENGINE ACTIVE
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-5 space-y-8">
          {/* UPLOAD CARD GLOW */}
          <div className="p-[1px] rounded-[24px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
            <div className="p-8 rounded-[23px] bg-[#0b1121]">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                <Upload className="w-5 h-5 text-cyan-400" /> Ingest Invoice
              </h2>
              
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/20 hover:bg-[#0a1122]">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-60 rounded-xl object-contain shadow-2xl" />
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto shadow-inner">
                      <Receipt className="w-8 h-8 text-cyan-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">Drop MSME bill here</p>
                  </div>
                )}
              </label>

              <button
                onClick={runPipeline}
                disabled={!file || loading}
                className={`w-full mt-6 py-4 px-4 rounded-xl font-black tracking-wider flex items-center justify-center gap-2 transition-all ${
                  !file || loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-0.5'
                }`}
              >
                {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> EXECUTING AGENTS...</> : <><Sparkles className="w-5 h-5" /> RUN ANALYSIS</>}
              </button>

              {error && (
                <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 rounded-[24px] bg-[#0b1121] border border-white/5 shadow-2xl">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" /> Agent Chain
            </h2>
            <div className="space-y-4">
              {[
                { id: 1, name: 'Vision OCR Engine', sub: 'Extracting itemized layout' },
                { id: 2, name: 'Tax Reconciliation', sub: 'Verifying GST/HSN slabs' },
                { id: 3, name: 'Ledger Sync', sub: 'Updating live store inventory' },
                { id: 4, name: 'Vyapar Advisory', sub: 'Generating MSME insights' },
              ].map((agent) => {
                const isComplete = activeStep > agent.id || (activeStep === 4 && data);
                const isActive = activeStep === agent.id && loading;
                return (
                  <div key={agent.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isComplete ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                    isActive ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/5 text-slate-600'
                  }`}>
                    <div>
                      <p className="text-sm font-bold tracking-wide">{agent.name}</p>
                      <p className="text-[11px] opacity-70 mt-0.5">{agent.sub}</p>
                    </div>
                    {isComplete ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : isActive ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <div className="w-2 h-2 rounded-full bg-slate-700" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {data ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              <div className="p-8 rounded-[24px] bg-gradient-to-br from-[#0b1121] to-[#1e1b4b] border border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <MessageSquare className="w-40 h-40 text-indigo-400" />
                </div>
                
                <span className="px-3 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30 mb-5 inline-block">
                  Vyapar Guru Insight
                </span>
                
                <p className="text-lg font-medium text-white leading-relaxed mb-6">"{data.hindi_advice.hindi}"</p>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-2">English Strategy</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.hindi_advice.english}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-4 relative z-10">
                  <button 
                    onClick={handleProfessionalWhatsAppShare} 
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 text-white text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> DISPATCH WHATSAPP INVOICE
                  </button>
                  <button 
                    onClick={handleUPIGenerate} 
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> LIVE UPI QR RECONCILE
                  </button>
                </div>
              </div>

              <div className="p-8 rounded-[24px] bg-[#0b1121] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-400" /> {data.extracted_bill.vendor}
                </h3>
                
                <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="p-4 border-b border-white/5">Item Details</th>
                        <th className="p-4 border-b border-white/5">Qty</th>
                        <th className="p-4 border-b border-white/5">Rate</th>
                        <th className="p-4 border-b border-white/5 text-emerald-400">Tax</th>
                        <th className="p-4 border-b border-white/5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {data.extracted_bill.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-500 mt-1">HSN: {item.hsn}</p>
                          </td>
                          <td className="p-4 font-medium">{item.qty}</td>
                          <td className="p-4">₹{item.price}</td>
                          <td className="p-4 text-emerald-400 font-bold">{item.gst || `₹${item.tax_amount || 0}`}</td>
                          <td className="p-4 text-right font-black text-white">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="p-5 rounded-2xl bg-[#060913] border border-cyan-500/10 w-72 shadow-inner">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Subtotal</span>
                      <span className="font-bold text-white">₹{data.extracted_bill.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400 mb-4 pb-4 border-b border-white/10">
                      <span>Total Tax</span>
                      <span className="font-bold text-white">₹{data.extracted_bill.tax}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-cyan-400 tracking-wide">
                      <span>TOTAL</span>
                      <span>₹{data.extracted_bill.grand_total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[24px] bg-[#0b1121] border border-white/5 shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-400" /> Live Store Sync Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.inventory_sync.synced_items.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5 flex justify-between items-center hover:border-emerald-500/20 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Threshold: {item.min_threshold}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          {item.current_stock} STOCK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
             <div 
               className={
                 "h-full min-h-[550px] rounded-[24px] border-2 border-dashed " + 
                 "border-slate-800 flex flex-col items-center justify-center " + 
                 "text-center px-10 bg-[#0b1121]/50"
               }
             >
              <ShieldCheck className="w-16 h-16 text-slate-700 mb-6" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">Awaiting Ledger Input</h3>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Upload an invoice to watch the autonomous AI pipeline extract data, calculate taxes, and generate business insights in real-time.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}