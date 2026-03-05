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
import { validate, uploadMiddleware } from '../middleware';
import { transactionSchema, transactionUpdateSchema, exportSchema, importStreamSchema } from '../validation';

const router = Router();

router.get('/', getTransactions);
router.post('/', validate(transactionSchema), createTransaction);
router.put('/:id', validate(transactionUpdateSchema), updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/import-file', uploadMiddleware.single('file'), importFile);
router.get('/import/stream', validate(importStreamSchema, 'query'), getImportStream);
router.get('/export', validate(exportSchema), exportTransactions);
router.get('/import/template', getTemplate);

export default router;
