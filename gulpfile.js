var gulp = require('gulp'),
sass = require('gulp-sass'),
notify = require('gulp-notify'),
browserSync = require('browser-sync'),
autoprefixer = require('gulp-autoprefixer'),
sourcemaps = require('gulp-sourcemaps'),
spritesmith = require('gulp.spritesmith'),
gulpIf = require('gulp-if');



// Hello task
gulp.task('hello', function() {
  console.log('Hello Lawrence');
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


// SASS Task
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      precision: 2,
      outputStyle: 'expanded'
    }))
    .on('error', function(err) {
      console.log(err.toString());
      this.emit('end'); // Ends the current pipe
    })
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});


// Watch Tasks
gulp.task('watch', ['browserSync', 'sass'], function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
});
