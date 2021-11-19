<script>
	import '../app.css';
	import { initializeApp } from 'firebase/app';
	import { onMount } from 'svelte';

	onMount(() => {
		const firebaseConfig = {
			apiKey: 'AIzaSyBP8ZgpAGMmBu-SnoUiQSv_RxjEvMddV1s',
			authDomain: 'searles-garagiste.firebaseapp.com',
			projectId: 'searles-garagiste',
			storageBucket: 'searles-garagiste.appspot.com',
			messagingSenderId: '1094795670040',
			appId: '1:1094795670040:web:eb66a4c016e180f9ee496d',
			measurementId: 'G-L7SLFLEG0P'
		};
		initializeApp(firebaseConfig);
	});
</script>

<slot />
