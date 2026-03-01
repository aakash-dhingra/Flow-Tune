"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cleaner_1 = require("../controllers/cleaner");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/analyze', auth_1.requireAuth, cleaner_1.analyzeLikedTracks);
exports.default = router;
