import express from 'express';
import { check, validationResult } from 'express-validator';

const router = express.Router();

router.post(
  '/add',
  [
    check('name').isLength({ min: 1 }),
    check('established').isDate(),
    check('averageTemp').isFloat(),
  ],
  (req, res) => {},
);

router.get('/', async (req, res) => {});

export default router;
