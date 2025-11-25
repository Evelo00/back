import { Router } from "express";
import { seedAll } from "../seed/seed";

const router = Router();

router.post("/", async (req, res) => {
  try {
    await seedAll();
    res.status(200).json({ message: "✅ Seed ejecutado correctamente!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Error ejecutando seed", error });
  }
});

export default router;
