<script lang="ts">
	import { homeLayout, Layout } from '../stores';
	import HomeItem from '$lib/home/HomeItem.svelte';

	let layout: Layout;

	homeLayout.subscribe((value) => {
		layout = value;
		console.log(value);
	});
</script>

<svelte:head>
	<title>Searles Garagiste</title>
</svelte:head>

<div class="flex flex-col justify-around flex-grow gap-3 py-3">
	{#each layout.order as key}
		<HomeItem title={key} items={layout[key]} />
	{/each}
</div>
