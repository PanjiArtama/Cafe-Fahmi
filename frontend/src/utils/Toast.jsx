import Swal from "sweetalert2";

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  // Add these for custom styling
  background: '#ffffff',
  customClass: {
    popup: 'rounded-2xl border border-[#F5EFE6] shadow-lg',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});