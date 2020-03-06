import Vue from 'vue'
import store from './store'
import App from './App'

const msg = (title, duration = 3000, mask = false, icon = 'none') => {
	//统一提示方便全局修改
	if (Boolean(title) === false) {
		return;
	}
	uni.showToast({
		title,
		duration,
		mask,
		icon
	});
	setTimeout(function(){
		uni.hideToast();
	},duration)
}


const prePage = () => {
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}

//检查有没有登录
const checkLogin = () => {
	return new Promise(resolve => {
		if (Vue.prototype.$store.state.hasLogin == false) {
			uni.showModal({
				title: '温馨提示',
				content: '你还没，请先登录',
				success(res) {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/public/login'
						})
					}
					resolve(false);
				}
			})
		} else {
			resolve(true);
		}
	});
}

//深拷贝
const deepCopy = (p, c) => {
	var c = c || {};
	for (var i in p) {
		if (typeof p[i] === "object") {
			c[i] = (p[i].constructor === Array) ? [] : {};
			deepCopy(p[i], c[i])
		} else {
			c[i] = p[i]
		}
	}
	return c;
}


//同步网络请求
const request = (url, method = 'GET', data = {}) => {
	let header = {
		'content-type': 'application/x-www-form-urlencoded',
	};
	if (Vue.prototype.$store.state.userInfo.token) {
		let token = Vue.prototype.$store.state.userInfo.token;
		header.token = token;
	}
	header.platform = Vue.prototype.$platform;
	return new Promise(resolve => {
		msg('加载中...')
		uni.request({
			url: Vue.prototype.$unishow + url,
			method: method,
			header: header,
			data: data,
			success(res) {
				//console.log(res);
				if (res.hasOwnProperty('data')) {
					if (res.data.hasOwnProperty('code') && res.data.code == 1) {
						if (res.data.msg) {
							msg(res.data.msg);
						} else {
							uni.hideToast();
						}
						resolve(res.data.data);
					} else {
						if (res.data.hasOwnProperty('msg')) {
							msg(res.data.msg);
						} else {
							msg('返回参数错误');
						}
						resolve(false);
					}
				} else {
					msg('不能识别数据');
					resolve(false);
				}
			},
			fail(res) {
				msg('网络错误');
				resolve(false);
			}
		})
	})
}

Vue.config.productionTip = false
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {
	msg,
	prePage,
	checkLogin,
	request,
	deepCopy
};
Vue.prototype.$site = "http://t.fastadmin.com:8888";
Vue.prototype.$cdn = "http://t.fastadmin.com:8888"; // 图片路径
Vue.prototype.$unishow = "http://t.fastadmin.com:8888/addons/unishop";

// 目前平台
// #ifdef APP-PLUS
Vue.prototype.$platform = 'APP-PLUS';
// #endif
// #ifdef H5
Vue.prototype.$platform = 'H5';
// #endif
// #ifdef MP-WEIXIN
Vue.prototype.$platform = 'MP-WEIXIN';
// #endif
// #ifdef MP-ALIPAY
Vue.prototype.$platform = 'MP-ALIPAY';
// #endif
// #ifdef MP-BAIDU
Vue.prototype.$platform = 'MP-BAIDU';
// #endif
// #ifdef MP-TOUTIAO
Vue.prototype.$platform = 'MP-TOUTIAO';
// #endif


App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
