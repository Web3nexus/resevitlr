import React, { useState } from 'react'
import { Upload, Scan, FileText, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react'
import api from '../services/api'

export function AIScanner({ onUploadSuccess, onClose }) {
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
  }

  const handleScan = async () => {
    if (!file) return;
    setScanning(true)
    setError(null)

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await api.post('/automation/scan-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data.data);
      // We don't call onUploadSuccess yet, wait for user to "Confirm"
    } catch (err) {
      console.error('Scan Error:', err);
      setError("Failed to digitize receipt. AI might be overwhelmed or the file is too large.")
    } finally {
      setScanning(false)
    }
  }

  const handleConfirm = () => {
    if (onUploadSuccess) onUploadSuccess(result);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/20 rounded-lg">
                <Scan size={20} />
             </div>
             <div>
                <h3 className="font-bold uppercase tracking-tight">AI Vision Scanner</h3>
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest leading-none">Powered by GPT-4o-V</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {!result ? (
            <div className="space-y-6 text-center">
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 transition-all ${
                  file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 bg-slate-50'
                }`}
              >
                <input 
                  type="file" 
                  id="receipt-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center gap-3">
                   <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
                      <Upload size={32} />
                   </div>
                   <div>
                      <div className="font-bold text-slate-800">{file ? file.name : 'Pick a receipt image'}</div>
                      <p className="text-xs text-slate-400 mt-1 font-medium">PNG, JPG up to 5MB</p>
                   </div>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-xs font-black uppercase tracking-tight animate-pulse border border-red-100">
                   <AlertCircle size={18} /> {error}
                </div>
              )}

              <button 
                onClick={handleScan}
                disabled={!file || scanning}
                className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest ${
                  scanning ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20'
                }`}
              >
                {scanning ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <Scan size={20} />
                    Digitize Receipt
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-center">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                     <CheckCircle size={32} />
                  </div>
               </div>
               
               <div className="text-center">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Digitization Ready</h4>
                  <p className="text-slate-500 text-sm font-medium">Please verify the extracted ledger data.</p>
               </div>

               <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 shadow-inner">
                  <div className="flex justify-between items-center px-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</span>
                     <span className="font-bold text-slate-800">{result.vendor_name}</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                     <span className="font-black text-blue-600 text-xl tracking-tighter">${parseFloat(result.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Category</span>
                     <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                        {result.category}
                     </span>
                  </div>
               </div>

               <button 
                 onClick={handleConfirm}
                 className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-slate-900/10"
               >
                 Verify & Save to Ledger
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
