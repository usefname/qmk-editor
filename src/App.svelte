<script>
	import ImportKeyboard from "./ImportKeyboard.svelte";
	import Keyboard from "./editable-keyboard/KeymapWorkspace.svelte";
	import {calcLayoutWidth, layout_largest_x, layout_largest_y} from "./lib/layout";
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
	$: calculatedAppWidth = "calc(((" + calcLayoutWidth(keyboardLayout, 55) + "*1px)) + 20rem)";
	$: calculatedLayoutWidth = "calc((" + calcLayoutWidth(keyboardLayout, 55) + "*1px))";
	$: largest_y = layout_largest_y(keyboardLayout);
	$: largest_x = layout_largest_x(keyboardLayout);
	$: keymap = [[]];
	let key_x_spacing = 55;
	let key_y_spacing = 55;
	let key_width = 50;
	let key_height = 50;
	let library_key_width = 40;
	let library_key_height = 40;

	const handleLoadKeyboard = (event) => {
		keyboardName = event.detail.keyboardName;
		keyboardLayoutName = event.detail.layoutName;
		keyboardLayout = event.detail.layout;
		isLoading = false;
	}
	const handleQMKError = (event) => {
		qmk_error = true;
		qmk_error_output = event.detail.output;
	}

	const showLoadKeyboard = () =>{
		isLoading = !isLoading;
	}

</script>

<main
		style="--app-width:{calculatedAppWidth};--layout-width:{calculatedLayoutWidth};--kb_largest_x: {largest_x};--kb_largest_y: {largest_y}; --key_x_spacing: {key_x_spacing}; --key_y_spacing: {key_y_spacing}; --key_width: {key_width}; --key_height: {key_height};--small_key_width: {library_key_width}; --small_key_height: {library_key_height};--small_key_spacing: {key_x_spacing - key_width};"
>
	{#if qmk_error}
		<h1 class="title has-text-centered has-text-danger is-block">Error while running QMK</h1>
		<code class="is-size-6 has-text-black">
			{qmk_error_output}
		</code>
	{:else}
		<div class="header">
			<div class="header-content">
				<h2>{keyboardName ? keyboardName : "Import QMK keyboard"}</h2>
				<nav class="header-navigation">
					<button class="import-button button is-primary" on:click={showLoadKeyboard} style="visibility: {!keyboardName && isLoading ? 'hidden' : 'visible'}" >Change Keyboard</button>
				</nav>
			</div>
		</div>
		{#if isLoading}
			<ImportKeyboard on:QMKError={handleQMKError} on:loadKeyboard={handleLoadKeyboard}/>
		{/if}
		{#if keyboardName}
			<Keyboard name={keyboardName} layout={keyboardLayout} keymap="{keymap}"/>
		{/if}
	{/if}
</main>

<style>
	main {
		margin-left: 2em;
	}
	.header {
		max-width: var(--app-width);
		text-align: center;
		margin: 0 auto;
	}
	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
