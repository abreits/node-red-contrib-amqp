/**
 * Created by Ab on 9-4-2015.
 */
const { src, dest, series } = require('gulp');

//var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var merge = require('merge2');
var addsrc = require('gulp-add-src');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
// TODO eval if sourcemaps did anything useful, given it was commented out everywhere
//var sourcemaps = require('gulp-sourcemaps');
//var mocha = require('gulp-spawn-mocha');

var node_red_root = process.env.NODE_RED_ROOT;

// swallow errors in watch
function swallowError (error) {

  //If you want details of the error in the console
  console.log(error.toString());

  this.emit('end');
}

//define typescript project
var tsProject = ts.createProject({
  module: 'commonjs',
  target: 'ES5',
  declaration: true
});

//gulp.task('default', gulp.series('build:clean'));

//gulp.task('build', gulp.series('compile', 'copy-to-lib', 'copy-to-node-red'));

//gulp.task('build:clean', gulp.series('clean', 'compile'));


function clean(cb) {
	del.sync(['coverage', 'transpiled']);
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


exports.default = series(clean, compile);


/*
gulp.task('clean', function (cb) {
  del.sync([
    'coverage',
    'transpiled'
  ]);
  cb();
});
*/


//gulp.task('compile', function () {
  // compile typescript
//  var tsResult = gulp.src('src/**/*.ts')
//    .pipe(tslint({
//      configuration: 'tools/tslint/tslint-node.json'
//    }))
//    .pipe(tslint.report('prose', {
//      emitError: false
//    }))
//    .pipe(addsrc.prepend('typings*/**/*.d.ts'))
//    .pipe (ts(tsProject));

//  return tsResult.js.pipe(gulp.dest('transpiled'));
//});




// TODO what is this for?
//gulp.task('watch', gulp.series('clean', 'build', function () {
//  gulp.watch('server/**/*.ts', ['build']);
//}));




/*
gulp.task('clean:all', function () {
  del([
    'coverage',
    'transpiled',
    'node_modules'
  ]);
});
*/




//gulp.task('lint', function () {
//  return gulp.src('src/**/*.ts')
//    .pipe(tslint({
//      configuration: 'tools/tslint/tslint-node.json'
//    }))
//    .pipe(tslint.report('full'));
//});


/*
gulp.task('copy-to-lib', gulp.series('compile', function () {
  return gulp.src([
    'src/html/*.html',
    'tools/concat/js_prefix.html',
    'transpiled/html/*.js',
    'tools/concat/js_suffix.html'
  ])
  .pipe(concat('amqp.html'))
  .pipe(addsrc.append(['transpiled/nodejs/*.js', '!transpiled/nodejs/*.spec.js']))
  .pipe(gulp.dest('lib'));
}));
*/

/*
gulp.task('copy-to-node-red', gulp.series('copy-to-lib', function () {
  if (node_red_root) {
    return gulp.src(['lib/*.*'])
    .pipe(gulp.dest(node_red_root + '/node_modules/node-red-contrib-amqp/lib'));
  }
}));
*/

// TODO revisit after gulp is building again.
// Note about commenting the test tasks out:
// Changes to address security vulnerabilities were breaking.
// Also, no tests are actually being run, so commenting out until these could be used properly

// unit tests, more a fast integration test because at the moment it uses an external AMQP server
//gulp.task('test', ['copy-to-lib'], function () {
//  return gulp.src('transpiled/**/*.spec.js', {
//    read: false
//  })
//    .pipe(mocha({
//     r: 'tools/mocha/setup.js',
//      reporter: 'dot' // 'spec', 'dot'
//    }))
//    .on('error', swallowError);
//});

// integration tests, at the moment more an extended version of the unit tests
//gulp.task('test:integration', ['copy-to-lib'], function () {
//  return gulp.src('transpiled/**/*.spec-i.js', {
//    read: false
//  })
//    .pipe(mocha({
//      reporter: 'dot' // 'spec', 'dot'
//    }))
//    .on('error', swallowError);
//});

//gulp.task('test:coverage', ['copy-to-lib'], function () {
//  return gulp.src('transpiled/**/*.spec.js', {
//    read: false
//  })
//    .pipe(mocha({
//      reporter: 'spec', // 'spec', 'dot'
//      istanbul: true
//    }));
//});


