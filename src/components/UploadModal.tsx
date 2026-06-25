import { useState } from "react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-100 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-base font-medium">Upload files</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Drop zone */}
          <div className="border-2 border-dashed border-blue-400 rounded-xl bg-blue-50 flex flex-col items-center justify-center py-9 gap-3 cursor-pointer hover:bg-blue-100 transition">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 .707.293l4 4a1 1 0 0 1-1.414 1.414L13 5.414V16a1 1 0 0 1-2 0V5.414L8.707 7.707A1 1 0 0 1 7.293 6.293l4-4A1 1 0 0 1 12 2zM4 17a1 1 0 0 1 1 1v1h14v-1a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/></svg>
            </div>
            <p className="text-sm font-medium text-blue-900">Drag &amp; drop files here</p>
            <p className="text-xs text-blue-700">or click to browse from your computer</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">Browse files</button>
          </div>

          {/* Supported formats */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">supported formats</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="flex flex-wrap gap-2">
            {["PDF", "DOCX", "JPG / PNG", "MP4", "MP3", "FIG", "ZIP"].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500">{f}</span>
            ))}
          </div>

          {/* File list */}
          <div className="flex flex-col gap-2">
            {[
              { name: "Proposal.docx", size: "2.9 MB", progress: 100, status: "Done", color: "bg-blue-500", statusColor: "text-green-600" },
              { name: "Background.jpg", size: "3.5 MB", progress: 62, status: "62%", color: "bg-amber-400", statusColor: "text-blue-500" },
              { name: "Meeting Recording.mp4", size: "120 MB", progress: 0, status: "Queued", color: "bg-gray-300", statusColor: "text-gray-400" },
            ].map((file) => (
              <div key={file.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${file.color}`} />
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <span className="text-xs text-gray-400">{file.size}</span>
                <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${file.progress}%` }} />
                </div>
                <span className={`text-xs font-medium w-10 text-right ${file.statusColor}`}>{file.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          <button className="px-5 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2a1 1 0 0 1 .707.293l4 4a1 1 0 0 1-1.414 1.414L13 5.414V16a1 1 0 0 1-2 0V5.414L8.707 7.707A1 1 0 0 1 7.293 6.293l4-4A1 1 0 0 1 12 2zM4 17a1 1 0 0 1 1 1v1h14v-1a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/></svg>
            Upload files
          </button>
        </div>

      </div>
    </div>
  )
}