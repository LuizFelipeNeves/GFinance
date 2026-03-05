import Papa from 'papaparse';

export interface CsvRow {
  data: string;
  tipo: 'in' | 'out';
  valor: number;
  categoria: string;
  descricao: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  errors: string[];
  rows: CsvRow[];
}

const ALLOWED_EXTENSION = '.csv';
const REQUIRED_COLUMNS = ['data', 'tipo', 'valor', 'categoria', 'descricao'];

const parsePapaError = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('quote') || lowerMessage.includes('"')) {
    return 'Aspas mal posicionadas. Verifique se todas as aspas estão pareadas.';
  }
  if (lowerMessage.includes('field') || lowerMessage.includes('column')) {
    return 'Erro na estrutura do arquivo. Verifique se o CSV está formatado corretamente.';
  }
  if (lowerMessage.includes('empty') || lowerMessage.includes('blank')) {
    return 'Arquivo vazio ou com linhas em branco.';
  }
  if (lowerMessage.includes('delimiter') || lowerMessage.includes(',')) {
    return 'Erro no separador. Use vírgula (,) para separar as colunas.';
  }

  return 'Erro ao ler o arquivo. Verifique se o formato está correto.';
};

const parseDate = (dateStr: string): string | null => {
  const formats = [
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: 'YYYY-MM-DD' },
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, format: 'DD/MM/YYYY' },
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: 'DD-MM-YYYY' },
  ];

  for (const { regex, format } of formats) {
    const match = dateStr.match(regex);
    if (match) {
      let day: number, month: number, year: string;

      if (format === 'YYYY-MM-DD') {
        year = match[1];
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      } else {
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = match[3];
      }

      // Validate date
      if (month < 1 || month > 12) return null;
      if (day < 1 || day > 31) return null;
      if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) return null;
      if (month === 2) {
        const isLeapYear = (parseInt(year) % 4 === 0 && parseInt(year) % 100 !== 0) || (parseInt(year) % 400 === 0);
        if (day > (isLeapYear ? 29 : 28)) return null;
      }

      // Return in DD/MM/YYYY format
      const dayStr = day.toString().padStart(2, '0');
      const monthStr = month.toString().padStart(2, '0');
      return `${dayStr}/${monthStr}/${year}`;
    }
  }
  return null;
};

const parseValue = (valueStr: string): number | null => {
  const cleaned = valueStr.replace(/[R$\s.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const parseType = (typeStr: string): 'in' | 'out' | null => {
  const normalized = typeStr.toLowerCase().trim();
  if (['in', 'entrada', 'receita', 'credito', 'income'].includes(normalized)) return 'in';
  if (['out', 'saida', 'despesa', 'debito', 'expense'].includes(normalized)) return 'out';
  return null;
};

export const validateFileExtension = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return ext === ALLOWED_EXTENSION
};

export const validateCsvStructure = (file: File): Promise<CsvValidationResult> => {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const rows: CsvRow[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          const firstError = results.errors[0];
          errors.push(parsePapaError(firstError.message));
          resolve({ isValid: false, errors, rows: [] });
          return;
        }

        const data = results.data as Record<string, string>[];

        if (data.length === 0) {
          errors.push('Arquivo vazio ou sem dados');
          resolve({ isValid: false, errors, rows: [] });
          return;
        }

        const headers = Object.keys(data[0]).map(h => h.toLowerCase().trim());
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          errors.push(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`);
          resolve({ isValid: false, errors, rows: [] });
          return;
        }

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowErrors: string[] = [];
          const values = REQUIRED_COLUMNS.map(col => {
            const headerKey = Object.keys(row).find(k => k.toLowerCase().trim() === col);
            return headerKey ? row[headerKey]?.trim() : '';
          });

          const [dataStr, tipoStr, valorStr, categoria, descricao] = values;

          const parsedDate = parseDate(dataStr);
          if (!parsedDate) rowErrors.push(`data inválida: "${dataStr}" (use: DD/MM/YYYY)`);

          const parsedType = parseType(tipoStr);
          if (!parsedType) rowErrors.push(`tipo inválido: "${tipoStr}"`);

          const parsedValue = parseValue(valorStr);
          if (parsedValue === null) rowErrors.push(`valor inválido: "${valorStr}"`);

          if (!categoria) rowErrors.push('categoria obrigatória');
          if (!descricao) rowErrors.push('descrição obrigatória');

          if (rowErrors.length > 0) {
            errors.push(`Linha ${i + 2}: ${rowErrors.join(', ')}`);
          } else {
            rows.push({
              data: parsedDate!,
              tipo: parsedType!,
              valor: parsedValue!,
              categoria,
              descricao
            });
          }
        }

        if (rows.length === 0 && errors.length === 0) {
          errors.push('Nenhuma linha válida encontrada');
        }

        resolve({
          isValid: errors.length === 0,
          errors,
          rows
        });
      },
      error: (error) => {
        errors.push(`Erro ao ler arquivo: ${error.message}`);
        resolve({ isValid: false, errors, rows: [] });
      }
    });
  });
};
