const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Goods =require('../models/goods');

mongoose.connect('mongodb://127.0.0.1:27017/mall',{ useNewUrlParser: true });
mongoose.connection.on('connected', () => {
   console.log('MongoDB connected success');
});
mongoose.connection.on('error', () => {
    console.log('MongoDB connected failed');
});
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

//查询商品
router.get('/list',function(req, res, next){
    let page = parseInt(req.query.page);  //页码
    let pageSize = parseInt(req.query.pageSize);  //显示条数
    let skip = (page-1) * pageSize;  //开始条数
    let sort = req.query.sort;   //排序方式
    let priceLevel = req.query.priceLevel;  //价格区间
    let startPrice = '';
    let endPrice = '';
    let params = {};
    if (priceLevel !== 'all') {
        switch (priceLevel) {
            case '0': startPrice = 0; endPrice = 100; break;
            case '1': startPrice = 100; endPrice = 500; break;
            case '2': startPrice = 500; endPrice = 1000; break;
            case '3': startPrice = 1000; endPrice = 2000; break;
        }
        params = {
            salePrice: {
                $gt: startPrice,
                $lt: endPrice
            }
        };
    }

    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'salePrice': sort});
    goodsModel.exec((err, doc) => {
        if (err) {
            res.json({
                status: 0,
                msg: err.message()
            });
        } else {
             res.json({
                 status: 0,
                 msg: '',
                 result: {
                     count: doc.length,
                     list: doc
                 }
             })
        }
    });
});

//加入购物车
router.post('/addCart', (req, res, next) => {
    const Users = require('../models/users');
    let userId = '100000077';
    let productId = req.body.productId;
    Users.findOne({userId: userId}, (err, userDoc) => {   //查询用户
        if (err) {
            res.json({
                status: 1,
                msg: err.message
            });

        } else {
            if (userDoc) {
                let goodsItem = '';
                userDoc.cartList.forEach((item) => {
                    if (item.productId === productId) {
                        goodsItem = item;
                        item.productNum ++ ;
                        // console.log(item.productNum);
                    }
                });
                if (goodsItem) {
                    userDoc.save((err2, doc) => {
                        if (err2) {
                            res.json({
                                status: 1,
                                msg: err2.message
                            })
                        } else {
                            res.json({
                                status: 0,
                                msg: '',
                                result: 'success'
                            })
                        }
                    })
                } else{
                    Goods.findOne({productId:productId}, (err1, proDoc) => {    //查询商品
                        if (err1) {
                            res.json({
                                status: 1,
                                msg: err1.message
                            });
                            // console.log('查询商品失败');
                        } else {
                            // console.log('查询商品成功');
                            if (proDoc) {          //插入数组,存入数据库
                                proDoc.productNum = 1;
                                proDoc.checked = true;
                                userDoc.cartList.push(proDoc);
                                console.log(proDoc);
                                userDoc.save((err2, doc) => {
                                    if (err2) {
                                        res.json({
                                            status: 1,
                                            msg: err2.message
                                        })
                                    } else {
                                        res.json({
                                            status: 0,
                                            msg: '',
                                            result: 'success'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    })
});



module.exports = router;