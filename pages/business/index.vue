<template>
	<view class="container">
		<image class="bg" mode="aspectFill" src="/static/bg.jpg"></image>
		
		<view class="business">
			
			<view class="title">
				<view>喂喂官方商城</view>
				<view class="star">综合体验
					<uni-rate class="start" active-color="#F56C6C" margin="-2" size="10" :value="4"></uni-rate>
				</view>
				<view class="star">粉丝量2999</view>
			</view>
			<view class="button">
				<view class="btn1" @click="like">关注</view>
			</view>
			
		</view>
		
		<view class="guess-section">
			<view v-for="(item, index) in goodsList" :key="index" class="guess-item" @click="navToDetailPage(item)">
				<view class="image-wrapper">
					<image :src="item.image" mode="aspectFill"></image>
				</view>
				<text class="title clamp">{{ item.title }}</text>
				<text class="price"><text class="symbol">￥</text> {{ item.sales_price }} <text class="sales"> {{' '+item.sales}}人付款</text></text>
			</view>
		</view>
	</view>
</template>

<script>
	import uniRate from '@/components/uni-rate/uni-rate.vue';
	export default {
		components: {
			uniRate
		},
		data() {
			return {
				goodsList: [],
				page:1
			}
		},
		onLoad(){
			this.getProduct();
		},
		methods:{
			// 获取产品列表
			async getProduct() {
				let goodsList = await this.$api.request('/product/lists', 'GET', {page:this.page, pagesize:this.pageSize});
				if (goodsList) {
					if (goodsList.length > 0) {
						goodsList.forEach(item=>{
							this.goodsList.push(item);
						});
						this.page++;
					} else {
						this.$api.msg('没有更多数据');
					}
				}
			}
		}
	}
</script>

<style lang='scss'>
	.container {
		background: #d8d8d8;
	}

	.bg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 300upx;
		filter: blur(1px);
		opacity: .6;
	}

	.business {
		position:relative;
		
		text-align: center;
		padding: 30upx;

		.title {
			font-size: 30upx;
			display: inline-block;
			vertical-align: top;

			.star {
				font-size: 24upx;
				/* background: #c9c8cb; */
				color: #ffffff;
				padding: 4upx 8upx;
				border-radius: 20upx;
				line-height: 20upx;
				font-weight: 600;
				.start {
					display: inline-block;
				}

				margin-right: 6upx;
				display: inline-block;
			}
		}

		.button {
			display: inline-block;
			font-size: 27upx;
			line-height: 90upx;
			/* float: right; */

			.btn1 {
				display: inline-block;
				border-radius: 30upx;
				border: 1upx solid #ffac30;
				color: #F56C6C;
				padding: 10upx 20upx;
				margin-right: 10upx;
				line-height: 30upx;
				background: #ffffff;
			}
		}
	}

	/* 猜你喜欢 */
	.guess-section {
		display: flex;
		flex-wrap: wrap;
		padding: 0 30upx;
		background: #fff;
		.guess-item {
			display: flex;
			flex-direction: column;
			width: 48%;
			padding-bottom: 40upx;
			&:nth-child(2n + 1) {
				margin-right: 4%;
			}
		}
		.image-wrapper {
			width: 100%;
			height: 330upx;
			border-radius: 3px;
			overflow: hidden;
			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}
		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 80upx;
		}
		.price {
			font-size: $font-lg;
			color: $uni-color-primary;
			line-height: 1;
			.sales{
				color: #999999;
				font-size: 24upx;
			}
			.symbol{
				font-size: 24upx;
			}
		}
	}
</style>
