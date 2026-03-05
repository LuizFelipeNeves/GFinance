import { Router } from 'express';
import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importFile,
    getImportStream,
    exportTransactions,
    getTemplate
} from '../controllers/transactionController';
import { validate, uploadMiddleware, authMiddleware } from '../middleware';
import { transactionSchema, transactionUpdateSchema, exportSchema, importStreamSchema } from '../validation';

const router = Router();

router.get('/', authMiddleware, getTransactions);
router.post('/', authMiddleware, validate(transactionSchema), createTransaction);
router.put('/:id', authMiddleware, validate(transactionUpdateSchema), updateTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.post('/import-file', authMiddleware, uploadMiddleware.single('file'), importFile);
router.get('/import/stream', authMiddleware, validate(importStreamSchema, 'query'), getImportStream);
router.get('/export', authMiddleware, validate(exportSchema), exportTransactions);
router.get('/import/template', authMiddleware, getTemplate);

export default router;
