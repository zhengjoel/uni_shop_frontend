<template>
	<view>
		<!-- 评价 -->
		<view class="eva-section">
			<view class="eva-box" v-for="(item, index) in list" :key="index">
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
	</view>
</template>

<script>

	export default{
		data(){
			return {
				product_id: 0,
				page:1,
				pageSize:20,
				list:[]
			}
		},
		onLoad(options){
			this.product_id = options.product_id;
			this.getEvaluete();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.list = [];
			this.getEvaluete();
		},
		onReachBottom() {
			this.getEvaluete();
		},
		methods:{
			async getEvaluete(){
				let comment = await this.$api.request('/product/evaluate', 'GET', {product_id:this.product_id,page:this.page,pagesize:this.pageSize});
				uni.stopPullDownRefresh();
				if (comment) {
					this.page++;
					comment.forEach(item=>{
						this.list.push(item);
					});
				}
			}
		}
	}
</script>

<style lang='scss'>
	/* 评价 */
	.eva-section {
		display: flex;
		flex-direction: column;
		padding: 20upx 30upx;
		background: #fff;
		margin-top: 16upx;
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
</style>
