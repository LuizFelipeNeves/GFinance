import { parse } from 'fast-csv';

export interface CsvRow {
    [key: string]: string;
}

export const parseCsv = async (content: string): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
        const rows: CsvRow[] = [];

        const stream = parse();
        stream.on('data', (row) => rows.push(row));
        stream.on('end', () => resolve(rows));
        stream.on('error', reject);
        stream.write(content);
        stream.end();
    });
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
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        csvRows.push(headers.map(h => `"${row[h] || ''}"`).join(','));
    }
    return csvRows.join('\n');
};

export const generateTemplate = (): string => {
    const headers = ['data', 'tipo', 'valor', 'categoria', 'descricao'];
    const examples = [['04/03/2026', 'entrada', '1500.00', 'Salário', 'Recebimento mensal']];

    const csvRows = [headers.join(',')];
    for (const row of examples) {
        csvRows.push(row.map(cell => `"${cell}"`).join(','));
    }

    return csvRows.join('\n');
};
