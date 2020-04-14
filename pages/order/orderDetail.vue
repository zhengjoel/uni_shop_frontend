<template>
	<view>
		<view class="header">
			<view class="left">{{status + (order.refund_status_text ? ':'+order.refund_status_text : '')}}</view>

		</view>
		<view class="delivery" v-if="order.have_delivered">
			<view class="icon">
				<text class="cell-icon yticon icon-huoche" style="color: #ffffff"></text>
			</view>
			<view class="info">
				<view v-if="order.express_number">快递编号：{{order.express_number}}</view>
				<view>发货时候：{{order.deliveredtime}}</view>
				<text class="yticon right icon-you"></text>
			</view>

		</view>
		<view class="address" v-if="order.delivery">
			<view class="icon">
				<text class="cell-icon yticon icon-dizhi" style="color: #ffffff"></text>
			</view>
			<view class="info">
				<view class="name">{{order.delivery.username}}<text class="mobile">{{order.delivery.mobile}}</text></view>
				<view class="address">{{order.delivery.address}}</view>
			</view>
		</view>
		<view class="product" v-if="order.products">
			<view class="goods-box-single" v-for="(goodsItem, goodsIndex) in order.products" :key="goodsIndex" @click="navTo('/pages/product/product?id='+goodsItem.id+'&flash=0')">
				<image class="goods-img" :src="cdn + goodsItem.image" mode="aspectFill"></image>
				<view class="right">
					<text class="title clamp">{{goodsItem.title}}</text>
					<text class="attr-box">{{goodsItem.spec}} x {{goodsItem.number}}</text>
					<text class="price">{{goodsItem.price}}</text>
					<button class="action-btn" v-if="order.have_received != 0 && goodsItem.evaluate == false" @click.stop="button('evaluate', goodsItem)">评价</button>
				</view>
			</view>

			<view class="price">
				<view>商品总价 <text>￥ {{order.order_price}}</text></view>
				<view>运费 <text>￥ {{order.delivery_price}}</text></view>
				<view>优惠 <text>￥ {{order.discount_price}}</text></view>
				<view class="total">实付款（含运费） <text>￥ {{order.total_price}}</text></view>
			</view>
		</view>
		<view class="order" v-if="order.createtime">
			<view class="title">订单信息</view>
			<view>订单编号：{{order.out_trade_no}}</view>
			<view>创建时间：{{order.createtime}}</view>
			<view>付款时间：{{order.have_paid ? order.paidtime : '未付款'}}</view>
			<view>发货时间：{{order.have_delivered ? order.deliveredtime : '未发货'}}</view>
			<view v-if="order.have_received">成交时间：{{order.receivedtime}}</view>
			<view v-if="order.have_refunded">退货时间：{{order.refundedtime}}</view>
		</view>
		<view style="height: 10rpx;">
			<!--兼容苹果系统下margin-bottom不生效-->
		</view>
		<view class="bottom" v-if="order.state != 9">
			<button class="action-btn" v-if="order.state == 1" @click.stop="button('cancel')">取消订单</button>
			<button class="action-btn recom" v-if="order.have_paid == 0" @click.stop="button('pay')">立即支付</button>
			<button class="action-btn" v-if="order.have_paid != 0" @click.stop="button('delivery')">查看物流</button>
			<button class="action-btn" v-if="order.have_paid != 0 && order.have_received == 0" @click.stop="button('recerved')">确认收货</button>
			<button class="action-btn" v-if="order.have_paid != 0" @click.stop="button('refund')">申请售后</button>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		computed: {
			...mapState(['cdn'])
		},
		data() {
			return {
				order_id: 0,
				status: '订单状态',
				order: {}
			}
		},
		onLoad(options) {
			this.order_id = options.order_id;
			this.detail(options.order_id);
		},
		methods: {
			async detail(order_id) {
				let data = await this.$api.request('/order/detail?order_id=' + order_id);
				uni.stopPullDownRefresh();
				if (data) {
					this.status = this.orderStateExp(data.state);
					this.order = data;
				}
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
					case 6:
						stateTip = '拒绝退款';
						break;
					case 9:
						stateTip = '订单已关闭';
						break;

						//更多自定义
				}
				return stateTip;
			},
			navTo(url) {
				this.$api.navTo(url);
			},
			// 按钮动作
			async button(action, item = {}) {
				let detail = false;
				switch (action) {
					case 'cancel':
						detail = await this.$api.prePage().cancelOrder({
							order_id: this.order_id
						});
						break;
					case 'pay':
						this.navTo('/pages/money/pay?order_id=' + this.order_id + '&total=' + this.order.total_price);
						break;
					case 'delivery':
						this.navTo('/pages/public/webview?type=kd&number=' + this.order.express_number);
						break;
					case 'recerved':
						detail = await this.$api.prePage().receivedOrder({
							order_id: this.order_id
						});
						break;
					case 'evaluate':
						this.$api.navTo('/pages/order/evaluate?product_id=' + item.id + '&order_id=' + this.order_id + '&image=' + item.image +
							'&title=' + item.title + '&spec=' + item.spec);
						break;
					case 'refund':
						this.$api.navTo('/pages/order/refund?order_id=' + this.order_id);
						break;
				}
				if (detail) {
					this.detail(this.order_id);
				}
			},
			pullDownRefresh() {
				this.detail(this.order_id);
			}
		},
		onPullDownRefresh() {
			this.pullDownRefresh();
		}
	}
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
	}

	.header {
		height: 200rpx;
		background: linear-gradient(to right, #ffac30, #fa436a, #F56C6C);

		.left {
			color: #ffffff;
			line-height: 200rpx;
			padding-left: 100rpx;
		}
	}

	.delivery {
		color: #545454;
		background: #ffffff;
		border-bottom: 1px solid #e9e9e9;

		.icon {
			background: #00a7c8;
			height: 60rpx;
			width: 60rpx;
			display: inline-block;
			border-radius: 100rpx;
			margin: 50rpx 30rpx;
			text-align: center;
			line-height: 60rpx;
		}

		.info {
			display: inline-flex;
			flex-direction: column;
			justify-content: center;
			width: 600rpx;
			vertical-align: middle;
			margin: 30rpx 0;
			position: relative;

			.right {
				position: absolute;
				right: 0;
			}
		}

	}

	.address {
		color: #545454;
		background: #ffffff;

		.icon {
			background: linear-gradient(to right, #ffac30, #fa436a, #F56C6C);
			height: 60rpx;
			width: 60rpx;
			display: inline-block;
			border-radius: 100rpx;
			margin: 50rpx 30rpx;
			text-align: center;
			line-height: 60rpx;
		}

		.info {
			display: inline-flex;
			flex-direction: column;
			justify-content: center;
			width: 600rpx;
			vertical-align: middle;
			margin: 30rpx 0;

			.mobile {
				color: #9b9b9b;
				margin-left: 30rpx;
			}
		}
	}

	.product {
		background: #ffffff;
		margin-top: 20rpx;
		padding: 30rpx;

		/* 单条商品 */
		.goods-box-single {
			display: flex;
			padding: 20upx 0;
			border-bottom: 1rpx solid #eaeaea;

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
				position: relative;

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
					margin-top: 0;

					&:before {
						content: '￥';
						font-size: $font-sm;
						margin: 0 2upx 0 8upx;
					}
				}

				.action-btn {
					width: 160rpx;
					height: 60rpx;
					padding: 0;
					text-align: center;
					line-height: 60rpx;
					font-size: 26rpx;
					color: #303133;
					background: #fff;
					border-radius: 100px;
					float: right;
					position: absolute;
					right: 0;
					bottom: 0;
				}
			}
		}

		.price {
			color: #9b9b9b;
			font-size: 26rpx;
			margin-top: 30rpx;

			text {
				float: right;
			}

			.total {
				font-size: 35rpx;

				text {
					color: #F56C6C;
				}
			}
		}
	}

	.order {
		background: #ffffff;
		margin-top: 20rpx;
		padding: 30rpx;

		.title {
			border-left: 4rpx solid #F56C6C;
			padding-left: 17rpx;
			color: #898989;
			font-size: 35rpx;
			margin-bottom: 20rpx;
		}

		font-size: 26rpx;
		color: #9b9b9b;
		line-height: 45rpx;
		margin-bottom: 120rpx;
	}

	.bottom {
		position: fixed;
		width: 100%;
		height: 100rpx;
		background: #ffffff;
		bottom: 0;
		border-top: 1px solid #e9e9e9;

		.action-btn {
			width: 160rpx;
			height: 60rpx;
			margin: 20rpx;
			padding: 0;
			text-align: center;
			line-height: 60rpx;
			font-size: 26rpx;
			color: #303133;
			background: #fff;
			border-radius: 100px;
			float: right;

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
</style>
