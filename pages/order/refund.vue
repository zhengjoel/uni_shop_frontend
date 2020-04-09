<template>
	<view>
		<view class="product">
			<view class="goods-box-single" v-for="(goodsItem, goodsIndex) in order.products" :key="goodsIndex">
				<image class="goods-img" :src="cdn + goodsItem.image" mode="aspectFill"></image>
				<view class="right">
					<text class="title clamp">{{goodsItem.title}}</text>
					<text class="attr-box">{{goodsItem.spec}} x {{goodsItem.number}}</text>
					<text class="price">{{goodsItem.price}}</text>
				</view>
			</view>

		</view>
		
		<view class="yt-list-cell" v-if="order.total_price">
			<view class="cell-tit clamp">退款金额： <text style="color: #ed6b00;">￥ {{order.total_price}}</text>
				<input type="digit" v-model="amount" :placeholder="'最多 ￥'+order.total_price + ', 含发货邮费 ￥'+ order.delivery_price" placeholder-class="placeholder" />
			</view>
			
		</view>
		
		<view class="yt-list-cell">
			<view class="cell-tit clamp">货物状态</view>
			<view class="cell-tip">
				<picker @change="productStatusChange" range-key="name" :value="productStatusIndex" :range="productStatus">
					<view class="uni-input">{{productStatus[productStatusIndex].name}}</view>
				</picker>
				<text class="yticon icon-you"></text>
			</view>
		</view>

		<view class="yt-list-cell">
			<view class="cell-tit clamp">服务类型</view>
			<view class="cell-tip">
				<picker @change="typeChange" range-key="name" :value="typeIndex" :range="type">
					<view class="uni-input">{{type[typeIndex].name}}</view>
				</picker>
				<text class="yticon icon-you"></text>
			</view>
		</view>

		<view class="yt-list-cell">
			<view class="cell-tit clamp">换货原因</view>
			<view class="cell-tip">
				<picker @change="reasonTypeChange" range-key="name" :value="reasonTypeIndex" :range="reasonType">
					<view class="uni-input">{{reasonType[reasonTypeIndex].name}}</view>
				</picker>
				<text class="yticon icon-you"></text>
			</view>
		</view>

		<view class="yt-list-cell">
			<view class="cell-tit clamp">换货说明
				<input class="input" type="text" v-model="refundExplain" placeholder="选填" placeholder-class="placeholder" />
			</view>
		</view>
		
		<button class="button" @click="submit" type="warn">提交</button>
	</view>
</template>

<script>
	import uniRate from '@/components/uni-rate/uni-rate.vue'
	import {
		mapState
	} from 'vuex';
	export default {
		computed: {
			...mapState(['cdn'])
		},
		components: {
			uniRate
		},
		data() {
			return {
				order_id: 0,
				order: {},
				amount: '',
				type:[{
						'value': 0,
						'name': '我要退款(无需退货)'
					},
					{
						'value': 1,
						'name': '我要退货退款'
					},
					{
						'value': 2,
						'name': '换货'
					},
					{
						'value': 3,
						'name':'选选择'
					}
				],
				typeIndex:3,
				productStatus: [{
						'value': 0,
						'name': '未收到'
					},
					{
						'value': 1,
						'name': '已收到'
					},
					{
						'value': 2,
						'name': '请选择'
					}
				],
				productStatusIndex: 2,
				reasonType: [{
						'name': '其他'
					},
					{
						'name': '拍错/不喜欢/效果不好'
					},
					{
						'name': '质量与商品描述不符'
					},
					{
						'name': '版本/批次/颜色/容量等与商品描述不符'
					},
					{
						'name': '发错货'
					},
					{
						'name': '假冒品牌'
					}
				],
				reasonTypeIndex: 0,
				refundExplain: ''
			}
		},
		onPullDownRefresh() {
			this.refundInfo();
		},
		onLoad(options) {
			this.order_id = options.order_id;
			this.refundInfo();
		},
		methods: {
			async refundInfo() {
				let data = await this.$api.request('/order/refundInfo', 'POST', {
					order_id: this.order_id
				});
				uni.stopPullDownRefresh();
				if (data) {
					this.order = data;
				}
			},
			async submit(){
				if (this.productStatusIndex == 2) {
					this.$api.msg('请选择货物状态');
					return;
				}
				if (this.typeIndex == 3) {
					this.$api.msg('请选择服务类型')
					return;
				}
				let data = await this.$api.request('/order/refund', 'POST', {
					
				});
				if (data) {
					
				}
			},
			// 更改商品状态
			productStatusChange(e) {
				this.productStatusIndex = e.detail.value;
			},
			// 更改换货原因
			reasonTypeChange(e) {
				this.reasonTypeIndex = e.detail.value;
			},
			// 选择服务类型
			typeChange(e) {
				this.typeIndex = e.detail.value;
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
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
	}

	.yt-list-cell {
		margin-top: 16upx;
		background: #fff;
		display: flex;
		align-items: center;
		padding: 10upx 30upx 10upx;
		line-height: 70upx;
		position: relative;

		.cell-tit {
			flex: 1;
			font-size: 26rpx;
			color: #000000;
			margin-right: 10rpx;

			.input {
				display: inline-block;
				vertical-align: middle;
				line-height: 26rpx;
				margin-left: 20rpx;
				width: 550rpx;
			}
		}

		.cell-tip {
			font-size: 26rpx;
			color: $font-color-dark;

			picker {
				display: inline-block;
				width: 500rpx;
				text-align: right;
				padding-right: 20rpx;
				color: $font-color-light;
			}

			.yticon {
				font-size: 26rpx;
			}
		}

	}
	
	.button{
		margin: 20rpx;
	}
</style>
