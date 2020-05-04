import Vue from 'vue'
import store from './store'
import App from './App'

// 后端api地址
Vue.prototype.$unishow = "http://unishop:8888/addons/unishop";
//Vue.prototype.$unishow = "http://t.fastadmin-ceshi.com:8888/addons/unishop";
//Vue.prototype.$unishow = "http://shop.weivee.com/addons/unishop";

// 为了方便每次上传的时候忘记修改上面的参数
uni.getSystemInfo({
	success(res) { 
		//console.log(res)
		if (res.platform != "devtools") {
			Vue.prototype.$unishow = "https://shop.weivee.com/addons/unishop";
		}
	}
})



// 平台号
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


// 提示
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
	setTimeout(function() {
		uni.hideToast();
	}, duration)
}

// 返回上一页
const prePage = () => {
	let pages = getCurrentPages();
	let prePage = pages[pages.length - 2];
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}

// 检查有没有登录
const checkLogin = () => {
	return new Promise(resolve => {
		if (Vue.prototype.$store.state.hasLogin == false) {
			uni.showModal({
				title: '温馨提示',
				content: '你还没，请先登录',
				success(res) {
					if (res.confirm) {
						// 账户秘密登录
						let url = '/pages/public/login';
						uni.navigateTo({
							url: url
						});
					}
					resolve(false);
				}
			})
		} else {
			resolve(true);
		}
	});
}

// 深拷贝
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

// 同步网络请求
const request = async (url, method = 'GET', data = {}, showMsg = true) => {
	let header = {
		'content-type': 'application/x-www-form-urlencoded',
		'lang': Vue.prototype.$store.state.lang,
		'platform': Vue.prototype.$platform
	};
	if (Vue.prototype.$store.state.userInfo.token) {
		header.token = Vue.prototype.$store.state.userInfo.token;
	}
	if (Vue.prototype.$store.state.cookie) {
		header.cookie = Vue.prototype.$store.state.cookie;
	}
	var [error, res] = await uni.request({
		url: Vue.prototype.$unishow + url,
		method: method,
		header: header,
		data: data,
		timeout: 5000
	});
	
	return new Promise(function(revolve){
		if (error) {
			showMsg && msg(JSON.stringify(res));
			revolve(false);
		}
		
		if (res) {
			if (res.header.hasOwnProperty('Set-Cookie')) {
				let cookie = res.header['Set-Cookie'].replace("; path=/", "");
				Vue.prototype.$store.commit('setCookie', cookie);
			}
			if (res.hasOwnProperty('data')) {
				if (res.data.hasOwnProperty('code') && res.data.code == 401) {
					// 未登录 或 登录失效
					Vue.prototype.$store.commit('logout');
				}
				if (res.data.hasOwnProperty('code') && res.data.code == 1) {
					if (res.data.msg) {
						showMsg && msg(res.data.msg);
					} else {
						uni.hideToast();
					}
					
					revolve(res.data.data);
				} else {
					if (res.data.hasOwnProperty('msg')) {
						showMsg && msg(res.data.msg);
					} else {
						showMsg && msg('返回参数错误');
					}
					revolve(false);
				}
			} else {
				showMsg && msg('不能识别数据');
				revolve(false);
			}
		}
	});
	
}

// 跳转判断是否登录
const navTo = (url, check = true) => {
	if (check && !Vue.prototype.$store.state.hasLogin) {
		url = '/pages/public/login';
	}
	uni.navigateTo({
		url: url
	});
}

Vue.config.productionTip = false
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {
	msg,
	prePage,
	checkLogin,
	request,
	deepCopy,
	navTo
};

// #ifdef MP-WEIXIN
// 微信小程序
const wechatMiniLogin = async () => {
	msg('登录中');
	let [error, loginRes] = await uni.login({
		provider: 'weixin'
	});
	if (loginRes.hasOwnProperty('code')) {
		let data = await request('/user/authSession', 'GET', {
			code: loginRes.code
		});
		if (data) {
			if (data.hasOwnProperty('userInfo') && data.userInfo.token && data.userInfo.token != '') {
				Vue.prototype.$store.commit('login', data.userInfo);
				//Vue.prototype.$store.mutations.login(data.userInfo)
			}
		}
		return true;
	} else {
		msg('登录失败');
		return false;
	}
};
Vue.prototype.$wechatMiniLogin = wechatMiniLogin;
// #endif

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
