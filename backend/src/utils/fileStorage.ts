import fs from 'fs';
import path from 'path';

export const saveFile = (content: string, userId: string): string => {
    const fileName = `import-${Date.now()}-${Math.random().toString(36).substring(2, 11)}.csv`;
    const uploadsDir = path.resolve('uploads');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, content, 'utf-8');

    return filePath;
};

export const readFile = (filePath: string): string => {
    return fs.readFileSync(filePath, 'utf-8');
};

export const deleteFile = (filePath: string): void => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
