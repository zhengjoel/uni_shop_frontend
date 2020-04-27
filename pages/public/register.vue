<template>
	<view class="container">
		<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
		
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="left-top-sign">{{desc}}</view>
			<view class="welcome">
				{{desc}}
			</view>
			<view class="input-content">
				<view class="input-item" v-if="event == 'register'">
					<text class="tit">用户名</text>
					<input 
						type="text" 
						:value="username" 
						placeholder="请输入用户名"
						data-key="username"
						@input="inputChange"
					/>
				</view>
				<view class="input-item">
					<text class="tit">手机号码</text>
					<input 
						type="number" 
						:value="mobile" 
						placeholder="请输入手机号码"
						data-key="mobile"
						@input="inputChange"
					/>
				</view>
				<view class="input-item">
					<text class="tit">密码</text>
					<input 
						type="text" 
						value="" 
						placeholder="6-18位不含特殊字符的数字、字母组合"
						placeholder-class="input-empty"
						maxlength="20"
						password 
						data-key="password"
						@confirm="toLogin"
						@input="inputChange"
					/>
				</view>
				<view class="input-item">
					<text class="tit">验证码</text>
					<input 
						type="text" 
						:value="captcha" 
						placeholder="请输入验证码"
						data-key="captcha"
						@input="inputChange"
					/>
					<button class="get_captcha" @click="getCaptcha">{{get_captcha}}</button>
				</view>
			</view>
			<button class="confirm-btn" @click="toLogin" :disabled="logining">
				{{status}}
			</button>
			<view class="forget-section">

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
				username: '',
				mobile: '',
				password: '',
				captcha:'',
				logining: false,
				status: '',
				desc: '',
				get_captcha: '获取验证码',
				event: ''
			}
		},
		onLoad(options){
			if(options.event == 'register'){
				this.status = '立即注册';
				this.desc = '注册账号'
			}else{
				this.status = '确认修改';
				this.desc = '修改密码'
			}
			this.event = options.event;
		},
		methods: {
			...mapMutations(['login']),
			async getCaptcha(){
				let that = this;
				let num = 60;
				
				if (this.mobile == '') {
					this.$api.msg('请输入手机号码');
					return;
				}
				
				let data = await this.$api.request('/sms/send', 'POST', {
					mobile: this.mobile,
					event: this.event
				});
				if (data) {
					that.get_captcha = num + ' S';
					let intervalId = setInterval(function(){
						num--;
						that.get_captcha = num + ' S';
						if (num == 0) {
							that.get_captcha = '获取验证码'
							clearInterval(intervalId);
						}
					}, 1000);
				}
				
			},
			navBack(){
				uni.navigateBack();
			},
			inputChange (e) {
				const key = e.currentTarget.dataset.key;
				this[key] = e.detail.value;
			},
			async toLogin(){
				this.logining = true; // 按钮锁
				
				
				let data =  await this.$api.request('/user/register', 'POST', {
					mobile: this.mobile,
					password: this.password,
					username: this.username,
					captcha: this.captcha,
					event: this.event
				});
				if (data) {
					this.login(data.userinfo);
					uni.navigateBack(); 
				} else {
					this.logining = false;
				}
			},
			forget(){
				uni.navigateTo({
					url:'./forget'
				})
			},
			register(){
				uni.navigateTo({
					url:'./forget'
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
		padding-top: 80rpx;
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
		position: relative;
		&:last-child{
			margin-bottom: 0;
		}
		.tit{
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm+2upx;
			color: $font-color-base;
		}
		input{
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}
		.get_captcha {
			position: absolute;
			right: 0;
			display: block;
			width: 40%;
			background: $uni-color-primary;
			color: #fff;
			text-align: center;
			line-height: 76upx;
			border-radius: 50upx;
		}
	}

	.confirm-btn{
		width: 630upx;
		height: 76upx;
		line-height: 76upx;
		border-radius: 50px;
		margin-top: 70upx;
		background: $uni-color-primary;
		color: #fff;
		font-size: $font-lg;
		&:after{
			border-radius: 100px;
		}
	}
	.forget-section{
		font-size: $font-sm+10upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 100upx;
		label{
			margin: 10upx 60upx;
		}
	}
	.register-section{
		position:absolute;
		left: 0;
		bottom: 50upx;
		width: 100%;
		font-size: $font-sm+2upx;
		color: $font-color-base;
		text-align: center;
		text{
			color: $font-color-spec;
			margin-left: 10upx;
		}
	}
	
</style>
