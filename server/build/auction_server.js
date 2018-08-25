"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'client')));
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, '第一个商品', 1.99, 3.5, '这是第一个商品，一个不错的商品', ['电子产品', '硬件设备']),
    new Product(2, '第二个商品', 3.99, 1.5, '这是第二个商品，一个不错的商品', ['电子产品', '硬件设备']),
    new Product(3, '第三个商品', 6.99, 2.5, '这是第三个商品，一个不错的商品', ['图书']),
    new Product(4, '第四个商品', 5.99, 3.5, '这是第四个商品，一个不错的商品', ['电子产品', '硬件设备']),
    new Product(5, '第五个商品', 3.99, 2.5, '这是第五个商品，一个不错的商品', ['电子产品', '硬件设备']),
    new Product(6, '第六个商品', 1.99, 3.5, '这是第六个商品，一个不错的商品', ['电子产品', '硬件设备']),
];
var comments = [
    new Comment(1, 1, '2017-09-26 22:22:22', '张三', 5, '东西不错'),
    new Comment(2, 1, '2017-03-26 22:22:22', '李四', 3, '东西是不错'),
    new Comment(3, 1, '2017-04-26 22:22:22', '王五', 4, '东西很不错'),
    new Comment(4, 2, '2017-05-26 22:22:22', '赵六', 2, '东西非常不错'),
];
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(params.price); });
    }
    if (params.category && params.category !== "-1" && result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; });
    }
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, 'localhost', function () {
    console.log("服务器已经启动");
});
var subscriptions = new Map();
var wsServer = new ws_1.Server({ port: 3085 });
wsServer.on("connection", function (websocket) {
    websocket.on('message', function (message) {
        var messageObj = JSON.parse(message);
        var productIds = subscriptions.get(websocket) || [];
        subscriptions.set(websocket, productIds.concat([messageObj.productId]));
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid + Math.random() * 5;
        if (newBid > 1000) {
            newBid = 10;
        }
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}, 2000);
