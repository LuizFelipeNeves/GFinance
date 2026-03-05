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
import { transactionSchema, transactionUpdateSchema } from '../validation';

const router = Router();

router.get('/', getTransactions);
router.post('/', validate(transactionSchema), createTransaction);
router.put('/:id', validate(transactionUpdateSchema), updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/import-file', uploadMiddleware.single('file'), importFile);
router.get('/import/stream', getImportStream);
router.get('/export', exportTransactions);
router.get('/import/template', getTemplate);

export default router;
