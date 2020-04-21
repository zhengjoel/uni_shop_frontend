<template>
	<view class="app">
		<view class="price-box">
			<text>支付金额</text>
			<text class="price">{{total}}</text>
		</view>

		<view class="pay-type-list">
			<view class="type-item b-b" @click="changePayType(1)" v-if="payTypeList.wxpay">
				<text class="icon yticon icon-wxpay"></text>
				<view class="con">
					<text class="tit">微信支付</text>
				</view>
				<label class="radio">
					<radio value="" color="#fa436a" :checked='payType == 1' />
					</radio>
				</label>
			</view>
			<view class="type-item b-b" @click="changePayType(2)" v-if="payTypeList.alipay">
				<text class="icon yticon icon-alipay"></text>
				<view class="con">
					<text class="tit">支付宝支付</text>
				</view>
				<label class="radio">
					<radio value="" color="#fa436a" :checked='payType == 2' />
					</radio>
				</label>
			</view>
			<view class="type-item b-b" @click="changePayType(3)" v-if="payTypeList.offline">
				<text class="icon yticon icon-pay"></text>
				<view class="con">
					<text class="tit">货到付款</text>
				</view>
				<label class="radio">
					<radio value="" color="#fa436a" :checked='payType == 3' />
					</radio>
				</label>
			</view>
		</view>
		
		<text class="mix-btn" @click="confirm">确认支付</text>
	</view>
</template>

<script>

	export default {
		data() {
			return {
				payType: 1,
				orderInfo: {},
				orderId:'',
				payTypeList:{
					wxpay:false,
					alipay:false
				},
				total: 0.00
			};
		},
		onLoad(options) {
			this.total = options.total;
			this.orderId = options.order_id;
			this.getPayType();
		},
		methods: {
			// 获取支付方式
			async getPayType() {
				let type = await this.$api.request('/pay/getPayType');
				if (type) {
					this.payTypeList = type;
				}
			},
			//选择支付方式
			changePayType(type) {
				this.payType = type;
				switch (type) {
					case 1: // 微信支付
						// 不用微信jsSdk
						break;
					case 2: // 支付宝支付
					
						break;
					case 3: // 货到付款
						break;
				}
			},
			//确认支付
			async confirm() {
				if (this.payType == 1) {
					// #ifdef MP-WEIXIN
					this.weixinPay();
					// #endif
				} else if(this.payType == 2) {
					// 支付宝支付
					
				} else if(this.payType == 3) {
					// 货到付款
					this.offlinePay();
				}
			},
			// #ifdef MP-WEIXIN
			async weixinPay(){
				let data = await this.$api.request('/pay/unify', 'GET', {order_id:this.orderId});
				let that = this;
				if (data) {
					uni.requestPayment({
					    provider: 'wxpay',
					    timeStamp: data.timeStamp,
					    nonceStr: data.nonce_str,
					    package: 'prepay_id=' + data.prepay_id,
					    signType: 'MD5',
					    paySign: data.paySign,
					    success: function (res) {
					        uni.redirectTo({
					        	url: '/pages/money/paySuccess'
					        })
					    },
					    fail: function (err) {
					        //console.log('fail:' + JSON.stringify(err));
							//that.$api.msg('fail:' + JSON.stringify(err))
							that.$api.msg('支付失败');
					    }
					});
				}
			},
			// #endif
			async offlinePay() {
				let data = await this.$api.request('/pay/offline', 'GET', {order_id:this.orderId});
				if (data) {
					uni.redirectTo({
						url: '/pages/money/paySuccess'
					});
				}
			}
		}
	}
</script>

<style lang='scss'>
	.app {
		width: 100%;
	}

	.price-box {
		background-color: #fff;
		height: 265upx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 28upx;
		color: #909399;

		.price{
			font-size: 50upx;
			color: #303133;
			margin-top: 12upx;
			&:before{
				content: '￥';
				font-size: 40upx;
			}
		}
	}

	.pay-type-list {
		margin-top: 20upx;
		background-color: #fff;
		padding-left: 60upx;
		
		.type-item{
			height: 120upx;
			padding: 20upx 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-right: 60upx;
			font-size: 30upx;
			position:relative;
		}
		
		.icon{
			width: 100upx;
			font-size: 52upx;
		}
		.icon-pay {
			color: #fe8e2e;
		}
		.icon-wxpay {
			color: #36cb59;
		}
		.icon-alipay {
			color: #01aaef;
		}
		.tit{
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 4upx;
		}
		.con{
			flex: 1;
			display: flex;
			flex-direction: column;
			font-size: $font-sm;
			color: $font-color-light;
		}
	}
	.mix-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 630upx;
		height: 80upx;
		margin: 80upx auto 30upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
		box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
	}

</style>
