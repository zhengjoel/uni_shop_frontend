<template>
	<view class="container">
		<view class="carousel">
			<swiper indicator-dots circular=true duration="400">
				<swiper-item class="swiper-item" v-for="(item,index) in product.images_text" :key="index">
					<view class="image-wrapper">
						<image :src="cdn + item" class="loaded" @click="previewImage(index)" mode="aspectFill"></image>
					</view>
				</swiper-item> 
			</swiper>
		</view>

		<!-- 秒杀的话才显示 -->
		<view class="flash" v-if="flash">
			<view class="sales_price" v-if="product.market_price"><view class="symbol">￥</view>{{specProduct.sales_price}}</view>
			<view class="left" v-if="product.market_price">
				<view class="market_price">￥{{specProduct.market_price}}</view>
				<view class="sold">秒{{progress.number}}件</view>
			</view>
			<view class="right">
				<view class="time" v-if="countdown && progress.number != progress.sold">距结束
					<uni-countdown 
					:showDay="countdown.day > 0 ? true : false" 
					:day="countdown.day" 
					:hour="countdown.hour" 
					:minute="countdown.minute"
					:second="countdown.second" 
					color="#fffa30" 
					borderWidth="22rpx" 
					splitorColor="#fffa30"  
					background-color="#282f2c00" 
					border-color="#00B26A"></uni-countdown>
				</view>
				<view class="time" v-else>抢购已结束</view>
				<view class="progress">
					<ProgressBar 
					class="ProgressBar" 
					:Sold="progress.sold" 
					:widthUpx="250"
					:Width="percentage(progress.number, progress.sold)" 
					Type="candy" 
					:Vice="true"></ProgressBar>
				</view>
			</view>
		</view>

		<view class="introduce-section" v-if="product.product_id">
			<text class="title">{{product.title}}</text>
			<view class="price-box" v-if="flash == false">
				<text class="price-tip">¥</text>
				<text class="price">{{specProduct.sales_price}}</text>
				<text class="m-price" v-if="specProduct.market_price">¥{{specProduct.market_price}}</text>
				<text class="coupon-tip" v-if="specProduct.market_price">{{(specProduct.sales_price/specProduct.market_price*10).toFixed(1)}}折</text>
			</view>
			<view class="bot-row">
				<text>销量: {{product.sales}}</text>
				<text>总库存: {{product.stock}}</text>
				<text>浏览量: {{product.look}}</text>
			</view>
		</view>

		<!--  分享 分销 第二版本做-->
		<!-- <view class="share-section" @click="share">
			<view class="share-icon">
				<text class="yticon icon-xingxing"></text>
				 返
			</view>
			<text class="tit">该商品分享可领49减10红包</text>
			<text class="yticon icon-bangzhu1"></text>
			<view class="share-btn">
				立即分享
				<text class="yticon icon-you"></text>
			</view>
		</view> -->

		<view class="c-list">
			<view class="c-row b-b" @click="toggleSpec" v-if="product.use_spec">
				<text class="tit">购买类型</text>
				<view class="con">
					<text class="selected-text">
						{{specSelectedName}}
					</text>
					<text style="margin-left: 50rpx;">库存:{{specProduct.stock}}</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="c-row b-b" @click="toggleCoupon" v-if="product.coupon.length">
				<text class="tit">优惠券</text>
				<text class="con t-r red">领取优惠券</text>
				<text class="yticon icon-you"></text>
			</view>
			<view class="c-row b-b" v-if="product.salesly.length">
				<text class="tit">促销活动</text>
				<view class="con-list">
					<text v-for="item in product.salesly" :key="item.id">{{item.title}}</text>
				</view>
			</view>
			<view class="c-row b-b" v-if="product.server">
				<text class="tit">服务</text>
				<view class="bz-list con">
					{{product.server}}
				</view>
			</view>
		</view>

		<!-- 评价 -->
		<view class="eva-section" v-if="product.evaluate_data && product.evaluate_data.count > 0">
			<view class="e-header" @click="$api.navTo('/pages/product/evaluate?product_id='+product.product_id)">
				<text class="tit">评价</text>
				<text>({{product.evaluate_data.count}})</text>
				<text class="tip">好评率 {{product.evaluate_data.avg}}%</text>
				<text class="yticon icon-you"></text>
			</view>
			<view class="eva-box" v-for="(item, index) in product.evaluate_list" :key="index">
				<image class="portrait" :src="item.avatar" mode="aspectFill"></image>
				<view class="right">
					<text class="name">{{item.username}}</text>
					<text class="con">{{item.comment}}</text>
					<view class="bot">
						<text class="attr">购买类型：{{item.spec}}</text>
						<text class="time">{{item.createtime_text}}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="detail-desc" v-if="product.desc">
			<view class="d-header">
				<text>图文详情</text>
			</view>
			<rich-text :nodes="product.desc"></rich-text>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page-bottom">
			<navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn">
				<text class="yticon icon-fangzi"></text>
				<text>首页</text>
			</navigator>
			<navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
				<text class="yticon icon-gouwuche"></text>
				<text>购物车</text>
			</navigator>
			<view class="p-b-btn" :class="{active: favorite}" @click="toFavorite">
				<text class="yticon icon-shoucang"></text>
				<text>收藏</text>
			</view>

			<view class="action-btn-group">
				<button type="primary" class=" action-btn no-border buy-now-btn" @click="buy">立即购买</button>
				<button type="primary" class=" action-btn no-border add-cart-btn" @click="addCart">加入购物车</button>
			</view>
		</view>

		<!-- 领取优惠券-模态层弹窗 -->
		<view class="popup spec" :class="couponClass" @touchmove.stop.prevent="stopPrevent" @click="toggleCoupon">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="layer attr-content" @click.stop="stopPrevent">
				<coupon v-for="(item, index) in product.coupon" :key="index" v-bind:item="item" theme="#ff0000"></coupon>
				<button class="btn" @click="toggleCoupon">收起</button>
			</view>
		</view>

		<!-- 规格-模态层弹窗 -->
		<view class="popup spec" :class="specClass" @touchmove.stop.prevent="stopPrevent" @click="toggleSpec">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="layer attr-content" @click.stop="stopPrevent">
				<view class="a-t">
					<image v-if="specProduct.image" mode="aspectFill" :src="cdn + specProduct.image"></image>
					<view class="right">
						<text class="price">¥{{specProduct.sales_price}}</text>
						<text class="stock">库存：{{specProduct.stock}}件</text>
						<view class="selected">
							已选：
							<text class="selected-text">
								{{specSelectedName}}
							</text>
						</view>
					</view>
				</view>
				<view v-for="(item,index) in specList" :key="index" class="attr-list">
					<text>{{item.name}}</text>
					<view class="item-list">
						<text v-for="(childItem, childIndex) in specChildList" v-if="childItem.pid === item.id" :key="childIndex" class="tit"
						 :class="{selected: childItem.selected}" @click="selectSpec(childIndex, childItem.pid)">
							{{childItem.name}}
						</text>
					</view>
				</view>
				<button class="btn" @click="toggleSpec">完成</button>
			</view>
		</view>

		<!-- 分享 -->
		<share ref="share" :contentHeight="580" :shareList="shareList"></share>
	</view>
</template>

<script>
	import {
		mapGetters, mapState
	} from 'vuex';
	import share from '@/components/share';
	import coupon from '@/components/coolc-coupon/coolc-coupon';
	import ProgressBar from '@/components/Progress-Bar/Progress-Bar';
	import uniCountdown from '@/components/uni-countdown/uni-countdown.vue';

	export default {
		components: {
			share,
			coupon,
			ProgressBar,
			uniCountdown
		},
		computed: {
			...mapGetters(['userInfo', 'hasLogin']),
			...mapState(['cdn']),
			specSelectedName() {
				return this.specSelected.join(' ');
			},
			specProduct() {
				if (this.product.use_spec == 1) {
					let market_price = this.product.market_price;
					let sales_price = this.product.sales_price;
					let stock = this.product.stock;
					let image = this.product.image;
					let specSelectedName = this.specSelected.join(' ');
					let specTableList = this.specTableList;
					for (var item of this.specTableList) {
						if (item.value.join(' ') == specSelectedName) {
							market_price = item.market_price;
							sales_price = item.sales_price;
							stock = item.stock;
							image = item.image;
						}

					}
					return {
						market_price,
						sales_price,
						stock,
						image
					};
				} else {
					return this.product;
				}
			}
		},
		data() {
			return {
				couponClass: 'none',
				specClass: 'none',
				specSelected: [],
				favorite: false,
				shareList: [],
				specList: [],
				specChildList: [],
				specTableList: [],
				product: {},
				flash: false,
				id: false,
				countdown: {},
				progress:{
					sold:1,
					number:1
				}
			};
		},
		onPullDownRefresh(){
			this.getDetail(this.id, this.flash?this.flash:0);
		},
		onShareAppMessage(e) {
			return {
				title: this.product.title,
			};
		},
		onLoad(options) {
			this.id = options.id;
			let flash_id = options.flash ? options.flash : 0;
			if (flash_id != 0) {
				this.flash = flash_id;
			}
			this.getDetail(this.id, flash_id);
		},
		methods: {
			// 获取商品详情
			async getDetail(id, flash_id) {
				let apiUrl = flash_id == 0 ? '/product/detail' : '/flash/productDetail'
				let product = await this.$api.request(apiUrl + `?id=${id}&flash_id=${flash_id}`, 'GET');
				uni.stopPullDownRefresh();
				if (!product) {
					return;
				}
				this.product = product;
				if (product.flash) {
					this.countdown = product.flash.countdown;
					this.progress = product.flash;
				}
				this.favorite = this.product.favorite;
				if (this.product.use_spec) {
					let specList = this.product.spec_list;
					let specTableList = this.product.spec_table_list;
				
					let e = 1;
					let ee = 1;
					let specChildList = [];
					for (let i in specList) {
						specList[i].id = e++;
						for (let ii in specList[i].child) {
							specChildList.push({
								id: ee++,
								pid: specList[i].id,
								name: specList[i].child[ii]
							})
						}
					}
					this.specList = specList;
					this.specChildList = specChildList;
					this.specTableList = specTableList;
					//console.log(this.specList)
					//console.log(specChildList)
				
					//规格 默认选中第一条
					this.specSelected = [];
					this.specList.forEach(item => {
						for (let cItem of this.specChildList) {
							if (cItem.pid === item.id) {
								this.$set(cItem, 'selected', true);
								this.specSelected.push(cItem.name);
								break; //forEach不能使用break
							}
						}
					})
				}
			},
			//领取优惠券开关
			toggleCoupon() {
				if (this.couponClass === 'show') {
					this.couponClass = 'hide';
					setTimeout(() => {
						this.couponClass = 'none';
					}, 250);
				} else if (this.couponClass === 'none') {
					this.couponClass = 'show';
				}
			},
			//规格弹窗开关
			toggleSpec() {
				if (this.specClass === 'show') {
					this.specClass = 'hide';
					setTimeout(() => {
						this.specClass = 'none';
					}, 250);
				} else if (this.specClass === 'none') {
					this.specClass = 'show';
				}
			},
			//选择规格
			selectSpec(index, pid) {
				let list = this.specChildList;
				list.forEach(item => {
					if (item.pid === pid) {
						this.$set(item, 'selected', false);
					}
				})

				this.$set(list[index], 'selected', true);
				//存储已选择
				/**
				 * 修复选择规格存储错误
				 * 将这几行代码替换即可
				 * 选择的规格存放在specSelected中
				 */
				this.specSelected = [];
				console.log(list)
				list.forEach(item => {
					if (item.selected === true) {
						this.specSelected.push(item.name);
					}
				})

			},
			//分享
			share() {
				this.$refs.share.toggleMask();
			},
			//收藏
			async toFavorite() {
				if (this.flash) {
					this.$api.msg('秒杀商品不能收藏');
					return;
				}
				let is_login = await this.$api.checkLogin();
				if (is_login) {
					this.favorite = !this.favorite;
					let bool = await this.$api.request('/product/favorite?id=' + this.product.product_id);
					if (!bool) {
						this.favorite = !this.favorite;
					}
				}
			},
			async buy() {
				let is_login = await this.$api.checkLogin();
				if (is_login) {
					let spec = '';
					if (this.product.use_spec == 1) {
						spec = this.specSelected.join(',');
					}
					let url = `/pages/order/createOrder?id=${this.product.product_id}&spec=${spec}`;
					if (this.flash) {
						url = url + `&flash_id=${this.flash}`;
					}
					uni.navigateTo({
						url:url 
					});
				}
			},
			//添加购物车
			async addCart() {
				if (this.flash) {
					this.$api.msg('秒杀商品不能加入购物车');
					return;
				}
				let is_login = await this.$api.checkLogin();
				if (is_login) {
					let spec = '';
					if(this.product.use_spec == 1) {
						spec = this.specSelected.join(',');
					}
					await this.$api.request('/cart/add?id=' + this.product.product_id + '&spec='+ spec);
				}
			},
			stopPrevent() {},
			// 计算百分比
			percentage(number, sold) {
				if (sold == 0) {
					return 0;
				}
				return parseInt(sold / number * 100);
			},
			// 查看图片
			previewImage(index){
				let urls = [];
				this.product.images_text.forEach(item=>{
					urls.push(this.cdn + item);
				})
				uni.previewImage({
					current:this.cdn + this.product.images_text[index],
					urls:urls,
					indicator:"number",
					loop: true
				})
			}
		},

	}
</script>

<style lang='scss'>
	page {
		background: $page-color-base;
		padding-bottom: 160upx;
	}

	.icon-you {
		font-size: $font-base + 2upx;
		color: #888;
	}

	.carousel {
		height: 722upx;
		position: relative;

		swiper {
			height: 100%;
		}

		.image-wrapper {
			width: 100%;
			height: 100%;
		}

		.swiper-item {
			display: flex;
			justify-content: center;
			align-content: center;
			height: 750upx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}
		}

	}

	/* 标题简介 */
	.introduce-section {
		background: #fff;
		padding: 20upx 30upx;

		.title {
			font-size: 32upx;
			color: $font-color-dark;
			height: 50upx;
			line-height: 50upx;
		}

		.price-box {
			display: flex;
			align-items: baseline;
			height: 64upx;
			padding: 10upx 0;
			font-size: 26upx;
			color: $uni-color-primary;
		}

		.price {
			font-size: $font-lg + 2upx;
		}

		.m-price {
			margin: 0 12upx;
			color: $font-color-light;
			text-decoration: line-through;
		}

		.coupon-tip {
			align-items: center;
			padding: 4upx 10upx;
			background: $uni-color-primary;
			font-size: $font-sm;
			color: #fff;
			border-radius: 6upx;
			line-height: 1;
			transform: translateY(-4upx);
		}

		.bot-row {
			display: flex;
			align-items: center;
			height: 50upx;
			font-size: $font-sm;
			color: $font-color-light;

			text {
				flex: 1;
			}
		}
	}

	/* 分享 */
	.share-section {
		display: flex;
		align-items: center;
		color: $font-color-base;
		background: linear-gradient(left, #fdf5f6, #fbebf6);
		padding: 12upx 30upx;

		.share-icon {
			display: flex;
			align-items: center;
			width: 70upx;
			height: 30upx;
			line-height: 1;
			border: 1px solid $uni-color-primary;
			border-radius: 4upx;
			position: relative;
			overflow: hidden;
			font-size: 22upx;
			color: $uni-color-primary;

			&:after {
				content: '';
				width: 50upx;
				height: 50upx;
				border-radius: 50%;
				left: -20upx;
				top: -12upx;
				position: absolute;
				background: $uni-color-primary;
			}
		}

		.icon-xingxing {
			position: relative;
			z-index: 1;
			font-size: 24upx;
			margin-left: 2upx;
			margin-right: 10upx;
			color: #fff;
			line-height: 1;
		}

		.tit {
			font-size: $font-base;
			margin-left: 10upx;
		}

		.icon-bangzhu1 {
			padding: 10upx;
			font-size: 30upx;
			line-height: 1;
		}

		.share-btn {
			flex: 1;
			text-align: right;
			font-size: $font-sm;
			color: $uni-color-primary;
		}

		.icon-you {
			font-size: $font-sm;
			margin-left: 4upx;
			color: $uni-color-primary;
		}
	}

	.c-list {
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		background: #fff;

		.c-row {
			display: flex;
			align-items: center;
			padding: 20upx 30upx;
			position: relative;
		}

		.tit {
			width: 140upx;
		}

		.con {
			flex: 1;
			color: $font-color-dark;

			.selected-text {
				margin-right: 10upx;
			}
		}

		.bz-list {
			height: 40upx;
			font-size: $font-sm+2upx;
			color: $font-color-dark;

			text {
				display: inline-block;
				margin-right: 30upx;
			}
		}

		.con-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			color: $font-color-dark;
			line-height: 40upx;
		}

		.red {
			color: $uni-color-primary;
		}
	}

	/* 评价 */
	.eva-section {
		display: flex;
		flex-direction: column;
		padding: 20upx 30upx;
		background: #fff;
		margin-top: 16upx;

		.e-header {
			display: flex;
			align-items: center;
			height: 70upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;

			.tit {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				margin-right: 4upx;
			}

			.tip {
				flex: 1;
				text-align: right;
			}

			.icon-you {
				margin-left: 10upx;
			}
		}
	}

	.eva-box {
		display: flex;
		padding: 20upx 0;

		.portrait {
			flex-shrink: 0;
			width: 80upx;
			height: 80upx;
			border-radius: 100px;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			font-size: $font-base;
			color: $font-color-base;
			padding-left: 26upx;
				
			.con {
				font-size: $font-base;
				color: $font-color-dark;
				padding: 20upx 0;
			}

			.bot {
				display: flex;
				justify-content: space-between;
				font-size: $font-sm;
				color: $font-color-light;
			}
		}
	}

	/*  详情 */
	.detail-desc {
		background: #fff;
		margin-top: 16upx;
		.d-header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			position: relative;

			text {
				padding: 0 20upx;
				background: #fff;
				position: relative;
				z-index: 1;
			}

			&:after {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translateX(-50%);
				width: 300upx;
				height: 0;
				content: '';
				border-bottom: 1px solid #ccc;
			}
		}
	}

	/* 规格选择弹窗 */
	.attr-content {
		padding: 10upx 30upx;

		.a-t {
			display: flex;

			image {
				width: 170upx;
				height: 170upx;
				flex-shrink: 0;
				margin-top: -40upx;
				border-radius: 8upx;
				;
			}

			.right {
				display: flex;
				flex-direction: column;
				padding-left: 24upx;
				font-size: $font-sm + 2upx;
				color: $font-color-base;
				line-height: 42upx;

				.price {
					font-size: $font-lg;
					color: $uni-color-primary;
					margin-bottom: 10upx;
				}

				.selected-text {
					margin-right: 10upx;
				}
			}
		}

		.attr-list {
			display: flex;
			flex-direction: column;
			font-size: $font-base + 2upx;
			color: $font-color-base;
			padding-top: 30upx;
			padding-left: 10upx;
		}

		.item-list {
			padding: 20upx 0 0;
			display: flex;
			flex-wrap: wrap;

			text {
				display: flex;
				align-items: center;
				justify-content: center;
				background: #eee;
				margin-right: 20upx;
				margin-bottom: 20upx;
				border-radius: 100upx;
				min-width: 60upx;
				height: 60upx;
				padding: 0 20upx;
				font-size: $font-base;
				color: $font-color-dark;
			}

			.selected {
				background: #fbebee;
				color: $uni-color-primary;
			}
		}
	}

	/*  弹出层 */
	.popup {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 99;

		&.show {
			display: block;

			.mask {
				animation: showPopup 0.2s linear both;
			}

			.layer {
				animation: showLayer 0.2s linear both;
			}
		}

		&.hide {
			.mask {
				animation: hidePopup 0.2s linear both;
			}

			.layer {
				animation: hideLayer 0.2s linear both;
			}
		}

		&.none {
			display: none;
		}

		.mask {
			position: fixed;
			top: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background-color: rgba(0, 0, 0, 0.4);
		}

		.layer {
			position: fixed;
			z-index: 99;
			bottom: 0;
			width: 100%;
			min-height: 40vh;
			border-radius: 10upx 10upx 0 0;
			background-color: #fff;

			.btn {
				height: 66upx;
				line-height: 66upx;
				border-radius: 100upx;
				background: $uni-color-primary;
				font-size: $font-base + 2upx;
				color: #fff;
				margin: 30upx auto 20upx;

			}
		}

		@keyframes showPopup {
			0% {
				opacity: 0;
			}

			100% {
				opacity: 1;
			}
		}

		@keyframes hidePopup {
			0% {
				opacity: 1;
			}

			100% {
				opacity: 0;
			}
		}

		@keyframes showLayer {
			0% {
				transform: translateY(120%);
			}

			100% {
				transform: translateY(0%);
			}
		}

		@keyframes hideLayer {
			0% {
				transform: translateY(0);
			}

			100% {
				transform: translateY(120%);
			}
		}
	}

	/* 底部操作菜单 */
	.page-bottom {
		position: fixed;
		left: 30upx;
		bottom: 30upx;
		z-index: 95;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 690upx;
		height: 100upx;
		background: rgba(255, 255, 255, .9);
		box-shadow: 0 0 20upx 0 rgba(0, 0, 0, .5);
		border-radius: 16upx;

		.p-b-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: $font-sm;
			color: $font-color-base;
			width: 96upx;
			height: 80upx;

			.yticon {
				font-size: 46upx;
				line-height: 48upx;
				color: $font-color-light;
			}

			&.active,
			&.active .yticon {
				color: $uni-color-primary;
			}
		}

		.action-btn-group {
			display: flex;
			height: 76upx;
			border-radius: 100px;
			overflow: hidden;
			box-shadow: 0 20upx 40upx -16upx #fa436a;
			box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
			background: linear-gradient(to right, #ffac30, #fa436a, #F56C6C);
			margin-left: 20upx;
			position: relative;

			&:after {
				content: '';
				position: absolute;
				top: 50%;
				right: 50%;
				transform: translateY(-50%);
				height: 28upx;
				width: 0;
				border-right: 1px solid rgba(255, 255, 255, .5);
			}

			.action-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 180upx;
				height: 100%;
				font-size: $font-base;
				padding: 0;
				border-radius: 0;
				background: transparent;
			}
		}
	}
	.flash {
		height: 100upx;
		background: linear-gradient(to right, #ffac30, #fa436a, #F56C6C);
		display: flex;
		flex-direction: row;
		position: relative;
		.sales_price{
			.symbol{
				font-size: 30upx;
				display: inline;
			}
			color: #fff;
			font-size: 50upx;
		}
		.left{
			font-size: 28upx;
			padding: 10upx;
			.market_price{
				color: #DCDFE6;
				text-decoration: line-through;
			}
			.sold{
				color: #E4E7ED;
			}
		}
		.right{
			height: 100%;
			width: 280upx;
			position: absolute;
			right: 0;
			padding: 4upx;
			margin-right: 20upx;
			.time{
				font-size: 30upx;
				color: #fffa30;
				text-align: center;
				.uni-countdown{
					display: inline-flex;
				}
			}
			.progress{
				position: absolute;
				bottom: 7rpx;
				right: 10upx;
			}
		}
	}
</style>
