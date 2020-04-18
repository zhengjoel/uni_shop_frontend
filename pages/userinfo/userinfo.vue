<template>
	<view>
		<view class="user-section">
			<image class="bg" src="/static/user-bg.jpg"></image>
			<text class="bg-upload-btn yticon icon-paizhao"></text>
			<view class="portrait-box">
				<image class="portrait" :src="avatar ? avatar : '/static/missing-face.png'"></image>
				<text class="pt-upload-btn yticon icon-paizhao"></text>
				<button class="button" open-type="getUserInfo" @getuserinfo="getAvatar"></button>
			</view>
		</view>

		<!-- #ifdef MP-WEIXIN -->
		<view class="yt-list-cell">
			<view class="cell-tit clamp">用户名
				<input v-if="username" class="input" type="text" v-model="username" />
				<button v-else class="input" open-type="getUserInfo" @getuserinfo="getUserInfo">授权获取微信用户名称</button>
			</view>
		</view>
		<view class="yt-list-cell">
			<view class="cell-tit clamp">手机号码
				<input v-if="mobile" disabled="true" class="input" type="text" v-model="mobile" />
				<button v-else class="input" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">授权获取微信绑定的手机号码</button>
			</view>
		</view>
		<!-- #endif -->

		<view class="yt-list-cell">
			<button type="primary" @click="submit">提交保存</button>
		</view>

	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				username: '',
				mobile: '',
				avatar: ''
			};
		},
		computed: {
			...mapState(['userInfo'])
		},
		onLoad() {
			this.username = this.userInfo.username;
			this.mobile = this.userInfo.mobile;
			this.avatar = this.userInfo.avatar ? this.userInfo.avatar : '';
		},
		methods: {
			...mapMutations(['setUserInfo']),
			getAvatar(e) {
				this.avatar = e.detail.userInfo.avatarUrl;
			},
			getUserInfo(e) {
				this.username = e.detail.userInfo.nickName;
			},
			async getPhoneNumber(e) {
				let data = await this.$api.request('/user/decryptData', 'POST',{
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv
				});
				if (data) {
					this.mobile = data.phoneNumber;
				}
			},
			async submit(){
				if (this.username == '') {
					this.$api.msg('用户名称不能为空');
					return;
				}
				if (this.username == this.userInfo.username 
				&& this.mobile == this.userInfo.mobile 
				&& this.avatar == this.userInfo.avatar) {
					this.$api.msg('已修复');
					return;
				}
				let data = await this.$api.request('/user/edit', 'POST', {
					username : this.username,
					mobile : this.mobile,
					avatar : this.avatar
				});
				if (data) {
					let userInfo = this.userInfo;
					userInfo.username = this.username;
					userInfo.mobile = this.mobile;
					userInfo.avatar = this.avatar;
					this.setUserInfo(userInfo);
				}
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.user-section {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 460upx;
		padding: 40upx 30upx 0;
		position: relative;

		.bg {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			filter: blur(1px);
			opacity: .7;
		}

		.portrait-box {
			width: 200upx;
			height: 200upx;
			border: 6upx solid #fff;
			border-radius: 50%;
			position: relative;
			z-index: 2;
			
			.button{
				position: absolute;
				width: 100%;
				height: 100%;
				top: 0;
				opacity: 0;
			}
		}

		.portrait {
			position: relative;
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}

		.yticon {
			position: absolute;
			line-height: 1;
			z-index: 5;
			font-size: 48upx;
			color: #fff;
			padding: 4upx 6upx;
			border-radius: 6upx;
			background: rgba(0, 0, 0, .4);
		}

		.pt-upload-btn {
			right: 0;
			bottom: 10upx;
		}

		.bg-upload-btn {
			right: 20upx;
			bottom: 16upx;
		}
	}


	.yt-list-cell {
		margin-top: 16rpx;
		background: #fff;
		display: flex;
		align-items: center;
		padding: 10rpx 30rpx;
		line-height: 70rpx;
		position: relative;

		.cell-tit {
			flex: 1;
			font-size: 26rpx;
			color: #000000;
			margin-right: 10rpx;

			.input {
				display: inline-block;
				vertical-align: middle;
				margin-left: 20rpx;
				width: 550rpx;
				float: right;
				line-height: 70rpx!important;
				height: 70rpx!important;
			}
			button{
				
			}
		}
	}
</style>
