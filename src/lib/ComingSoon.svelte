<script>
	let openDate = new Date('November 19, 2021 09:00:00');
	let currDate = new Date();

	let showOpening = openDate > currDate;
</script>

<div class="flex flex-col items-center justify-center h-screen bg-logoBlue">
	<img class="w-4/6 max-w-sm w" src="/images/logo.png" alt="Searles Logo" />
	{#if showOpening}
		<h1 class="font-serif text-4xl text-center">Opening this Saturday!</h1>
	{:else}
		<h1 class="font-serif text-4xl text-center">Open now!</h1>
	{/if}
	<div class="font-serif text-2xl text-center pt-5 align-middle leading-normal">
		<button
			class="bg-logoBlue-dark hover:bg-logoBlue-darkest font-bold py-2 px-4 rounded align-middle"
			on:click={() => {
				window.open('https://goo.gl/maps/MDfpdBTi88CTjVu17', '_blank');
			}}
		>
			<i class="mi mi-location"><span class="u-sr-only">Location</span></i>
			Get directions
		</button>
		or
		<button
			class="bg-logoBlue-dark hover:bg-logoBlue-darkest font-bold py-2 px-4 rounded align-middle"
			on:click={() => {
				window.open('tel:+27764859343', '_blank');
			}}
		>
			<i class="mi mi-call"><span class="u-sr-only">Call</span></i>
			Call us
		</button>
	</div>
	<h3 class="font-serif text-lg pt-5 text-center">
		Website coming soon... Check out our <a
			href="https://www.facebook.com/searlesgaragiste"
			class="bg-facebookBlue hover:bg-facebookBlue-dark text-white font-bold py-1 px-3 rounded-full align-middle font-sans_serif"
			>facebook</a
		> in the meantime
	</h3>
</div>

<style>
	.mi {
		vertical-align: middle;
	}
	/* Use this to make sure screen readers read something sensible when encountering the mi. If you are using the icons decoratively, you can omit the <span> */
	.u-sr-only {
		position: absolute;
		left: -10000px;
		top: auto;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
</style>
