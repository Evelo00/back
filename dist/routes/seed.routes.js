"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seed_1 = require("../seed/seed");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        await (0, seed_1.seedAll)();
        res.status(200).json({ message: "✅ Seed ejecutado correctamente!" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Error ejecutando seed", error });
    }
});
exports.default = router;
