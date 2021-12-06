<script lang="ts">
	import '../app.css';
	import { initializeApp } from 'firebase/app';
	import { getDatabase, ref, onValue } from 'firebase/database';
	import { onMount } from 'svelte';
	import NavBar from '$lib/nav/NavBar.svelte';
	import ToolBar from '$lib/nav/ToolBar.svelte';
	import { homeLayout } from '../stores';

	onMount(() => {
		const firebaseConfig = {
			apiKey: 'AIzaSyBP8ZgpAGMmBu-SnoUiQSv_RxjEvMddV1s',
			authDomain: 'searles-garagiste.firebaseapp.com',
			projectId: 'searles-garagiste',
			storageBucket: 'searles-garagiste.appspot.com',
			messagingSenderId: '1094795670040',
			appId: '1:1094795670040:web:eb66a4c016e180f9ee496d',
			measurementId: 'G-L7SLFLEG0P',
			databaseURL: 'https://searles-garagiste-default-rtdb.firebaseio.com/'
		};
		const app = initializeApp(firebaseConfig);

		const database = getDatabase(app);

		const homeRef = ref(database, 'layout/home');
		onValue(homeRef, (snapshot) => {
			const data = snapshot.val();
			homeLayout.set(data);
			console.log(data);
		});
	});
</script>

<svelte:head>
	<style>
		body {
			background: #1a1a1a;
		}
	</style>
</svelte:head>

<div class="flex flex-col h-screen">
	<NavBar />

	<slot />

	<ToolBar />
</div>
