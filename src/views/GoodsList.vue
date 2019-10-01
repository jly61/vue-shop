<template>
    <div>
        <nav-header></nav-header>
        <nav-bread></nav-bread>
        <div class="accessory-result-page accessory-page">
            <div class="container">
                <div class="filter-nav">
                    <span class="sortby">Sort by:</span>
                    <a href="javascript:void(0)" class="default cur">Default</a>
                    <a href="javascript:void(0)" class="price" @click="sortGood">Price
                        <img src="../../static/arrow.svg" alt="" :class="{'arrow-down': !sortFlag}">
                    </a>
                    <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
                </div>
                <div class="accessory-result">
                    <!-- filter -->
                    <div class="filter stopPop" id="filter" :class="{'filterby-show': filterBy}">
                        <dl class="filter-price">
                            <dt>Price:</dt>
                            <dd><a href="javascript:void(0)" :class="{'cur':priceLevel === 'all'}"
                                   @click="priceLevel = 'all'">All</a></dd>
                            <dd v-for="(price,index) in priceFilter">
                                <a href="javascript:void(0)" :class="{'cur':priceLevel === index}"
                                   @click="setPriceFilter(index)">{{price.startPrice}} - {{price.endPrice}}</a>
                            </dd>
                        </dl>
                    </div>

                    <!-- search result accessories list -->
                    <div class="accessory-list-wrap">
                        <div class="accessory-list col-4">
                            <ul>
                                <li v-for="(item,index) in goodsList">
                                    <div class="pic">
                                        <a href="#"><img v-lazy="'/static/' + item.productImage"
                                                         :key="'/static/' + item.productImage" alt=""></a>
                                    </div>
                                    <div class="main">
                                        <div class="name">{{item.productName}}</div>
                                        <div class="price">{{item.salePrice}}</div>
                                        <div class="btn-area">
                                            <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy"
                                 infinite-scroll-distance="10" style="text-align: center">
                                <img src="../../static/loading/loading-spin.svg" v-show="loadFlag">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <modal :mdShow="mdShow" @close="closeModal">
            <p slot="message">
                请先登录，否则无法加入到购物车中!
            </p>
            <div slot="btnGroup">
                <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
            </div>
        </modal>
        <modal :mdShow="mdShowCart" @close="closeModal">
            <p slot="message">
                加入购物车成功!
            </p>
            <div slot="btnGroup">
                <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
                <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
            </div>
        </modal>
        <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
        <nav-footer></nav-footer>
    </div>
</template>

<script>
    import './../assets/css/base.css';
    import './../assets/css/product.css';
    import './../assets/css/login.css';
    import NavHeader from '../components/Header';
    import NavFooter from '../components/NavFooter';
    import NavBread from '../components/NavBread';
    import axios from 'axios';
    import Modal from '../components/Modal'


    export default {
        name: "GoodsList",
        data() {
            return {
                msg: 'hello vue',
                goodsList: [],
                priceLevel: 'all',
                filterBy: false,   //控制屏幕缩小是否显示价格过滤
                overLayFlag: false,   //控制遮罩层
                priceFilter: [
                    {
                        startPrice: 0.00,
                        endPrice: 100.00
                    },
                    {
                        startPrice: 100.00,
                        endPrice: 500.00
                    },
                    {
                        startPrice: 500.00,
                        endPrice: 1000.00
                    },
                    {
                        startPrice: 1000.00,
                        endPrice: 2000.00
                    }
                ],
                sortFlag: true,   //排序规则
                page: 1,           //页数
                pageSize: 8,        //每页显示商品数量
                busy: true,
                loadFlag: false,
                mdShow: false,   //控制加入购物车失败
                mdShowCart: false   //控制加入购物车成功
            }
        },
        components: {
            NavHeader: NavHeader,
            NavFooter,
            NavBread,
            Modal
        },
        mounted: function () {
            this.getGoodsList();
        },
        methods: {
            //查询商品
            getGoodsList(flag) {
                let param = {
                    'page': this.page,
                    'pageSize': this.pageSize,
                    'sort': this.sortFlag ? 1 : -1,
                    'priceLevel': this.priceLevel
                };
                this.loadFlag = true;
                axios.get('/goods/list', {params: param}).then((res) => {
                    this.loadFlag = false;
                    if (flag) {
                        this.goodsList = this.goodsList.concat(res.data.result.list);
                        if (res.data.result.count === 0) {
                            this.busy = true;
                        } else {
                            this.busy = false;
                        }
                    } else {
                        // console.log(res.data.result.list);
                        this.goodsList = res.data.result.list;
                        this.busy = false;
                    }
                }).catch((error) => {
                    console.log(error);
                })
            },
            //加入购物车
            addCart(productId) {
                axios.post('/goods/addCart', {productId: productId}).then((res) => {
                    if (res.data.status === 0) {
                        this.mdShowCart = true;
                        this.$store.commit('updateCartCount',1);
                    } else {
                        this.mdShow = true;
                    }
                })
            },
            //价格排序商品
            sortGood() {
                this.sortFlag = !this.sortFlag;
                this.page = 1;
                this.getGoodsList();
            },
            // 滚动分页
            loadMore() {
                this.busy = true;
                setTimeout(() => {
                    this.page++;
                    this.getGoodsList(true);
                }, 500);
            },
            //显示弹出层
            showFilterPop() {
                this.filterBy = true;
                this.overLayFlag = true;
            },
            setPriceFilter(index) {
                this.priceLevel = index;
                this.page = 1;
                this.getGoodsList();
                this.closePop();
            },
            // 隐藏弹出层
            closePop() {
                this.filterBy = false;
                this.overLayFlag = false;
            },
            closeModal(){
                this.mdShow = false;
            }
        }
    }
</script>
<style>

</style>
