<template>
	<view>
		<view class="header" v-if="order.refund_status != ''">
			<view class="left">{{order.refund_status_text}}</view>
		</view>
		<view class="product">
			<view class="goods-for" v-for="(goodsItem, goodsIndex) in order.products" :key="goodsIndex" @click="check(goodsIndex)">
				<view class="goods-box-single">
					<image class="goods-img" :src="goodsItem.image" mode="aspectFill"></image>
					<view class="right">
						<text class="title clamp">{{goodsItem.title}}</text>
						<text class="attr-box">{{goodsItem.spec}} x {{goodsItem.number}}</text>
						<text class="price">{{goodsItem.price}}</text>
					</view>
					<view class="yticon icon-xuanzhong checkbox" :class="{checked: goodsItem.choose}"></view>
				</view>
			</view>
		</view>
		
		<view class="yt-list-cell" v-if=" (order.refund_status && order.refund_status == 2) || (order.refund && order.refund.express_number)">
			<view class="cell-tit clamp">快递编号
				<input style="max-width: 350rpx;" class="input" type="text" v-model="expressNumber" placeholder="请填写快递编号" placeholder-class="placeholder" />
			</view>
			<button type="warn" @click="confirmDelivery" v-if="order.refund_status == 2">确认发货</button>
		</view>
		
		<view class="yt-list-cell">
			<view class="cell-tit clamp">货物状态</view>
			<view class="cell-tip">
				<picker :disabled="order.status == 1 ? false : true" @change="receivingStatusChange" range-key="name" :value="receivingStatusIndex" :range="receivingStatus">
					<view class="uni-input">{{receivingStatus[receivingStatusIndex].name}}</view>
				</picker>
				<text class="yticon icon-you"></text>
			</view>
		</view>

		<view class="yt-list-cell">
			<view class="cell-tit clamp">服务类型</view>
			<view class="cell-tip">
				<picker :disabled="order.status == 1 ? false : true" @change="typeChange" range-key="name" :value="serviceTypeIndex" :range="serviceType">
					<view class="uni-input">{{serviceType[serviceTypeIndex].name}}</view>
				</picker>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		
		<view class="yt-list-cell" v-if="order.total_price > 0 && (serviceTypeIndex == 0 || serviceTypeIndex == 1)">
			<view class="cell-tit clamp">退款金额： <text style="color: #ed6b00;">￥ {{order.total_price}}</text>
				<input :disabled="order.status == 1 ? false : true" type="digit" v-model="amount" :placeholder="'最多 ￥'+order.total_price + ', 含发货邮费 ￥'+ order.delivery_price" placeholder-class="placeholder" />
			</view>
		</view>
		
		<view class="yt-list-cell">
			<view class="cell-tit clamp">换货原因</view>
			<view class="cell-tip">
				<picker :disabled="order.status == 1 ? false : true" @change="reasonTypeChange" range-key="name" :value="reasonTypeIndex" :range="reasonType">
					<view class="uni-input">{{reasonType[reasonTypeIndex].name}}</view>
				</picker>
				<text class="yticon icon-you"></text>
			</view>
		</view>

		<view class="yt-list-cell">
			<view class="cell-tit clamp">换货说明
				<input :disabled="order.status == 1 ? false : true" class="input" type="text" v-model="refundExplain" placeholder="选填" placeholder-class="placeholder" />
			</view>
		</view>
		
		<button v-if="order.status == 1" class="button" @click="submit" type="warn">提交</button>
	</view>
</template>

<script>
	import uniRate from '@/components/uni-rate/uni-rate.vue'
	export default {
		computed: {
			orderProductIds(){
				var order_product_id = [];
				this.order.products.forEach(item=>{
					if (item.choose == 1) {
						order_product_id.push(item.order_product_id);
					}
				});
				return order_product_id.join(',');
			},
			status() {
				if (this.order.have_refunded == 0) {
					return '申请中';
				} else {
					return '已退货'
				}
			}
		},
		components: {
			uniRate
		},
		data() {
			return {
				order_id: 0,
				order: {},
				amount: '',
				serviceType:[{
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
						'name':'请选择'
					}
				],
				serviceTypeIndex:3,
				receivingStatus: [{
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
				receivingStatusIndex: 2,
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
				refundExplain: '',
				expressNumber: ''
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
					
					if (data.status == -1) { // 状态为退款
						let refund = data.refund;
						this.amount = refund.amount;
						let that = this;
						this.reasonType.filter(function(item, index){
							if (item.name == refund.reason_type) {
								that.reasonTypeIndex = index;
							}
						})
						this.receivingStatusIndex = refund.receiving_status;
						this.refundExplain = refund.refund_explain;
						this.serviceTypeIndex = refund.service_type;
						this.expressNumber = refund.express_number;
					}
				}
			},
			async submit(){
				if (this.receivingStatusIndex == 2) {
					this.$api.msg('请选择货物状态');
					return;
				}
				
				if ((this.serviceTypeIndex == 0 || this.serviceTypeIndex == 1) && parseFloat(this.order.total_price) > 0) {
					if (!this.amount) {
						this.$api.msg('请填写退货金额');
						return;
					}

					if (parseFloat(this.amount) > parseFloat(this.order.total_price)) {
						this.$api.msg('退款金额不得大于订单金额');
						return;
					}
				}
				
				if (this.serviceTypeIndex == 3) {
					this.$api.msg('请选择服务类型')
					return;
				}
				
				let data = await this.$api.request('/order/refund', 'POST', {
					order_id: this.order_id,
					amount: this.amount ? parseFloat(this.amount) : 0,
					service_type: this.serviceType[this.serviceTypeIndex].value,
					receiving_status: this.receivingStatus[this.receivingStatusIndex].value,
					reason_type: this.reasonType[this.reasonTypeIndex].name,
					refund_explain: this.refundExplain,
					order_product_id: this.orderProductIds
				});
				if (data) {
					this.refundInfo();
				}
			},
			// 更改商品状态
			receivingStatusChange(e) {
				this.receivingStatusIndex = e.detail.value;
			},
			// 更改换货原因
			reasonTypeChange(e) {
				this.reasonTypeIndex = e.detail.value;
			},
			// 选择服务类型
			typeChange(e) {
				this.serviceTypeIndex = e.detail.value;
			},
			// 选商品
			check(index) {
				this.order.products[index].choose = this.order.products[index].choose ? 0 : 1;
			},
			// 确认发货
			async confirmDelivery(){
				if (this.expressNumber == '') {
					this.$api.msg('请添加物流单号');
					return;
				}
				let data = await this.$api.request('/order/refundDelivery', 'POST', {order_id: this.order_id, express_number:this.expressNumber});
				if (data) {
					this.refundInfo();
				}
			}
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

	.product {
		background: #ffffff;
		margin-top: 20rpx;
		padding: 30rpx;
		.goods-for{
			border-bottom: 1rpx solid #eaeaea;
		}

		/* 单条商品 */
		.goods-box-single {
			display: flex;
			padding: 20upx 0;
			
			position: relative;
			
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
			.checkbox {
				position: absolute;
				left: -16upx;
				top: -16upx;
				z-index: 8;
				font-size: 44upx;
				line-height: 1;
				padding: 4upx;
				color: $font-color-disabled;
				background: #fff;
				border-radius: 50px;
			}
			.checkbox.checked {
				color: $uni-color-primary;
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
