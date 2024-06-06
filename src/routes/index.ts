import { Router } from 'express';

const router = Router();

// General route
router.get('/', (req, res) => {
    res.json("Hello, world! 🌍");
});

export default router;