/**
 * Created by Ab on 9-4-2015.
 */
const { src, dest, series } = require('gulp');

var del = require('del');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var addsrc = require('gulp-add-src');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');

//define typescript project
var tsProject = ts.createProject({
  module: 'commonjs',
  target: 'ES5',
  declaration: true
});

function clean(cb) {
	del.sync(['coverage', 'transpiled']);
	cb();
}

function cleanmodules(cb) {
	del.sync(['node_modules']);
	cb();
}

// compile typescript
function compile(cb) {
	var tsResult = src('src/**/*.ts')
		.pipe(tslint({
			configuration: 'tools/tslint/tslint-node.json'
    		}))
    	.pipe(tslint.report('prose', {
      		emitError: false
    		}))
    	.pipe(addsrc.prepend('typings*/**/*.d.ts'))
    	.pipe (ts(tsProject));

	return tsResult.js.pipe(dest('transpiled'));
	cb();
}

function lint(cb) {
	return src('src/**/*.ts')
		.pipe(tslint({
			configuration: 'tools/tslint/tslint-node.json'
			}))
		.pipe(tslint.report('full'));
	cb();
}

function copytolib(cb) {
	return src([
			'src/html/*.html',
			'tools/concat/js_prefix.html',
			'transpiled/html/*.js',
			'tools/concat/js_suffix.html'
			])
		.pipe(concat('amqp.html'))
		.pipe(addsrc.append(['transpiled/nodejs/*.js', '!transpiled/nodejs/*.spec.js']))
		.pipe(dest('lib'));
	cb();
}

exports.build = compile;
exports.build_release = series(compile, copytolib);
exports.clean_build = series(clean, compile);
exports.clean_build_release = series(clean, compile, copytolib);
exports.default = exports.build_release;
exports.clean = clean;
exports.clean_all = series(clean, cleanmodules);
exports.lint = lint;


// Notes regarding removed targets:
// Tests - original code base no tests were actually being run
// Copy-to-node-red - Locally I was testing either using npm install from my local,
//		or npm link to validate the package globally, which are more standard dev patterns
// Watch - I had no real reason not to port it forward other than I wasn't using it at all
//		Could be reimplemented to those who like the watch pattern for continuous building



