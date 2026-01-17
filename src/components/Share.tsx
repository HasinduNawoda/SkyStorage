type Props = {
  open: boolean
  onClose: () => void
}

export default function ShareModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-96 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Share</h2>

        <button className="w-full mb-2 rounded bg-gray-100 p-2">
          Copy link
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded bg-red-500 text-white p-2"
        >
          Close
        </button>
      </div>
    </div>
  )
}
