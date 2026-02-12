import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock sweetalert2 before importing NotificationManager
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    }
}));

import { NotificationManager } from '../core/NotificationManager';
import Swal from 'sweetalert2';

describe('NotificationManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fire success toast', () => {
        NotificationManager.success('Saved!');
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: 'success',
                text: 'Saved!',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
            })
        );
    });

    it('should fire error toast', () => {
        NotificationManager.error('Something broke');
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: 'error',
                text: 'Something broke',
                toast: true,
            })
        );
    });

    it('should fire info toast with default timer', () => {
        NotificationManager.info('Processing...');
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: 'info',
                text: 'Processing...',
                timer: 3000,
            })
        );
    });

    it('should fire info toast with custom timer', () => {
        NotificationManager.info('Long task...', 5000);
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: 'info',
                text: 'Long task...',
                timer: 5000,
            })
        );
    });

    it('should fire warning toast', () => {
        NotificationManager.warning('Be careful');
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: 'warning',
                text: 'Be careful',
                toast: true,
            })
        );
    });
});
