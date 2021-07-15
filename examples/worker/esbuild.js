require('esbuild').build({
	bundle: true,
	entryPoints: ['src/index.js'],
	outfile: 'output/esbuild.js',
	format: 'esm',
	plugins: [
		require('tempura/esbuild').transform({
			// Options
		})
	]
});
