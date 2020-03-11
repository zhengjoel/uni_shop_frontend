import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		userInfo: {
			token: ''
		},
		cdn: 'http://t.fastadmin.com:8888',
		lang: 'zh-cn',
		cookie: ''
	}, 
	mutations: {
		login(state, provider) {
			state.hasLogin = true;
			state.userInfo = provider;
			uni.setStorage({ //缓存用户信息
			    key: 'userInfo',  
			    data: provider  
			});
		},
		logout(state) {
			state.hasLogin = false;
			state.userInfo = {};
			uni.removeStorage({  
                key: 'userInfo'  
            });
		},
		serUserInfo(state, provider) {
			state.userInfo = provider;
			uni.setStorage({//缓存用户信息
			    key: 'userInfo',  
			    data: provider  
			});
		},
		setCookie(state, provider) {
			state.cookie = provider;
			uni.setStorage({
				key: 'cookieKey',
				data: provider
			});
		}
	},
	actions: {
	
	}
})

export default store
