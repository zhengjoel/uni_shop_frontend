<template>
	<view class="content">
		<view class="navbar">
			<view 
				v-for="(item, index) in navList" :key="index" 
				class="nav-item" 
				:class="{current: tabCurrentIndex === index}"
				@click="tabClick(index)"
			>
				<view class="hour">
					<view>{{item.starttime_hour}}</view>
					<view class="text">{{item.text}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pageSize: 15,
				tabCurrentIndex: 0,
				navList:[{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				},{
					state:0,
					starttime_hour: '09:00',
					loadingType: 'more',
					text:'正在进行中',
					page: 1,
					productList: []
				}]
			}
		},
		onLoad(options){
			this.loadNavBar();
		},
		methods: {
			async loadNavBar() {
				let navbar = await this.$api.request('/flash/navbar', 'GET');
				if (navbar) {
					this.navList = navbar;
					this.navList.forEach((item, index)=>{
						item = Object.assign(item, {list: [], page:1, loadingType:'more'}); //新增一个数组用来储存商品
						if (item.current) {
							this.tabCurrentIndex = index;
							this.loadData('tabChange',item.flash_id);
						}
						// 建议把后端处理的starttime_hour和text字段在这里用js处理
					})
				}
			},
			// 加载数据
			async loadData(source = false, flash_id = 0) {
				//这里是将订单挂载到tab列表下
				let index = this.tabCurrentIndex;
				let navItem = this.navList[index];
				
				if(source === 'tabChange' && navItem.loaded === true){
					//tab切换只有第一次需要加载数据
					return;
				}
				if(navItem.loadingType === 'loading'){
					//防止重复加载
					return;
				}
				if (navItem.loadingType == 'noMore') {
					//没有更多数据
					return;
				}
				
				navItem.loadingType = 'loading';
				
				let result = await this.$api.request('/flash/product', 'GET', {flash_id: flash_id, page: navItem.page, pagesize: this.pageSize});
				if (result) {
					if (result.length >= this.pageSize) {
						//判断是否还有数据， 有改为 more， 没有改为noMore
						navItem.loadingType = 'more';
					} else {
						navItem.loadingType = 'noMore';
					}
					// 页数加一
					navItem.page++;
					
					this.navList = result;
					result.forEach((item, index)=>{
						navItem.list.push(item);
					})
					//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
					this.$set(navItem, 'loaded', true);
				}
			},
			//顶部tab点击
			tabClick(index){
				this.tabCurrentIndex = index;
			},
			//swiper 切换
			changeTab(e){
				this.tabCurrentIndex = e.target.current;
				this.loadData('tabChange', this.navList[this.tabCurrentIndex].flash_id);
			},
		}
	}
</script>

<style lang="scss">
	page, .content{
		background: $page-color-base;
		height: 100%;
	}
	.navbar{
		display: flex;
		height: 50px;
		padding: 0 5px;
		background: #000;
		box-shadow: 0 1px 5px rgba(0,0,0,.06);
		position: relative;
		z-index: 10;
		overflow: auto;
		.nav-item{
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 15px;
			//color: $font-color-dark;
			color: #fff;
			font-weight: 900;
			position: relative;
			text-align: center;
			min-width: 150upx;
			.hour{
				flex-flow: column;
				display: flex;
				.text{
					font-size: 10px;
					font-weight: 400;
				}
			}
			&.current{
				//color: $base-color;
				background-color: $base-color;
				&:after{
					content: '';
					position: absolute;
					//left: 50%;
					bottom: -10upx;
					//transform: translateX(-50%);
					transform: rotate(45deg);
					//width: 44px;
					width: 20upx;
					//height: 0;
					height: 20upx;
					background-color: $base-color;
					//border-bottom: 2px solid $base-color;
				}
			}
		}
	}
</style>
