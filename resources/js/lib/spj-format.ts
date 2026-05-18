export function formatRupiah(value: string | number) {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(amount)) {
        return '-';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function calcTotalHarga(jumlahOrder: string | number, hargaUnit: string | number) {
    const qty = typeof jumlahOrder === 'string' ? parseFloat(jumlahOrder) : jumlahOrder;
    const harga = typeof hargaUnit === 'string' ? parseFloat(hargaUnit) : hargaUnit;
    if (Number.isNaN(qty) || Number.isNaN(harga)) {
        return 0;
    }
    return qty * harga;
}
