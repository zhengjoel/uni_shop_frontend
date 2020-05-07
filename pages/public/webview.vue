<template>
	<view>
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	
	export default {
		data() {
			return {
				url: ''
			}
		},
		created() {

		},
		onLoad(options) {
			switch (options.type) {
				case 'kd':
					this.url = "https://m.kuaidi100.com/result.jsp?nu=" + options.number;
					break;
				case 'MWEB':
					uni.setNavigationBarTitle({
						title: '微信支付'
					});

					

					break;
			}
		}
	}
</script>

<style>
</style>
