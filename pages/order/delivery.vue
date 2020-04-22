<template>
	<view>
		<zTable :tableData="tableData" :columns="arr"></zTable>
	</view>
</template>

<script>
	import zTable from '@/components/z-table/z-table';
	export default{
		components:{
			zTable
		},
		data() {
			return{
				tableData:['key1', 'key2'],
				arr:[
					{
						"title": "title1",
						"key" :"0"
					},
					{
						"title": "title2",
						"key" :"1"
					}
				]
			}
		},
		onLoad() {
			this.getTemplate();
		},
		methods:{
			async getTemplate(){
				let data = this.$api.request('');
				if (data) {
					
				}
			}
		}
	}
</script>

<style lang="scss">
</style>
