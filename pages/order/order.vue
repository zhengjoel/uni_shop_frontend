<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item" :class="{current: tabCurrentIndex === index}"
			 @click="tabClick(index)">
				{{item.text}}
			</view>
		</view>

		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem,tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData">
					<!-- 空白页 -->
					<empty v-if="tabItem.loaded === true && tabItem.orderList.length === 0"></empty>

					<!-- 订单列表 -->
					<view v-for="(item,index) in tabItem.orderList" :key="index" class="order-item" @click="navTo('/pages/order/orderDetail?order_id='+item.order_id)">
						<view class="i-top b-b">
							<text class="time">{{item.createtime}}</text>
							<text class="state" :style="{color: item.stateTipColor}">{{item.stateTip}}</text>
							<text v-if="item.state===9" class="del-btn yticon icon-lajitong" @click.stop="deleteOrder(index)"></text>
						</view>

						<scroll-view v-if="item.products.length > 1" class="goods-box" scroll-x>
							<view v-for="(goodsItem, goodsIndex) in item.products" :key="goodsIndex" class="goods-item">
								<image class="goods-img" :src="cdn + goodsItem.image" mode="aspectFill"></image>
							</view>
						</scroll-view>
						<view v-if="item.products.length === 1" class="goods-box-single" v-for="(goodsItem, goodsIndex) in item.products"
						 :key="goodsIndex">
							<image class="goods-img" :src="cdn + goodsItem.image" mode="aspectFill"></image>
							<view class="right">
								<text class="title clamp">{{goodsItem.title}}</text>
								<text class="attr-box">{{goodsItem.spec}} x {{goodsItem.number}}</text>
								<text class="price">{{goodsItem.price}}</text>
							</view>
						</view>

						<view class="price-box">
							共
							<text class="num">{{quantity(item.products)}}</text>
							件商品 合计
							<text class="price">{{item.total_price}}</text>

							<text v-if="item.discount_price > 0">(已优惠￥{{item.discount_price}})</text>
							<text v-if="item.delivery_price > 0">(含运费￥{{item.delivery_price}})</text>
						</view>
						<view class="action-box b-t" v-if="item.state != 9">
							<button class="action-btn" v-if="item.state == 1" @click.stop="button('cancel',item)">取消订单</button>
							<button class="action-btn recom" v-if="item.have_paid == 0" @click.stop="button('pay',item)">立即支付</button>
							<!-- <button class="action-btn" v-if="item.have_paid != 0 && item.have_delivered == 0">提醒发货</button> -->
							<button class="action-btn" v-if="item.have_paid != 0" @click.stop="button('delivery',item)">查看物流</button>
							<button class="action-btn" v-if="item.have_paid != 0 && item.have_received == 0" @click.stop="button('recerved',item)">确认收货</button>
							<button class="action-btn" v-if="item.have_received != 0 && item.have_commented == 0" @click.stop="button('evaluate',item)">评价</button>
							<!-- <button class="action-btn" v-if="item.have_received != 0 && item.have_commented != 0">追加评价</button> -->
							<button class="action-btn" v-if="item.have_paid != 0">申请售后</button>
						</view>
					</view>
					<uni-load-more :status="tabItem.loadingType"></uni-load-more>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import empty from "@/components/empty";
	import {
		mapState
	} from 'vuex';

	export default {
		components: {
			uniLoadMore,
			empty
		},
		computed: {
			...mapState(['cdn'])
		},
		data() {
			return {
				tabCurrentIndex: 0,
				navList: [{
						state: 0,
						text: '全部',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 1,
						text: '待付款',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 2,
						text: '待发货',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 3,
						text: '待收货',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 4,
						text: '评价',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 5,
						text: '售后',
						loadingType: 'more',
						orderList: [],
						page: 1
					}
				],
				pageSize: 10
			};
		},
		onLoad(options) {
			/**
			 * 修复app端点击除全部订单外的按钮进入时不加载数据的问题
			 * 替换onLoad下代码即可
			 */
			this.tabCurrentIndex = +options.state;
			// #ifndef MP
			this.loadData()
			// #endif
			// #ifdef MP
			if (options.state == 0) {
				this.loadData()
			}
			// #endif
		},
		onPullDownRefresh() {
			this.pullDownRefresh()
		},
		methods: {
			//获取订单列表
			async loadData(source) {
				//这里是将订单挂载到tab列表下
				let index = this.tabCurrentIndex;
				let navItem = this.navList[index];
				let state = navItem.state;

				if (source === 'tabChange' && navItem.loaded === true) {
					//tab切换只有第一次需要加载数据
					return;
				}
				if (navItem.loadingType === 'loading') {
					//防止重复加载
					return;
				}
				if (navItem.loadingType == 'noMore') {
					//没有更多数据
					return;
				}

				navItem.loadingType = 'loading';

				let result = await this.$api.request('/order/getOrders', 'GET', {
					type: state,
					page: navItem.page,
					pagesize: this.pageSize
				});
				uni.stopPullDownRefresh();
				if (!result) {
					navItem.loadingType = 'more';
				} else {
					//console.log(result)
					if (result.length >= this.pageSize) {
						//判断是否还有数据， 有改为 more， 没有改为noMore
						navItem.loadingType = 'more';
					} else {
						navItem.loadingType = 'noMore';
					}
					// 页数加一
					navItem.page++;
					result.forEach(item => {
						item = Object.assign(item, this.orderStateExp(item.state));
						navItem.orderList.push(item);
					});
					//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
					this.$set(navItem, 'loaded', true);
				}

			},

			//swiper 切换
			changeTab(e) {
				this.tabCurrentIndex = e.target.current;
				this.loadData('tabChange');
			},
			//顶部tab点击
			tabClick(index) {
				this.tabCurrentIndex = index;
			},
			//删除订单
			async deleteOrder(index) {
				let [error, res] = await uni.showModal({
					title: '确认删除订单'
				});
				if (res.confirm) { 
					let order_id = this.navList[this.tabCurrentIndex].orderList[index].order_id;
					let result = await this.$api.request('/order/delete?order_id=' + order_id)
					if (result) {
						this.navList[this.tabCurrentIndex].orderList.splice(index, 1);
					}
				}
				
			},
			//取消订单
			async cancelOrder(item) {
				let that = this;
				let [error, res] = await uni.showModal({
					title: '确认取消订单',
					content: '取消之后不可恢复',
				});
				if (res.confirm) {
					let result = await that.$api.request('/order/cancel?order_id=' + item.order_id);
					if (result) {
						let {
							stateTip,
							stateTipColor
						} = that.orderStateExp(9);
						item = Object.assign(item, {
							state: 9,
							stateTip,
							stateTipColor
						});
						// 更新全部订单里面的状态
						let position = that.navList[0].orderList.findIndex(val => val.order_id === item.order_id);
						if (position !== -1) {
							that.navList[0].orderList[position] = item;
						}

						//取消订单后删除待付款中该项
						let list = that.navList[1].orderList;
						let index = list.findIndex(val => val.order_id === item.order_id);
						index !== -1 && list.splice(index, 1);
					}
					return true;
				}
				this.$api.msg('取消失败');
				return false;
			},
			// 收货
			async receivedOrder(item) {
				let that = this;
				let [error, res] = await uni.showModal({
					title: '确认收货'
				});
				if (res.confirm == true) {
					let res = await that.$api.request('/order/received', 'GET', {
						order_id: item.order_id
					});
					if (res) {
						// 已确认收货
				
						let {
							stateTip,
							stateTipColor
						} = that.orderStateExp(4);
						
						// 更新全部订单里面的状态
						let position = that.navList[0].orderList.findIndex(val => val.order_id === item.order_id);
						if (position !== -1) {
							let item = that.navList[0].orderList[position];
							that.navList[0].orderList[position] = Object.assign(item, {
								state: 4,
								stateTip,
								stateTipColor
							});
						}
				
						//收货订单后删除待收货中该项
						let list = that.navList[3].orderList;
						let index = list.findIndex(val => val.order_id === item.order_id);
						index !== -1 && list.splice(index, 1);
					}
					return true;
				}
				this.$api.msg('收货失败');
				return false;
			},
			// 订单状态文字和颜色
			orderStateExp(state) {
				let stateTip = '',
					stateTipColor = '#fa436a';
				switch (+state) {
					case 0:
						stateTip = '交易成功';
						break;
					case 1:
						stateTip = '待付款';
						break;
					case 2:
						stateTip = '待发货';
						break;
					case 3:
						stateTip = '待收货';
						break;
					case 4:
						stateTip = '待评价';
						break;
					case 5:
						stateTip = '售后';
						break;
					case 9:
						stateTip = '订单已关闭';
						stateTipColor = '#909399';
						break;

						//更多自定义
				}
				return {
					stateTip,
					stateTipColor
				};
			},
			// 计算当前订单有多少个商品
			quantity(products) {
				let number = 0;
				for (let i in products) {
					number += parseInt(products[i].number);
				}
				return number;
			},
			navTo(url) {
				this.$api.navTo(url);
			},
			// 下面的一排按钮
			button(action, item) {
				switch (action) {
					case 'cancel':
						this.cancelOrder(item);
						break;
					case 'pay':
						this.navTo('/pages/money/pay?order_id=' + item.order_id + '&total=' + item.total_price);
						break;
					case 'delivery':
						this.navTo('/pages/public/webview?type=kd&number=' + item.extend.express_number);
						break;
					case 'recerved':
						this.receivedOrder(item);
						break;
					case 'evaluate':
						this.$api.navTo('/pages/order/evaluate?product_id=' + item.products[0].id + '&order_id=' + item.order_id +
							'&image=' + item.products[0].image + '&title=' + item.products[0].title + '&spec=' + item.products[0].spec);
						break;
				}
			},
			pullDownRefresh() {
				this.navList = [];
				this.navList = [{
						state: 0,
						text: '全部',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 1,
						text: '待付款',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 2,
						text: '待发货',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 3,
						text: '待收货',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 4,
						text: '评价',
						loadingType: 'more',
						orderList: [],
						page: 1
					},
					{
						state: 5,
						text: '售后',
						loadingType: 'more',
						orderList: [],
						page: 1
					}
				];
				this.loadData();
			}
		},
	}
</script>

<style lang="scss">
	page,
	.content {
		background: $page-color-base;
		height: 100%;
	}

	.swiper-box {
		height: calc(100% - 40px);
	}

	.list-scroll-content {
		height: 100%;
	}

	.navbar {
		display: flex;
		height: 40px;
		padding: 0 5px;
		background: #fff;
		box-shadow: 0 1px 5px rgba(0, 0, 0, .06);
		position: relative;
		z-index: 10;

		.nav-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 15px;
			color: $font-color-dark;
			position: relative;

			&.current {
				color: $base-color;

				&:after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 44px;
					height: 0;
					border-bottom: 2px solid $base-color;
				}
			}
		}
	}

	.uni-swiper-item {
		height: auto;
	}

	.order-item {
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-top: 16upx;

		.i-top {
			display: flex;
			align-items: center;
			height: 80upx;
			padding-right: 30upx;
			font-size: $font-base;
			color: $font-color-dark;
			position: relative;

			.time {
				flex: 1;
			}

			.state {
				color: $base-color;
			}

			.del-btn {
				padding: 10upx 0 10upx 36upx;
				font-size: $font-lg;
				color: $font-color-light;
				position: relative;

				&:after {
					content: '';
					width: 0;
					height: 30upx;
					border-left: 1px solid $border-color-dark;
					position: absolute;
					left: 20upx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
		}

		/* 多条商品 */
		.goods-box {
			height: 160upx;
			padding: 20upx 0;
			white-space: nowrap;

			.goods-item {
				width: 120upx;
				height: 120upx;
				display: inline-block;
				margin-right: 24upx;
			}

			.goods-img {
				display: block;
				width: 100%;
				height: 100%;
			}
		}

		/* 单条商品 */
		.goods-box-single {
			display: flex;
			padding: 20upx 0;

			.goods-img {
				display: block;
				width: 120upx;
				height: 120upx;
			}

			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 0 30upx 0 24upx;
				overflow: hidden;

				.title {
					font-size: $font-base + 2upx;
					color: $font-color-dark;
					line-height: 1;
				}

				.attr-box {
					font-size: $font-sm + 2upx;
					color: $font-color-light;
					padding: 10upx 12upx;
				}

				.price {
					font-size: $font-base + 2upx;
					color: $font-color-dark;

					&:before {
						content: '￥';
						font-size: $font-sm;
						margin: 0 2upx 0 8upx;
					}
				}
			}
		}

		.price-box {
			display: flex;
			justify-content: flex-end;
			align-items: baseline;
			padding: 20upx 30upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;

			.num {
				margin: 0 8upx;
				color: $font-color-dark;
			}

			.price {
				font-size: $font-lg;
				color: $font-color-dark;

				&:before {
					content: '￥';
					font-size: $font-sm;
					margin: 0 2upx 0 8upx;
				}
			}
		}

		.action-box {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			height: 100upx;
			position: relative;
			padding-right: 30upx;
		}

		.action-btn {
			width: 160upx;
			height: 60upx;
			margin: 0;
			margin-left: 24upx;
			padding: 0;
			text-align: center;
			line-height: 60upx;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			background: #fff;
			border-radius: 100px;

			&:after {
				border-radius: 100px;
			}

			&.recom {
				background: #fff9f9;
				color: $base-color;

				&:after {
					border-color: #f7bcc8;
				}
			}
		}
	}


	/* load-more */
	.uni-load-more {
		display: flex;
		flex-direction: row;
		height: 80upx;
		align-items: center;
		justify-content: center
	}

	.uni-load-more__text {
		font-size: 28upx;
		color: #999
	}

	.uni-load-more__img {
		height: 24px;
		width: 24px;
		margin-right: 10px
	}

	.uni-load-more__img>view {
		position: absolute
	}

	.uni-load-more__img>view view {
		width: 6px;
		height: 2px;
		border-top-left-radius: 1px;
		border-bottom-left-radius: 1px;
		background: #999;
		position: absolute;
		opacity: .2;
		transform-origin: 50%;
		animation: load 1.56s ease infinite
	}

	.uni-load-more__img>view view:nth-child(1) {
		transform: rotate(90deg);
		top: 2px;
		left: 9px
	}

	.uni-load-more__img>view view:nth-child(2) {
		transform: rotate(180deg);
		top: 11px;
		right: 0
	}

	.uni-load-more__img>view view:nth-child(3) {
		transform: rotate(270deg);
		bottom: 2px;
		left: 9px
	}

	.uni-load-more__img>view view:nth-child(4) {
		top: 11px;
		left: 0
	}

	.load1,
	.load2,
	.load3 {
		height: 24px;
		width: 24px
	}

	.load2 {
		transform: rotate(30deg)
	}

	.load3 {
		transform: rotate(60deg)
	}

	.load1 view:nth-child(1) {
		animation-delay: 0s
	}

	.load2 view:nth-child(1) {
		animation-delay: .13s
	}

	.load3 view:nth-child(1) {
		animation-delay: .26s
	}

	.load1 view:nth-child(2) {
		animation-delay: .39s
	}

	.load2 view:nth-child(2) {
		animation-delay: .52s
	}

	.load3 view:nth-child(2) {
		animation-delay: .65s
	}

	.load1 view:nth-child(3) {
		animation-delay: .78s
	}

	.load2 view:nth-child(3) {
		animation-delay: .91s
	}

	.load3 view:nth-child(3) {
		animation-delay: 1.04s
	}

	.load1 view:nth-child(4) {
		animation-delay: 1.17s
	}

	.load2 view:nth-child(4) {
		animation-delay: 1.3s
	}

	.load3 view:nth-child(4) {
		animation-delay: 1.43s
	}

	@-webkit-keyframes load {
		0% {
			opacity: 1
		}

		100% {
			opacity: .2
		}
	}
</style>
