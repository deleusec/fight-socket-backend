import { Router } from 'express';

const router = Router();

// General route
router.get('/', (req: any, res :any) => {
    res.json("Hello, world! 🌍");
});

export default router;