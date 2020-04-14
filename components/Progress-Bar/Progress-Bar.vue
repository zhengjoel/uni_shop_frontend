<template>
	<view>
		<view class="progress" :class="Type" :style="{width: widthUpx + 'rpx'}">
			<view class="progress-text" v-if="Vice == true" :style="{width: widthUpx + 'rpx'}">
				已抢{{Sold}}件
				{{ Width + '%' }}
			</view>
			<view class="progress-bar" :style="{width: Width+'%'}"><view class="progress-text" v-if="Main == true">{{ Width + '%' }}</view></view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		// 已卖多少件
		Sold: {
			type: Number,
			default: 0
		},
		// 进度条宽度
		widthUpx: {
			type: Number,
			default: 710
		},
		// 进度条百分比
		Width: {
			type: Number,
			default: 0
		},
		// 进度条样式
		/*
			aqua
			copper
			candy
			neon
			shine
			zigzag
			diamond
			hearts
			sparkle
		*/
		Type: {
			type: String,
			default: 'aqua',
		},
		// 主进度显示百分比
		Main: {
			type: Boolean,
			default: true,
		},
		// 副进度显示百分比
		Vice: {
			type: Boolean,
			default: true,
		},
		
	},
	data() {
		return {

		};
	},
	methods: {}
};
</script>

<style>
@import url('Progress-Bar.css');
</style>
