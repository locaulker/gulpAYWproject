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
runSequence = require('run-sequence');

gulp.task('clean:dev', function() {
  return del.sync([
    'app/css',
    'app/*.html'
  ])
});


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
gulp.task('watch', ['browserSync', 'sass', 'nunjucks'], function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch([
    'app/templates/**/*',
    'app/pages/**/*.+(html|nunjucks)',
    'app/data.json'
  ], ['nunjucks']);
});


gulp.task('default', function(callback) {
  runSequence(
    'clean:dev',
    'sprites',
    ['sass', 'nunjucks'],
    ['browserSync', 'watch'],
    callback
  )
});
