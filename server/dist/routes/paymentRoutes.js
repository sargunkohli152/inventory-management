"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), (req, res, next) => {
    (0, paymentController_1.handleWebhook)(req, res).catch(next);
});
exports.default = router;
