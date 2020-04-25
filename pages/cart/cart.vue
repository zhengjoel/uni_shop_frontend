<template>
	<view class="container">
		<!-- 空白页 -->
		<view v-if="(!hasLogin || empty===true) && state != 'load'" class="empty">
			<image src="/static/emptyCart.jpg" mode="aspectFit"></image>
			<view v-if="hasLogin" class="empty-tips">
				空空如也
				<navigator class="navigator" v-if="hasLogin" url="../index/index" open-type="switchTab">随便逛逛></navigator>
			</view>
			<view v-else class="empty-tips">
				空空如也
				<view class="navigator" @click="navToLogin">去登陆></view>
			</view>
		</view>
		<view v-else>
			<!-- 列表 -->
			<view class="cart-list">
				<block v-for="(item, index) in cartList" :key="item.id">
					<view class="cart-item" :class="{'b-b': index!==cartList.length-1}" :style="{'background':item.isset?'':'#f5f5f5'}" 
						@click="navTo(`/pages/product/product?id=${item.product_id}&flash=0`)"
					>
						<view class="image-wrapper">
							<image :src="item.image" class="loaded" mode="aspectFill"></image>
							<view v-if="item.isset == true" class="yticon icon-xuanzhong checkbox" :class="{checked: item.choose}" @click.stop="check('item', index)"></view>
						</view>
						<view class="item-right">
							<text class="clamp title">{{item.title}}</text>
							<text class="attr" v-if="item.spec">{{item.spec}}</text>
							<text class="price">￥{{item.nowPrice}} <text style="color:red"> {{cartPrice(item.oldPrice, item.nowPrice)}}</text></text>
							<uni-number-box class="step" :min="1" :max="item.stock" :disabled="item.number>=item.stock" :value="cartList[index].number"
							 :isMax="item.number>=item.stock?true:false" :isMin="item.number===1" :index="index" @eventChange="numberChange"></uni-number-box>
						</view>
						<text class="del-btn yticon icon-lajitong" @click.stop="deleteCartItem(index)"></text>
						<text class="invalid" v-if="item.isset == false">失效</text>
						<text class="invalid" v-if="item.stock == 0 && item.isset == true">库存不足</text>
					</view>
				</block>
			</view>
			<!-- 底部菜单栏 -->
			<view class="action-section" v-if="state != 'load'">
				<view class="checkbox">
					<image :src="allChoose?'/static/selected.png':'/static/select.png'" mode="aspectFit" @click="check('all')"></image>
					<view class="clear-btn" :class="{show: allChoose}" @click="clearCart">
						清空
					</view>
				</view>
				<view class="total-box">
					<text class="price">¥{{total}}</text>
				</view>
				<button type="primary" class="no-border confirm-btn" @click="createOrder">去结算</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import uniNumberBox from '@/components/uni-number-box.vue'
	export default {
		components: {
			uniNumberBox
		},
		data() {
			return {
				total: 0, //总价格
				allChoose: false, //全选状态  true|false
				empty: false, //空白页现实  true|false
				cartList: [],
				state : 'load'
			};
		},
		onLoad() {
			
		},
		onPullDownRefresh() {
			this.state = 'load';
			this.cartList = [];
			this.getCart();
		},
		onShow() {
			this.state = 'load';
			this.cartList = [];
			this.getCart();
		},
		watch: {
			//显示空白页
			cartList(e) {
				let empty = e.length === 0 ? true : false;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		computed: {
			...mapState(['hasLogin'])
		},
		methods: {
			async getCart() {
				let login = await this.$api.checkLogin();
				if (login) {
					let data = await this.$api.request('/cart');
					uni.stopPullDownRefresh();
					this.state = 'loaded';
					if (data){
						this.cartList = data;
						this.calcTotal();
					}
					
				}
			},
			cartPrice(oldPrice, nowPrice) {
				let string = '';
				if (oldPrice < nowPrice) {
					let number = (nowPrice - oldPrice).toFixed(2);
					string = ' ↑涨价 ' + number + '元';
				} else if (oldPrice > nowPrice) {
					let number = (oldPrice - nowPrice).toFixed(2);
					string = ' ↓降价 ' + number + '元';
				}
				return string;
			},
			navToLogin() {
				uni.navigateTo({
					url: '/pages/public/login'
				})
			},
			//选中状态处理
			async check(type, index) {
				
				let trueArr = [];
				let falseArr = [];
				let oldChoose = [];
				const list = this.cartList;
				//保存旧的数据
				list.forEach(item => {
					if(item.choose){
						oldChoose.push(item.cart_id);
					}
				})
				
				//本地处理
				if (type === 'item') {
					this.cartList[index].choose = !this.cartList[index].choose;
					if (this.cartList[index].choose) {
						trueArr.push(this.cartList[index].cart_id);
					} else {
						falseArr.push(this.cartList[index].cart_id);
					}
				} else {
					const choose = !this.allChoose
					list.forEach(item => {
						item.choose = choose;
						if (item.isset) {
							if (choose) {
								trueArr.push(item.cart_id);
							} else {
								falseArr.push(item.cart_id);
							}
						}
					})
					this.allChoose = choose;
				}
				this.calcTotal(type);
				
				//远程处理
				let result = await this.$api.request('/cart/choose_change', 'POST', {trueArr,falseArr});
				if (!result) {
					//恢复原来勾选的状态
					list.forEach(item => {
						if (oldChoose.indexOf(item.cart_id) >= 0) {
							item.choose = 1;
						} else {
							item.choose = 0;
						}
					})
					this.calcTotal(type);
				}
				
			},
			//数量
			async numberChange(data) {
				let oldNumber = this.cartList[data.index].number;
				let newNumber = data.number;
				this.cartList[data.index].number = newNumber;
				this.calcTotal();
				
				let cart_id = this.cartList[data.index].cart_id;
				let result = await this.$api.request('/cart/number_change?id='+cart_id, 'GET', {number:newNumber}, false);
				if (!result) {
					this.cartList[data.index].number = oldNumber;
					this.calcTotal();
				}
				
			},
			//删除
			async deleteCartItem(index) {
				let list = this.cartList;
				let row = list[index];
				let id = row.cart_id;
								
				uni.showModal({
					content: '确认删除 ' + list[index].title + '？' ,
					success: async (e) => {
						if (e.confirm) {
							let result = await this.$api.request('/cart/delete?', 'POST', {id:id});
							if (result) {
								let tempCart = this.cartList.splice(index, 1);
								this.calcTotal();
							}
						}
					}
				})

			},
			//清空
			async clearCart() {
				let [error, res] = await uni.showModal({
					title: '确认清空？'
				});
				if (res.confirm) {
					let id = [];
					this.cartList.forEach(item=>{
						id.push(item.cart_id);
					});
					let data = this.$api.request('/cart/delete', 'POST',{id:id});
					let that = this;
					if (data) {
						setTimeout(function(){
							that.state = 'load';
							that.cartList = [];
							that.getCart();
						},300);
					}
				}
			},
			//计算总价
			calcTotal() {
				let list = this.cartList;
				if (list.length === 0) {
					this.empty = true;
					return;
				}
				let total = 0;
				let choose = true;
				list.forEach(item => {
					if (item.isset) {
						if (item.choose == 1) {
							total += item.nowPrice * item.number;
						} else if (choose === true) {
							choose = false;
						}
					}
				})
				this.allChoose = choose;
				this.total = total.toFixed(2);
			},
			//创建订单
			createOrder() {
				let list = this.cartList;
				let cartId = [];
				list.forEach(item => {
					if (item.choose) {
						cartId.push(item.cart_id);
					}
				})
				if (cartId.length == 0) {
					this.$api.msg('没有选中商品');
					return;
				}
				this.$api.navTo(`/pages/order/createOrder?cart=${cartId.join(',')}`);
			},
			navTo(url){
				this.$api.navTo(url);
			}
		}
	}
</script>

<style lang='scss'>
	.container {
		padding-bottom: 134upx;
		
		/* 空白页 */
		.empty {
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			height: 100vh;
			padding-bottom: 100upx;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			background: #fff;

			image {
				width: 240upx;
				height: 160upx;
				margin-bottom: 30upx;
			}

			.empty-tips {
				display: flex;
				font-size: $font-sm+2upx;
				color: $font-color-disabled;

				.navigator {
					color: $uni-color-primary;
					margin-left: 16upx;
				}
			}
		}
	}

	/* 购物车列表项 */
	.cart-item {
		display: flex;
		position: relative;
		padding: 30upx 40upx;

		.image-wrapper {
			width: 230upx;
			height: 230upx;
			flex-shrink: 0;
			position: relative;

			image {
				border-radius: 8upx;
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

		.item-right {
			display: flex;
			flex-direction: column;
			flex: 1;
			overflow: hidden;
			position: relative;
			padding-left: 30upx;

			.title,
			.price {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				height: 40upx;
				line-height: 40upx;
			}

			.attr {
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				height: 50upx;
				line-height: 50upx;
			}

			.price {
				height: 50upx;
				line-height: 50upx;
			}
		}

		.del-btn {
			padding: 4upx 10upx;
			font-size: 34upx;
			height: 50upx;
			color: $font-color-light;
		}

		.invalid {
			position: absolute;
			right: 0;
			bottom: 0;
			background: #999999;
			color: #ffffff;
			padding: 6upx 12upx;
			border-radius: 10upx;
			font-size: 26upx;
			margin-right: 50upx;
			margin-bottom: 32upx;
		}
	}

	/* 底部栏 */
	.action-section {
		/* #ifdef H5 */
		margin-bottom: 100upx;
		/* #endif */
		position: fixed;
		left: 30upx;
		bottom: 30upx;
		z-index: 95;
		display: flex;
		align-items: center;
		width: 690upx;
		height: 100upx;
		padding: 0 30upx;
		background: rgba(255, 255, 255, .9);
		box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .5);
		border-radius: 16upx;

		.checkbox {
			height: 52upx;
			position: relative;

			image {
				width: 52upx;
				height: 100%;
				position: relative;
				z-index: 5;
			}
		}

		.clear-btn {
			position: absolute;
			left: 26upx;
			top: 0;
			z-index: 4;
			width: 0;
			height: 52upx;
			line-height: 52upx;
			padding-left: 38upx;
			font-size: $font-base;
			color: #fff;
			background: $font-color-disabled;
			border-radius: 0 50px 50px 0;
			opacity: 0;
			transition: .2s;

			&.show {
				opacity: 1;
				width: 120upx;
			}
		}

		.total-box {
			flex: 1;
			display: flex;
			flex-direction: column;
			text-align: right;
			padding-right: 40upx;

			.price {
				font-size: $font-lg;
				color: $font-color-dark;
			}

		}

		.confirm-btn {
			padding: 0 38upx;
			margin: 0;
			border-radius: 100px;
			height: 76upx;
			line-height: 76upx;
			font-size: $font-base + 2upx;
			background: $uni-color-primary;
			box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72)
		}
	}

	/* 复选框选中状态 */
	.action-section .checkbox.checked,
	.cart-item .checkbox.checked {
		color: $uni-color-primary;
	}
</style>
