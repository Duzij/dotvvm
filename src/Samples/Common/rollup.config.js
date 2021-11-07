import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
//import livereload from '@rollup/plugin-livereload';
//import { terser } from '@rollup/plugin-terser';
const production = !process.env.ROLLUP_WATCH;
export default {
    input: './Scripts/react/react-app.tsx',
    output: {
        format: 'esm',
        file: './script/react-app.js',
        sourcemap: !production
    },
    plugins: [
        typescript({
            tsconfig: "tsconfig.react.json"
        }),
        resolve({ browser: true }),
        commonjs({
            include: 'node_modules/**'
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        //!production && livereload('public'),
        //production && terser(),
    ]
}

