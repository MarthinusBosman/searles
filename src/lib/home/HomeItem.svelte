<script lang="ts">
	export let title: string;
	export let items: string[];
</script>

<a
	href="/{title.toLowerCase()}"
	class="bg-blue text-yellow flex-1 flex flex-col justify-around p-3"
>
	<h2 class="text-xl font-bold uppercase">{title}</h2>
	{#each items as item}
		<a href="/{title.toLowerCase()}#{item.toLowerCase().replace(/ /g, '-')}"
			><h3 class="text-base">{item}</h3></a
		>
	{/each}
</a>
