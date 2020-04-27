<template>
	<view class="bg">
		<view class="header">
			<image class="image" :src="image"></image>
			<view class="right">
				<view class="title">{{title}}</view>
				<view class="spec">{{spec}}</view>
			</view>
		</view>
		<view class="rate">
			<view class="dec">描述相符</view>
			<!-- 自定义星星大小 -->
			<uni-rate class="start" active-color="#e64340" margin="10" size="30" :value="rate" @change="start"></uni-rate>
		</view>
		<view class="comment">
			<textarea @input="input" maxlength="300" placeholder="写满20字,有机会被选为优质评价被更多人看到哦~" placeholder-class="placeholder"></textarea>
		</view>
		<view class="bottom">
			<radio class="radio" color="#e64340" :checked='radio' @click="clickRadio" />公开</radio>
			<view class="dec">公开头像昵称,大家可以看到我</view>
		</view>
		<button class="button" @click="submit" type="warn">提交</button>
	</view>
</template>

<script>
	import uniRate from '@/components/uni-rate/uni-rate.vue'

	export default{
		computed:{

		},
		components: {
			uniRate
		},
		data(){
			return {
				order_id:0,
				product_id:0,
				title:'',
				image:'',
				spec:'',
				rate:5,
				radio:true,
				textarea:''
			}
		},
		onLoad(options) {
			this.title = options.title;
			this.image = options.image;
			this.spec = options.spec;
			this.order_id = options.order_id;
			this.product_id = options.product_id;
		},
		methods:{
			// 星星
			start(e) {
				this.rate = e.value;
				switch (this.rate) {
					case 3:
						this.radio = false;
						break;
					case 5:
						this.radio = true;
						break;
				}
			},
			// 单选
			clickRadio(e) {
				this.radio = !this.radio;
			},
			// 输入事件
			input(e) {
				this.textarea = e.detail.value;
			},
			// 提交
			async submit(){
				let data = this.$api.request('/order/comment', 'POST', 
				{
					order_id:this.order_id,
					product_id:this.product_id,
					rate:this.rate,
					anonymous:!this.radio ? 1: 0,
					comment:this.textarea,
				});
				if (data) {
					let prePage = this.$api.prePage()
					if (prePage.tabCurrentIndex) {
						prePage.tabCurrentIndex = 0;
					}
					let that = this;
					setTimeout(function(){
						prePage.pullDownRefresh();
						uni.navigateBack();
					},2000)
				}
			}
		}
	}
</script>

<style lang="scss">
	page{
		background: #f5f5f5;
	}
	.bg{
		margin: 20rpx;
		border-radius: 20rpx;
		background-color: #ffffff;
		padding-bottom: 10rpx;
	}
	.header {
		padding: 20rpx;
		.image{
			width: 120rpx;
			height: 120rpx;
		}
		.right{
			display: inline-block;
			line-height: 45rpx;
			vertical-align: text-bottom;
			padding-bottom: 10rpx; 
			width: 550rpx;
			padding-left:20rpx;
			.title{
				color: #707277;
				font-size: 33rpx;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
			.spec{
				color: #91949a;
				font-size: 30rpx;
			}
		}
	}
	.rate{
		padding:0 20rpx 20rpx;
		.dec{
			display: inline-block;
			color: #707277;
		}
		.start{
			width: 400rpx;
			display: inline-block;

		}
	}
	.comment{
		padding: 20rpx;
		textarea{
			padding: 30rpx;
			background-color: #f5f5f5;
			width: 100%;
		}
	}
	.bottom{
		padding: 20rpx 20rpx 40rpx;
		.radio{
			vertical-align: bottom;
			float: left;
		}
		.dec{
			color: #91949a;
			float: right;
		}
	}
	.button{
		margin: 20rpx;
	}
</style>
