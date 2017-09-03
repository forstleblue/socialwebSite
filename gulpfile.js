var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefix = new LessPluginAutoPrefix({browsers: ['last 2 versions']});
var webpack = require('webpack');
var path = require('path');
var livereload = require('gulp-livereload');
var mainBowerFiles = require('main-bower-files');
var runSequence = require('run-sequence');

var plugins = [];

console.log(process.env);

if (process.env.NODE_ENV !== 'development') {
  plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'HTTP_STATIC_URL': JSON.stringify(process.env.HTTP_STATIC_URL),
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ];
}

var externals = {
  'jquery': 'jQuery',
  'moment': 'moment',
  'lodash': '_',
  'string': 'S',
  'marked': 'marked',
  'react': 'React',
  'react/addons': 'React',
  'react-bootstrap': 'ReactBootstrap',
  'react-router': 'ReactRouter',
  'react-router-bootstrap': 'ReactRouterBootstrap',
  'socket.io-client': 'io',
  'sortablejs/react-sortable-mixin': 'SortableMixin'
};

gulp.task('default', function (callback) {
  runSequence(
    'less:mailgun',
    'less:login',
    'less:dashboard',
    ['webpack:login', 'webpack:dashboard'],
    'bower',
    callback
  );
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('./less/mailgun.less', ['less:mailgun']);
  gulp.watch('./less/login.less', ['less:login']);
  gulp.watch(['./jsx/login.jsx','./jsx/login/**/*.jsx'], ['webpack:login']);
  gulp.watch(['./less/dashboard.less','./less/dashboard/**/*less'], ['less:dashboard']);
  gulp.watch(['./jsx/dashboard.jsx','./jsx/dashboard/**/*.jsx'], ['webpack:dashboard']);
});

gulp.task('bower', function () {
  return gulp.src(mainBowerFiles(), {
    'base': 'bower_components'
  }).pipe(gulp.dest('../public/vendor/'));
});

gulp.task('less:mailgun', function () {
  return gulp.src('./less/mailgun.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({
      'plugins': [autoprefix]
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('../public/css'));
});

gulp.task('less:login', function () {
  return gulp.src('./less/login.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({
      'plugins': [autoprefix]
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('../public/css'))
    .pipe(livereload());
});

gulp.task('less:dashboard', function () {
  return gulp.src('./less/dashboard.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({
      'plugins': [autoprefix]
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('../private/css'))
    .pipe(livereload());
});

gulp.task('webpack:login', function (callback) {
  webpack({
    'entry': './jsx/login.jsx',
    'output': {
      'filename': '../public/js/login.js',
    },
    'module': {
      'loaders': [{
        'test': /\.jsx?$/,
        'exclude': /(node_modules|bower_components)/,
        'loader': 'babel-loader',
        'query': {
          'presets': ['es2015', 'react']
        }
      }]
    },
    'resolve': {
      'extensions': ['.js', '.jsx']
    },
    'plugins': plugins,
    'externals': externals
  }, function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString());
    callback();
  });
});

gulp.task('webpack:dashboard', function (callback) {
  webpack({
    'entry': './jsx/dashboard.jsx',
    'output': {
      'filename': '../private/js/dashboard.js',
    },
    'module': {
      'loaders': [{
        'test': /\.jsx?$/,
        'exclude': /(node_modules|bower_components)/,
        'loader': 'babel-loader',
        'query': {
          'presets': ['es2015', 'react']
        }
      }]
    },
    'resolve': {
      'extensions': ['.js', '.jsx']
    },
    'plugins': plugins,
    'externals': externals
  }, function (err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString());
    callback();
  });
});
