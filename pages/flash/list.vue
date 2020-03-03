<template>
	<view class="content">
		<view class="navbar">
			<view 
				v-for="(item, index) in navList" :key="index" 
				class="nav-item" 
				:class="{current: tabCurrentIndex === index}"
				@click="tabClick(index)"
			>
				<view class="hour">
					<view>{{item.starttime_hour}}</view>
					<view class="text">{{state[item.state].text}}</view>
				</view>
			</view>
		</view>
		
		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<scroll-view
					class="list-scroll-content"
					scroll-y
					@scrolltolower="loadData"
				>
					<!-- 空白页 -->
					<empty v-if="tabItem.loaded === true && tabItem.list.length === 0"></empty>
				
					<!-- 产品列表 -->
					<view
						v-for="(item, index) in tabItem.list" :key="index"
						class="order-item"
					>
						<view class="info"  @click="navToDetailPage(item.product.product_id, tabItem.flash_id)">
							<view class="image">
								<image mode="aspectFill" :src="$cdn + item.product.image"></image>
							</view>
							<view class="detail">
								<view class="title">{{item.product.title}}</view>
								<view class="introduction">{{item.introduction}}</view>
								<view class="price">
									<view class="sales">￥{{item.product.sales_price}} </view>
									<view class="market"> ￥{{item.product.market_price}}</view>
								</view>
								<ProgressBar class="ProgressBar" :Sold="item.sold" :widthUpx="250" :Width="percentage(item.number,item.sold)" Type="candy" :Vice="true"></ProgressBar>
								<view class="loot">{{tabItem.state > 0 ? "马上抢" : "未开始"}}</view>
							</view>
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
	import ProgressBar from '@/components/Progress-Bar/Progress-Bar';
	
	export default {
		components: {
			uniLoadMore,
			empty,
			ProgressBar
		},
		data() {
			return {
				pageSize: 15,
				tabCurrentIndex: 0,
				navList: [],
				state: [{
					text: '未开始'
				},{
					text: '已开抢'
				},{
					text: '抢购进行中'
				}]
			}
		},
		onLoad(options){
			this.loadNavBar();
		},
		methods: {
			// 加载标签
			async loadNavBar() {
				let navbar = await this.$api.request('/flash/navbar', 'GET');
				if (navbar) {
					this.navList = navbar;
					this.navList.forEach((item, index)=>{
						item = Object.assign(item, {list: [], page:1, loadingType:'more'}); //新增一个数组用来储存商品
						if (item.current) {
							this.tabCurrentIndex = index;
						}
						// 建议把后端处理的starttime_hour和text字段在这里用js处理
					});
					this.loadData('tabChange', this.navList[this.tabCurrentIndex].flash_id);
					this.setNavigationBarTitle(this.navList[this.tabCurrentIndex].title);
					//console.log(this.navList);
				}
			},
			// 加载数据
			async loadData(source = false, flash_id = 0) {
				//这里是将订单挂载到tab列表下
				let index = this.tabCurrentIndex;
				let navItem = this.navList[index];
				
				if(source === 'tabChange' && navItem.loaded === true){
					//tab切换只有第一次需要加载数据
					return;
				}
				if(navItem.loadingType === 'loading'){
					//防止重复加载
					return;
				}
				if (navItem.loadingType == 'noMore') {
					//没有更多数据
					return;
				}
				
				navItem.loadingType = 'loading';
				
				let result = await this.$api.request('/flash/product', 'GET', {flash_id: flash_id, page: navItem.page, pagesize: this.pageSize});
				if (result) {
					if (result.length >= this.pageSize) {
						//判断是否还有数据， 有改为 more， 没有改为noMore
						navItem.loadingType = 'more';
					} else {
						navItem.loadingType = 'noMore';
					}
					// 页数加一
					navItem.page++;
					
					result.forEach((item, index)=>{
						navItem.list.push(item);
					})
					//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
					this.$set(navItem, 'loaded', true);
				}
			},
			//顶部tab点击
			tabClick(index){
				this.tabCurrentIndex = index;
			},
			//swiper 切换
			changeTab(e){
				this.tabCurrentIndex = e.target.current;
				this.loadData('tabChange', this.navList[this.tabCurrentIndex].flash_id);
				this.setNavigationBarTitle(this.navList[this.tabCurrentIndex].title);
				
			},
			// 计算百分比
			percentage(number, sold) {
				if (sold == 0) {
					return 0;
				}
				return parseInt(sold / number * 100);
			},
			// 商品详情页
			navToDetailPage(product_id, flash_id = 0) {
				uni.navigateTo({
					url: `/pages/product/product?id=${product_id}&flash=${flash_id}`
				});
			},
			// 设置导航栏名称
			setNavigationBarTitle(title) {
				uni.setNavigationBarTitle({
				    title: '限时秒杀|' + title
				});
			}
			
		}
	}
</script>

<style lang="scss">
	page, .content{
		//background: $page-color-base;
		background: #f5f5f5;
		height: 100%;
	}
	.swiper-box{
		height: calc(100% - 50px);
	}
	.list-scroll-content{
		height: 100%;
	}
	.navbar{
		display: flex;
		height: 50px;
		padding: 0 5px;
		background: #000;
		box-shadow: 0 1px 5px rgba(0,0,0,.06);
		position: relative;
		z-index: 10;
		overflow: auto;
		.nav-item{
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 15px;
			//color: $font-color-dark;
			color: #fff;
			font-weight: 900;
			position: relative;
			text-align: center;
			min-width: 150upx;
			.hour{
				flex-flow: column;
				display: flex;
				.text{
					font-size: 10px;
					font-weight: 400;
				}
			}
			&.current{
				//color: $base-color;
				background-color: $base-color;
				&:after{
					content: '';
					position: absolute;
					//left: 50%;
					bottom: -10upx;
					//transform: translateX(-50%);
					transform: rotate(45deg);
					//width: 44px;
					width: 20upx;
					//height: 0;
					height: 20upx;
					background-color: $base-color;
					//border-bottom: 2px solid $base-color;
				}
			}
		}
	}
	.order-item{
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-top: 16upx;
	
		.info {
			display: flex;
			flex-direction: row;
			.image{
				image {
					width: 250upx;
					height: 250upx;
					border-radius: 10upx;
				}
			}
			.detail {
				width: 440upx;
				height: 250upx;
				padding-left: 30upx;
				padding-top: 6upx;
				position: relative;
				.title{
					color: #303133;
				}
				.introduction{
					color: #999999;
					font-size: 26upx;
				}
				.price{
					position: absolute;
					bottom: 56upx;
					display: flex;
					flex-direction: row;
					.sales{
						font-size: 40upx;
						color: $base-color;
						font-weight: 500;
					}
					.market{
						vertical-align: bottom;
						font-size: 25upx;
						text-decoration: line-through;
					}
				}
				.ProgressBar{
					position: absolute;
					bottom: 0;
				}
				.loot{
					position: absolute;
					right: 0;
				    bottom: 14rpx;
				    background: $base-color;
				    color: #fff;
				    padding: 4upx 14upx;
				    border-radius: 4upx;
				    box-shadow: 2upx 2upx 8upx -2px #000;
					font-size: 32rpx;
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
