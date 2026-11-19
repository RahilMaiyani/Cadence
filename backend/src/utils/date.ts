export const getYesterday = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split('T')[0];
};

export const getDaysDiff = (date1: string, date2: string): number => {
    const [y1, m1, d1] = date1.split('-').map(Number);
    const [y2, m2, d2] = date2.split('-').map(Number);
    const utc1 = Date.UTC(y1, m1 - 1, d1);
    const utc2 = Date.UTC(y2, m2 - 1, d2);
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.round(Math.abs((utc2 - utc1) / MS_PER_DAY));
};

export const getDaysAgo = (days: number, fromDateStr?: string): string => {
    const base = fromDateStr ? new Date(fromDateStr) : new Date();
    const date = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().split('T')[0];
};