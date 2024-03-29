// Created by madara all rights reserved.

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('lint', function() {
    return gulp.src('src/**/*.js')
    .pipe(jshint({
            'node': true,
            'esnext': true,
            'quotmark': true
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['lint'], function () {});