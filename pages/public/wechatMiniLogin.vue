<template>
	<view class="container">
		
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="left-top-sign">LOGIN</view>
			<view class="welcome">
				欢迎使用uni商城！
			</view>
			<view class="input-content">
				<view class="input-item">
					
					<text class="tit">获取基础授权</text>
				</view>
				<view class="input-item">
					
					<text class="tit">获取授权手机号</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {  
        mapMutations  
    } from 'vuex';
	
	export default{
		data(){
			return {
				mobile: '',
				password: '',
				logining: false
			}
		},
		onLoad(){
			
		},
		methods: {
			...mapMutations(['login']),
			
			navBack() {
				uni.navigateBack();
			},
			async toLogin(){
				this.logining = true;
				const {mobile, password} = this;
				const account = mobile;
				const sendData = {
					account,
					password
				};
				let res = await this.$api.request('/user/login', 'POST', sendData)
				if (res) {
					this.login(res.userinfo);
					this.logining = true;
					uni.navigateBack();
				} else {
					this.logining = false;
				}
				
			},
			register(action){
				uni.navigateTo({
					url:'./register?action='+action
				})
			}
		},

	}
</script>

<style lang='scss'>
	page{
		background: #fff;
	}
	.container{
		padding-top: 115px;
		position:relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #fff;
	}
	.wrapper{
		position:relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;
	}
	.back-btn{
		position:absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}
	.left-top-sign{
		font-size: 120upx;
		color: $page-color-base;
		position:relative;
		left: -16upx;
	}
	.welcome{
		position:relative;
		left: 50upx;
		top: -90upx;
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0,0,0,.3);
	}
	.input-content{
		padding: 0 60upx;
	}
	.input-item{
		display:flex;
		flex-direction: column;
		align-items:flex-start;
		justify-content: center;
		padding: 0 30upx;
		background:$page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;
		&:last-child{
			margin-bottom: 0;
		}
		.tit{
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+20upx;
			color: $font-color-base;
		}
	}
</style>
