const express = require('express');
const router = express.Router();
const Users = require('../models/users');
require('../util/date');
// 登陆接口
router.post('/login', (req, res, next) => {
    let userName = req.body.userName;
    let userPwd = req.body.userPwd;
    const params = {
        userName: userName,
        userPwd: userPwd
    };
    Users.findOne(params, (err, doc) => {
        if (err) {
            // console.log(111);
            res.json({
                status: 1,
                msg: err.message,
                result: 'err'
            });
        } else {
            if (doc) {
                res.cookie('userId', doc.userId, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                });
                res.cookie('userName', doc.userName, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                })
                // console.log('登陆成功');
                res.json({
                    status: 0,
                    msg: '登陆成功',
                    result: {
                        userName: doc.userName
                    }
                })
            } else {
                // console.log('登陆失败');
                res.json({
                    status: 1,
                    msg: '用户名或密码错误',
                    result: '用户名或密码错误'
                })
            }
        }
    })
});

//登出接口
router.post('/logout', (req, res, next) => {
    res.cookie('userId', '', {
        path: '/',
        maxAge: -1,
    });
    res.cookie('userName', '', {
        path: '/',
        maxAge: -1,
    });
    res.json({
        status: 0,
        msg: '登出成功',
        result: ''
    })
});

//校验用户信息
router.get('/checkLogin', (req, res, next) => {
    if (req.cookies.userId) {
        res.json({
            status: 0,
            msg: '',
            result: req.cookies.userName || ''
        })
    } else {
        res.json({
            status: 1,
            msg: '未登录',
            result: ''
        })
    }

});

//获取购物车商品数量
router.get('/getCartCount', (req, res, next) => {
    let userId = req.cookies.userId;
    Users.findOne({userId: userId}, (err, doc) => {
        if(err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else{
            let cartList = doc.cartList;
            let cartCount = 0;
            cartList.map((item) => {
                cartCount += item.productNum;
            });
            res.json({
                status: 0,
                msg: '查询购物车数量成功',
                result: cartCount
            })
        }
    })
});

//获取用户购物车列表
router.get('/cartList', (req, res, next) => {
    let userId = req.cookies.userId;
    Users.findOne({userId: userId}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                res.json({
                    status: 0,
                    msg: '',
                    result: doc.cartList
                })
            }
        }
    })
});

//删除购物车
router.post('/cart/del', (req, res, next) => {
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    Users.updateOne({userId: userId}, {$pull: {cartList: {productId: productId}}}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '删除成功',
                result: ''
            })
        }
    });
});

//编辑购物车
router.post('/cartEdit', (req, res, next) => {
    let userId = req.cookies.userId;
    let productId = req.body.productId;
    let productNum = req.body.productNum;
    let checked = req.body.checked;
    Users.updateOne({'userId': userId, 'cartList.productId': productId}, {
        'cartList.$.productNum': productNum,
        'cartList.$.checked': checked
    }, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            });
        } else {
            res.json({
                status: 0,
                msg: '编辑成功',
                result: doc
            });
        }
    });
});

//编辑购物车选择框
router.post('/editCheckAll', (req, res, next) => {
    let userId = req.cookies.userId;
    let checkAll = req.body.checkAll;
    Users.findOne({userId: userId}, (err, userDoc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: '找到用户'
            });
        } else {
            if (userDoc) {
                userDoc.cartList.forEach((item) => {
                    item.checked = checkAll;
                });
                userDoc.save((err2, doc) => {
                    if (err2) {
                        res.json({
                            status: 1,
                            msg: err2.message,
                            result: '保存失败'
                        });
                    } else {
                        res.json({
                            status: 0,
                            msg: '',
                            result: '保存成功'
                        });
                    }
                })
            }
        }
    })
});

//获取地址列表
router.post('/addressList', (req, res, next) => {
    let userId = req.cookies.userId;
    Users.findOne({userId: userId}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '获取成功',
                result: doc.addressList
            })
        }
    })
});

//修改默认地址
router.post('/setDefault', (req, res, next) => {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;
    if (!addressId) {
        res.json({
            status: 100,
            msg: '地址不存在',
            result: ''
        })
    } else {
        Users.findOne({userId: userId}, (err, doc) => {
            if (err) {
                res.json({
                    status: 1,
                    msg: err.message,
                    result: ''
                })
            } else {
                // let addressList = doc.addressList;    //addressId = 1 ,1的isDefault变成true,  从数组中删除1， 如何把1
                doc.addressList.forEach((item, index) => {
                    if (item.addressId === addressId) {
                        item.isDefault = true;
                        doc.addressList.splice(index, 1);   //删除当前项
                        doc.addressList.unshift(item);      //添加当前项到数组头部
                    } else {
                        item.isDefault = false;
                    }
                });

                doc.save((err1, doc1) => {
                    if (err) {
                        res.json({
                            status: 1,
                            msg: err1.message,
                            result: '保存失败'
                        })
                    } else {
                        res.json({
                            status: 0,
                            msg: '保存成功',
                            result: doc1.addressList
                        })
                    }
                });
            }
        })
    }
});

//删除地址
router.post('/delAddress', (req, res, next) => {
    let userId = req.cookies.userId;
    let addressId = req.body.addressId;
    console.log(addressId);
    Users.updateOne({userId: userId}, {$pull: {'addressList': {'addressId': addressId}}}, (err, doc) => {
        if (err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else {
            res.json({
                status: 0,
                msg: '删除成功',
                result: ''
            });
        }
    });
});
//生成订单
router.post('/payment', (req, res, next) => {
    let userId = req.cookies.userId;
    let orderTotal = req.body.orderTotal;
    let addressId = req.body.addressId;
    Users.findOne({userId: userId}, (err, doc) => {
        if(err) {
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            })
        } else{
            //获取当前用户下单地址,下单商品
            let address = '';
            let goodsList = [];
            doc.addressList.forEach((item) => {
                if(item.addressId === addressId){
                    address = item;
                }
            });
            doc.cartList.filter((item) => {
                if(item.checked === true){
                    goodsList.push(item);
                }
            });

            //创建订单
            let platForm = '888';
            let r1 = Math.floor(Math.random(0,1) * 10);
            let r2 = Math.floor(Math.random(0,1) * 10);
            let orderDate = new Date().Format('yyyyMMddhhmmss');
            let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
            let orderId = platForm + r1 + orderDate + r2;
            let order = {
                orderId: orderId,
                orderTotal: orderTotal,
                addressInfo: address,
                goodsList: goodsList,
                orderStatus: 1,
                createDate: createDate
            };
            //插入数据库
            doc.orderList.push(order);
            doc.save((err, doc) => {
                if(err){
                    res.json({
                        status: 1,
                        msg: err.message,
                        result: ''
                    })
                } else {
                    res.json({
                        status: 0,
                        msg: '创建订单成功',
                        result: {
                            orderId: order.orderId,
                            orderTotal: order.orderTotal
                        }
                    })
                }
            })
        }
    })
});

//获取订单详情
router.get('/orderDetail', (req, res, next) => {
    let userId = req.cookies.userId;
    var orderId = req.query.orderId;
    Users.findOne({userId: userId}, (err, doc) => {
        if(err){
            res.json({
                status: 1,
                msg: err.message,
                result: ''
            });
        } else {

            if(doc.orderList.length > 0){
                var orderTotal = 0;
                doc.orderList.forEach((item) => {
                    if(item.orderId === orderId){
                        orderTotal = item.orderTotal;
                    }
                });
                res.json({
                    status: 0,
                    msg: '查询订单成功',
                    result: {
                        orderId: orderId,
                        orderTotal: orderTotal
                    }
                })
            } else {
                res.json({
                    status: 10086,
                    msg: '没有查到订单',
                    result: ''
                })
            }
        }
    })
});
module.exports = router;
