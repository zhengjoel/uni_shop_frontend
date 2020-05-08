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
	// #ifdef H5
	var jweixin = require('jweixin-module');
	// #endif

	export default {
		data() {
			return {
				payType: 1,
				orderInfo: {},
				orderId: '',
				out_trade_no: '',
				payTypeList: {
					wxpay: false,
					alipay: false
				},
				total: 0.00
			};
		},
		onLoad(options) {
			this.total = options.total;
			this.orderId = options.order_id;
			this.out_trade_no = options.out_trade_no;
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
					// #ifdef H5 || APP-PLUS || MP-WEIXIN
					this.weixinPay();
					// #endif
				} else if (this.payType == 2) {
					// 支付宝支付
					this.alipay();
				} else if (this.payType == 3) {
					// 货到付款
					this.offlinePay();
				}
			},
			async alipay() {
				
				// #ifdef H5
				window.open(this.$unishow + '/pay/alipay?order_id='+this.orderId);
				
				setTimeout(function() {
					uni.showModal({
						title: '提示',
						content: '是否已支付?',
						cancelText: '否',
						confirmText: '是',
						success: function(res) {
							if (res.confirm) {
								uni.redirectTo({
									url: '/pages/order/order?state=0'
								});
							} else if (res.cancel) {
								//console.log('用户点击取消');
							}
						},
						fail: function(res) {
							//console.log(res)
						}
					});
				}, 3000);
				// #endif

				// #ifdef APP-PLUS
				let orderInfo = await this.$api.request('/pay/alipay', 'POST',{
					order_id : this.orderId
				});
				if (orderInfo) {
					//console.log(orderInfo);
					uni.requestPayment({
						provider: 'alipay',
						orderInfo: orderInfo,
						success: function (res) {
							console.log('success:' + JSON.stringify(res));
							uni.redirectTo({
								url: '/pages/money/paySuccess'
							})
						},
						fail: function (err) {
							console.log('fail:' + JSON.stringify(err));
							that.$api.msg('支付失败');
						}
					});
				}
				
				// #endif
				
			},
			async weixinPay() {
				let data = await this.$api.request('/pay/unify', 'GET', {
					order_id: this.orderId
				});
				let that = this;
				if (data) {

					if (data.trade_type == 'MWEB') {
						// #ifdef H5
						// 微信外的H5
						location.href = data.mweb_url;
						// #endif

						// #ifdef APP-PLUS
						// app 使用h5支付
						var wv; //计划创建的webview 
						wv = plus.webview.create("", "custom-webview", {
							'uni-app': 'none', //不加载uni-app渲染层框架，避免样式冲突
						})
						wv.loadURL(data.mweb_url, {
							Referer: data.referer
						});

						setTimeout(function() {
							uni.showModal({
								title: '提示',
								content: '是否已支付?',
								cancelText: '否',
								confirmText: '是',
								success: function(res) {
									if (res.confirm) {
										uni.redirectTo({
											url: '/pages/order/order?state=0'
										});
									} else if (res.cancel) {
										//console.log('用户点击取消');
									}
								},
								fail: function(res) {
									//console.log(res)
								}
							});
						}, 3000);
						// #endif

					} else if (data.trade_type == 'JSAPI') {

						// #ifdef H5
						// 微信内的H5
						let config = await this.$api.request('/pay/jssdkBuildConfig');
						if (config) {
							jweixin.config(config);
							jweixin.ready(function() {
								jweixin.chooseWXPay({
									timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
									nonceStr: data.nonce_str, // 支付签名随机串，不长于 32 位
									package: 'prepay_id=' + data.prepay_id, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
									signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
									paySign: data.paySign, // 支付签名
									success: function(res) {
										// 支付成功后的回调函数
										uni.redirectTo({
											url: '/pages/money/paySuccess'
										})
									},
									fail: function(err) {
										//console.log('fail:' + JSON.stringify(err));
										//that.$api.msg('fail:' + JSON.stringify(err))
										that.$api.msg('支付失败');
									}
								})
							});
							jweixin.error(function(res) {
								//that.$api.msg(JSON.stringify(res));
								that.$api.msg('支付失败');
							});
						} else {
							that.$api.msg('支付失败');
						}
						// #endif

						// #ifdef MP-WEIXIN
						uni.requestPayment({
							provider: 'wxpay',
							timeStamp: data.timeStamp,
							nonceStr: data.nonce_str,
							package: 'prepay_id=' + data.prepay_id,
							signType: 'MD5',
							paySign: data.paySign,
							success: function(res) {
								uni.redirectTo({
									url: '/pages/money/paySuccess'
								})
							},
							fail: function(err) {
								//console.log('fail:' + JSON.stringify(err));
								//that.$api.msg('fail:' + JSON.stringify(err))
								that.$api.msg('支付失败');
							}
						});
						// #endif
					}
				}
			},

			async offlinePay() {
				let data = await this.$api.request('/pay/offline', 'GET', {
					order_id: this.orderId
				});
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

		.price {
			font-size: 50upx;
			color: #303133;
			margin-top: 12upx;

			&:before {
				content: '￥';
				font-size: 40upx;
			}
		}
	}

	.pay-type-list {
		margin-top: 20upx;
		background-color: #fff;
		padding-left: 60upx;

		.type-item {
			height: 120upx;
			padding: 20upx 0;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-right: 60upx;
			font-size: 30upx;
			position: relative;
		}

		.icon {
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

		.tit {
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 4upx;
		}

		.con {
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
