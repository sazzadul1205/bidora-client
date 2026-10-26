import Swal from 'sweetalert2'

// Reusable toast notifications (top-right, non-blocking)
export const toast = {
  success: (message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
  },
  error: (message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
  },
  warning: (message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: message,
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
  },
  info: (message) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })
  },
  // Modal confirmation dialog. Returns true when confirmed.
  confirm: async (title, text = '', confirmText = 'Yes', cancelText = 'Cancel') => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: confirmText,
      denyButtonText: cancelText,
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg',
        denyButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg',
      },
      buttonsStyling: false,
    })
    return result.isConfirmed
  },
}

// Modal-style confirmation dialog
export const confirmDialog = async (title, text, confirmText = 'Yes', cancelText = 'Cancel') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showConfirmButton: true,
    showCloseButton: true,
    showDenyButton: true,
    confirmButtonText: confirmText,
    denyButtonText: cancelText,
    customClass: {
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg',
      denyButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg',
    },
    buttonsStyling: false,
  })
  return result.isConfirmed
}

// Quick yes/no confirmation with a sensible default.
// Usage: if (await toast.confirm('Delete?', 'This cannot be undone.')) { ... }
export const confirm = async (title, text = '', confirmText = 'Yes', cancelText = 'Cancel') => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showConfirmButton: true,
    showDenyButton: true,
    confirmButtonText: confirmText,
    denyButtonText: cancelText,
    customClass: {
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg',
      denyButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg',
    },
    buttonsStyling: false,
  })
  return result.isConfirmed
}

// Modal alert (blocking)
export const modalAlert = async (title, text, icon = 'info') => {
  await Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: '#3b82f6',
    customClass: {
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg',
    },
    buttonsStyling: false,
  })
}

export default { toast, confirmDialog, modalAlert }