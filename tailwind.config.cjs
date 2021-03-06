module.exports = {
	mode: 'jit',
	purge: ['./src/**/*.svelte'],
	theme: {
		colors: {
			logoBlue: {
				darkest: '#255559',
				dark: '#306e73',
				DEFAULT: '#469fa6',
				light: '#56c3cc',
				lightest: '#66e8f2'
			},
			logoYellow: '#c5b343',
			white: '#fff',
			facebookBlue: {
				dark: '#25385f',
				DEFAULT: '#395693'
			}
		},
		fontFamily: {
			serif: ['Merriweather', 'ui-serif', 'Georgia'],
			sans_serif: ['Tahoma', 'ui-serif']
		}
	}
};
