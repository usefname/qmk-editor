<script>
	import ImportKeyboard from "./ImportKeyboard.svelte";
	import Keyboard from "./Keyboard.svelte";
	let qmk_error = false;
	let qmk_error_output = "Failed to execute QMK";

	let isLoading = false;

	let keyboardName = "Test";
	let keyboardLayoutName;
	$: keyboardLayout = [
		{ "x": 0, "y": 0.375, "w": 1.5 }, { "x": 1.5, "y": 0.375 }, { "x": 2.5, "y": 0.125 }, { "x": 3.5, "y": 0 }, { "x": 4.5, "y": 0.125 }, { "x": 5.5, "y": 0.25 }, { "x": 6.5, "y": 0.25 },
		{ "x": 9.5, "y": 0.25 }, { "x": 10.5, "y": 0.25 }, { "x": 11.5, "y": 0.125 }, { "x": 12.5, "y": 0 }, { "x": 13.5, "y": 0.125 }, { "x": 14.5, "y": 0.375 }, { "x": 15.5, "y": 0.375, "w": 1.5 },

		{ "x": 0, "y": 1.375, "w": 1.5 }, { "x": 1.5, "y": 1.375 }, { "x": 2.5, "y": 1.125 }, { "x": 3.5, "y": 1 }, { "x": 4.5, "y": 1.125 }, { "x": 5.5, "y": 1.25 }, { "x": 6.5, "y": 1.25, "h": 1.5 },
		{ "x": 9.5, "y": 1.25, "h": 1.5 }, { "x": 10.5, "y": 1.25 }, { "x": 11.5, "y": 1.125 }, { "x": 12.5, "y": 1 }, { "x": 13.5, "y": 1.125 }, { "x": 14.5, "y": 1.375 }, { "x": 15.5, "y": 1.375, "w": 1.5 },

		{ "x": 0, "y": 2.375, "w": 1.5 }, { "x": 1.5, "y": 2.375 }, { "x": 2.5, "y": 2.125 }, { "x": 3.5, "y": 2 }, { "x": 4.5, "y": 2.125 }, { "x": 5.5, "y": 2.25 },
		{ "x": 10.5, "y": 2.25 }, { "x": 11.5, "y": 2.125 }, { "x": 12.5, "y": 2 }, { "x": 13.5, "y": 2.125 }, { "x": 14.5, "y": 2.375 }, { "x": 15.5, "y": 2.375, "w": 1.5 },

		{ "x": 0, "y": 3.375, "w": 1.5 }, { "x": 1.5, "y": 3.375 }, { "x": 2.5, "y": 3.125 }, { "x": 3.5, "y": 3 }, { "x": 4.5, "y": 3.125 }, { "x": 5.5, "y": 3.25 }, { "x": 6.5, "y": 2.75, "h": 1.5 },
		{ "x": 9.5, "y": 2.75, "h": 1.5 }, { "x": 10.5, "y": 3.25 }, { "x": 11.5, "y": 3.125 }, { "x": 12.5, "y": 3 }, { "x": 13.5, "y": 3.125 }, { "x": 14.5, "y": 3.375 }, { "x": 15.5, "y": 3.375, "w": 1.5 },

		{ "x": 0.5, "y": 4.375 }, { "x": 1.5, "y": 4.375 }, { "x": 2.5, "y": 4.125 }, { "x": 3.5, "y": 4 }, { "x": 4.5, "y": 4.125 },
		{ "x": 11.5, "y": 4.125 }, { "x": 12.5, "y": 4 }, { "x": 13.5, "y": 4.125 }, { "x": 14.5, "y": 4.375 }, { "x": 15.5, "y": 4.375 },

		{ "x": 6, "y": 5 }, { "x": 7, "y": 5 }, { "x": 9, "y": 5 }, { "x": 10, "y": 5 },
		{ "x": 7, "y": 6 }, { "x": 9, "y": 6 },
		{ "x": 5, "y": 6, "h": 2 }, { "x": 6, "y": 6, "h": 2 }, { "x": 7, "y": 7 }, { "x": 9, "y": 7 }, { "x": 10, "y": 6, "h": 2 }, { "x": 11, "y": 6, "h": 2 }
	];

	function handleLoadKeyboard(event) {
		keyboardName = event.detail.keyboardName;
		keyboardLayoutName = event.detail.layoutName;
		keyboardLayout = event.detail.layout;
		isLoading = false;
	}
	function handleQMKError(event) {
		qmk_error = true;
		qmk_error_output = event.detail.output;
	}

	function showLoadKeyboard() {
		isLoading = !isLoading;
	}
</script>

<main>

	{#if qmk_error}
		<h1 class="title has-text-centered has-text-danger is-block">Error while running QMK</h1>
		<code class="is-size-6 has-text-black">
			{qmk_error_output}
		</code>
	{:else}
		<div class="columns">
			<div class="column is is-four-fifths"><h2 class="is-size-2">{keyboardName ? keyboardName : "Import QMK keyboard"}</h2></div>
			<div class="column"><button class="button is-primary" on:click={showLoadKeyboard} style="visibility: {!keyboardName && isLoading ? 'hidden' : 'visible'}" >Import Keyboard</button></div>
		</div>
		{#if isLoading}
			<ImportKeyboard on:QMKError={handleQMKError} on:loadKeyboard={handleLoadKeyboard}/>
		{/if}
		{#if keyboardName}
			<Keyboard name={keyboardName} layout={keyboardLayout} layers="{[[]]}"/>
		{/if}
	{/if}
</main>

<style>
	main {
		margin-left: 2em;
	}
</style>
