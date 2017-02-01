var gulp = require('gulp'),
sass = require('gulp-sass'),
plumber = require('gulp-plumber'),
notify = require('gulp-notify'),
browserSync = require('browser-sync'),
autoprefixer = require('gulp-autoprefixer'),
sourcemaps = require('gulp-sourcemaps'),
spritesmith = require('gulp.spritesmith'),
gulpIf = require('gulp-if'),
nunjucksRender = require('gulp-nunjucks-render'),
data = require('gulp-data'),
fs = require('fs'),
del = require('del'),
runSequence = require('run-sequence'),
// jshint = require('jshint'),
jshint = require('gulp-jshint'),
jscs = require('gulp-jscs'),
scssLint = require('gulp-scss-lint');



function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
      sound: "Glass"
    })
  });
}

// SASS Task
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(customPlumber('Opps! Error Running SASS'))
    .pipe(sourcemaps.init())
    .pipe(sass({
      precision: 2,
      outputStyle: 'expanded',
      includePaths: [
        'app/bower_components',
        'node_modules'
      ]
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});


// SCSS Lint Task
gulp.task('lint:scss', function() {
  // Lint All files Except the generated _sprites.scss file
  return gulp.src(['app/scss/**/*.scss', '!app/scss/_sprites.scss'])
    .pipe(scssLint({
      config: '.scss-lint.yml'
    }))
});


// Browser Sync Server Setup
gulp.task('browserSync', function() {
  browserSync({
    notify: false,
    server: {
      baseDir: 'app'
    }
  })
});


// Templating Task
gulp.task('nunjucks', function() {
  nunjucksRender.nunjucks.configure(['app/templates/']);

  return gulp.src('app/pages/**/*.+(html|nunjucks)')
    .pipe(customPlumber('Oops! Error Running Nunjucks'))
    .pipe(data(function() {
      return JSON.parse(fs.readFileSync('./app/data.json'))
    }))
    .pipe(nunjucksRender({
      path: ['app/templates']
    }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({
      stream: true
    }))
});


// Image Sprites
gulp.task('sprites', function() {
  gulp.src('app/images/sprites/**/*')
    .pipe(spritesmith({
      cssName: '_sprites.scss',        //CSS file
      imgName: 'sprites.png',          // Image file
      imgPath: '../images/sprites.png',
      retinaSrcFilter: 'app/images/sprites/*@2x.png',
      retinaImgName: 'sprites@2x.png',
      retinaImgPath: '../images/sprites@2x.png'
    }))
    .pipe(gulpIf('*.png', gulp.dest('app/images')))
    .pipe(gulpIf('*.scss', gulp.dest('app/scss')))
});


// Watch Tasks
gulp.task('watch-js', ['lint:js'], browserSync.reload);

gulp.task('watch', function() {
  gulp.watch('app/js/**/*.js', ['watch-js']);
  gulp.watch('app/scss/**/*.scss', ['sass', 'lint:scss']);
  gulp.watch([
    'app/pages/**/*.+(html|nunjucks)',
    'app/templates/**/*',
    'app/data.json'
  ], ['nunjucks'])
});


// JSHint Tasks
gulp.task('lint:js', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(customPlumber('Oops! JSHint Error Occurred'))
    .pipe(jshint())
    // .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('jshint-stylish', 'fail', {
      ignoreWarning: true,
      ignoreInfo: true
    }))
    .pipe(jscs({
      fix: true,
      configPath: '.jscsrc'
    }))
    // .pipe(jscs.reporter()) // Removed
    .pipe(gulp.dest('app/js'))
});


// Clean
gulp.task('clean:dev', function() {
  return del.sync([
    'app/css',
    'app/*.html'
  ])
});


// Run Tasks in defined sequence
gulp.task('default', function(callback) {
  runSequence(
    'clean:dev',
    ['sprites', 'lint:js', 'lint:scss'],
    ['sass', 'nunjucks'],
    ['browserSync', 'watch'],
    callback
  )
});
