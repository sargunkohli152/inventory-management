"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString().toLowerCase();
        const products = yield prisma.products.findMany();
        if (search) {
            const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(search));
            res.json(filteredProducts);
        }
        else {
            res.json(products);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving products' });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, name, price, rating, stockQuantity } = req.body;
        const product = yield prisma.products.create({
            data: {
                productId,
                name,
                price,
                rating,
                stockQuantity,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating product' });
    }
});
exports.createProduct = createProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const product = yield prisma.products.findUnique({
            where: { productId: productId },
        });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        const deletedProduct = yield prisma.products.delete({
            where: { productId: productId },
        });
        res.status(200).json(deletedProduct);
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});
exports.deleteProduct = deleteProduct;
