import Swal from 'sweetalert2';

export const NotificationManager = {
    success: (message: string): void => {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            background: '#fff',
            color: '#333'
        });
    },
    error: (message: string): void => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            background: '#fff',
            color: '#d33'
        });
    },
    info: (message: string, timer: number = 3000): void => {
        Swal.fire({
            icon: 'info',
            title: 'Info',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer
        });
    },
    warning: (message: string): void => {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
};
