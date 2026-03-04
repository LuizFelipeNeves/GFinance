export const FormatCurrency = (value: number) => {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const FormatCurrencySigned = (value: number) => {
    const formatted = FormatCurrency(Math.abs(value));
    return value >= 0 ? `+ ${formatted}` : `- ${formatted}`;
}