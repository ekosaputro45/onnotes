import { createPortal } from 'react-dom'

export function Modal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmTone = 'danger',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmTone?: 'danger' | 'primary'
  onConfirm: () => void | Promise<void>
  onClose: () => void
}) {
  if (!open) return null

  const confirmClass =
    confirmTone === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : 'bg-gray-900 hover:bg-gray-800 text-white'

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-soft border border-gray-200 overflow-hidden">
          <div className="p-5">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            ) : null}
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold ${confirmClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
