<script lang="ts">
</script>

<div class="flex navigation content-start">
	<a href="/"><img src="/images/logo_128.png" alt="Searles Logo" width="128" /></a>
	<div class="flex-grow" />
	<div>
		<button class="text-4xl text-yellow"
			><i class="mi mi-menu"><span class="u-sr-only">Menu</span></i></button
		>
	</div>
</div>

<style>
	.navigation {
		background-image: url('/images/banner.png');
		background-repeat: repeat-x;
		background-size: auto 100%;
	}

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
