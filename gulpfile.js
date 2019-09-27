'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();

// @TODO replace with the theme directory name
const themeName = '';

// paths
const themeDir = 'web/themes/custom/' + themeName + '/';
const sources = themeDir + 'sources/';
const assets = themeDir + 'assets/';

// =============================================================================
//     Styles
// =============================================================================

gulp.task('scss', () => {
  return gulp.src(sources + 'scss/**/*.scss')
      .pipe($.sourcemaps.init())
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.autoprefixer())
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(assets + 'css/'))
      .pipe($.livereload());
});

gulp.task('stylelint', () => {
  return gulp.src(sources + 'scss/**/*.scss')
      .pipe($.stylelint({
        reporters: [
          {formatter: 'string', console: true},
        ],
        ignorePath: '.stylelintignore',
      }));
});

/*
 * There is no gulp plugin stable enough to be used here. So the command
 * `./node_modules/.bin/stylelint . --fix` is executed in replacement.
 */
gulp.task('stylelint-fix', (done) => {
  const exec = require('child_process').exec;
  exec(
      './node_modules/.bin/stylelint . --fix',
      function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done();
      }
  );
});

gulp.task('minifycss', () => {
  return gulp.src(assets + 'css/style.css')
      .pipe($.csso())
      .pipe($.rename({
        suffix: '.min',
      }))
      .pipe(gulp.dest(assets + 'css/'));
});

// =============================================================================
//     Scripts
// =============================================================================

gulp.task('js', () => {
  return gulp.src(sources + 'js/*.js')
      .pipe($.sourcemaps.init())
      .pipe($.babel({
        presets: ['@babel/env'],
      }))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(assets + 'js/'))
      .pipe($.livereload());
});

gulp.task('eslint', () => {
  return gulp.src(sources + 'js/*.js')
      .pipe($.eslint({
        configFile: './.eslintrc.json',
      }))
      .pipe($.eslint.format())
      .pipe($.eslint.failAfterError());
});

/**
 * @param {object} file
 * @return {boolean}
 */
function isFixed(file) {
  return file.eslint != null && file.eslint.fixed;
}

gulp.task('eslint-fix', () => {
  return gulp.src(sources + 'js/*.js', {base: './'})
      .pipe($.eslint({fix: true}))
      .pipe($.eslint.format())
      // if fixed, write the file to dest
      .pipe($.if(isFixed, gulp.dest('./')));
});

gulp.task('minifyjs', () => {
  return gulp.src(assets + 'js/script.js')
      .pipe($.babelMinify())
      .pipe($.rename({
        suffix: '.min',
      }))
      .pipe(gulp.dest(assets + 'js/'));
});

// =============================================================================
//     Watch
// =============================================================================

gulp.task('watch', () => {
  $.livereload.listen();
  gulp.watch(sources + 'scss/**/*.scss', gulp.series('scss'));
  gulp.watch(sources + 'js/**/*.js', gulp.series('js'));
});

// =============================================================================
//     Tasks
// =============================================================================

gulp.task('build', gulp.parallel('scss', 'js'));

gulp.task('linters', gulp.parallel('stylelint', 'eslint'));

gulp.task('linters-fix', gulp.parallel('stylelint-fix', 'eslint-fix'));

gulp.task('minify', gulp.parallel('minifycss', 'minifyjs'));

gulp.task('prod', gulp.series('build', 'minify'));

gulp.task('default', gulp.series('build'));
