import Papa from 'papaparse';

export interface CsvRow {
    [key: string]: string;
}

export const parseCsv = (content: string): CsvRow[] => {
    const result = Papa.parse<CsvRow>(content, {
        header: true,
        skipEmptyLines: true
    });

    if (result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }

    return result.data;
};

export const getRowValue = (row: Record<string, unknown>, ...keys: string[]): string => {
    for (const key of keys) {
        const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key);
        if (foundKey) return String(row[foundKey] || '').trim();
    }
    return '';
};

export const parseType = (typeStr: string): 'in' | 'out' => {
    const normalized = typeStr.toLowerCase().trim();
    if (['in', 'entrada', 'receita', 'credito', 'income'].includes(normalized)) return 'in';
    return 'out';
};

export const parseValue = (valueStr: string): number => {
    let cleaned = valueStr.replace(/[R$\s]/g, '');
    cleaned = cleaned.replace(/\./g, '');
    cleaned = cleaned.replace(',', '.');
    return parseFloat(cleaned) || 0;
};

export const toCsv = (data: Record<string, unknown>[]): string => {
    return Papa.unparse(data);
};

export const generateTemplate = (): string => {
    const headers = ['data', 'tipo', 'valor', 'categoria', 'descricao'];
    const examples = [['04/03/2026', 'entrada', '1500.00', 'Salário', 'Recebimento mensal']];
    return Papa.unparse({ fields: headers, data: examples });
};
