<script>
	/**
	 * vuex管理登陆状态，具体可以参考官方登陆模板示例
	 */
	import {
		mapMutations,
		mapState
	} from 'vuex';
	export default {
		methods: {
			...mapMutations(['login', 'logout', 'serUserInfo']),
			// #ifdef H5
			// 检查登录状态
			async checkLogin() {
				let user = uni.getStorageSync('userInfo');
				if (user) {
					this.login(user);
				}
				let result = await this.$api.request('/user/status');
				if (!result) {
					// 若没有登录则清空个人信息
					this.logout();
				}
			},
			// #endif
			// #ifdef MP-WEIXIN
			// 微信小程序
			wechatMiniLogin() {
				let that = this;
				uni.login({
					provider: 'weixin',
					success: async function (loginRes) {
						//console.log(loginRes)
						if (loginRes.hasOwnProperty('code')) {
							let data = await that.$api.request('/user/authSession', 'GET', {code:loginRes.code});
							if (data) {
								if (data.hasOwnProperty('userInfo') && data.userInfo.token != '') {
									that.login(data.userInfo)
								}
							}
						}
						//wx.setStorageSync("cookieKey", response.header['Set-Cookie'].replace("; path=/", ""));
					},
					fail: function() {
						this.$api.msg('自动登录失败');
					}
				});
			},
			// #endif
		},
		onLaunch: function() {
			// 锁定屏幕竖向
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('portrait-primary');
			// #endif
			
			// 检查用户登录情况
			// #ifdef H5
			this.checkLogin();
			// #endif
			// #ifdef MP-WEIXIN
			this.wechatMiniLogin();
			// #endif
		
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
	}
</script>

<style lang='scss'>
	/* project id 1729059 */
	@font-face {
	  font-family: 'unishop';  
	  font-weight: normal;
	  font-style: normal;
	  src: url('//at.alicdn.com/t/font_1729059_udfm4nnyhc.ttf') format('truetype');
	}
	
	.yticon {
		font-family: "unishop" !important;
		font-size: 16px;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	
	.icon-jiahao:before{
		content: "\e616";
	}
	
	.icon-jianhao:before{
		content: "\e617";
	}
	
	.icon-wxpay:before{
		content: "\e607";
	}
	
	.icon-pay:before{
		content: "\e624";
	}
	
	.icon-alipay:before{
		content: "\e60b";
	}
	
	.icon-you:before{
		content: "\e65f";
	}
	
	.icon-huoche:before{
		content: "\e6f0";
	}
	
	.icon-shoucang:before{
		content: "\e60a";
	}
	
	.icon-gouwuche:before{
		content: "\e60e";
	}
	
	.icon-fangzi:before{
		content: "\e657";
	}
	
	.icon-daifukuan:before{
		content: "\e601";
	}
	
	.icon-daifahuo:before{
		content: "\e704";
	}
	
	.icon-daishouhuo:before{
		content: "\e633";
	}
	
	.icon-pingjia:before{
		content: "\e61d";
	}
	
	.icon-shouhou:before{
		content:"\e610";
	}
	
	.icon-shoucang-setting:before{
		content:"\e612";
	}
	
	.icon-setting:before{
		content:"\e62b";
	}
	
	.icon-dizhi:before{
		content: "\e67c";
	}
	
	.icon-lajitong:before{
		content: "\e615";
	}

	view,
	scroll-view,
	swiper,
	swiper-item,
	cover-view,
	cover-image,
	icon,
	text,
	rich-text,
	progress,
	button,
	checkbox,
	form,
	input,
	label,
	radio,
	slider,
	switch,
	textarea,
	navigator,
	audio,
	camera,
	image,
	video {
		box-sizing: border-box;
	}
	/* 骨架屏替代方案 */
	.Skeleton {
		background: #f3f3f3;
		padding: 20upx 0;
		border-radius: 8upx;
	}

	/* 图片载入替代方案 */
	.image-wrapper {
		font-size: 0;
		background: #f3f3f3;
		border-radius: 4px;

		image {
			width: 100%;
			height: 100%;
			transition: .6s;
			opacity: 0;

			&.loaded {
				opacity: 1;
			}
		}
	}

	.clamp {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	.common-hover {
		background: #f5f5f5;
	}

	/*边框*/
	.b-b:after,
	.b-t:after {
		position: absolute;
		z-index: 3;
		left: 0;
		right: 0;
		height: 0;
		content: '';
		transform: scaleY(.5);
		border-bottom: 1px solid $border-color-base;
	}

	.b-b:after {
		bottom: 0;
	}

	.b-t:after {
		top: 0;
	}

	/* button样式改写 */
	uni-button,
	button {
		height: 80upx;
		line-height: 80upx;
		font-size: $font-lg + 2upx;
		font-weight: normal;

		&.no-border:before,
		&.no-border:after {
			border: 0;
		}
	}

	uni-button[type=default],
	button[type=default] {
		color: $font-color-dark;
	}

	/* input 样式 */
	.input-placeholder {
		color: #999999;
	}

	.placeholder {
		color: #999999;
	}
</style>
