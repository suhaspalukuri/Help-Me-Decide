export const DURATION_OPTIONS = [
    { label: '1 Hour', value: 3600 },
    { label: '24 Hours', value: 86400 },
    { label: '3 Days', value: 259200 },
    { label: '7 Days', value: 604800 },
    { label: 'No time limit', value: -1 },
];

export const formatTimeLeft = (expiresAt: number): string => {
    if (expiresAt === -1) {
        return 'No time limit';
    }

    const now = new Date().getTime();
    const distance = expiresAt - now;

    if (distance < 0) {
        return 'Closed';
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
};
