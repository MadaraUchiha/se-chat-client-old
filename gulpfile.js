// Created by madara all rights reserved.

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('lint', function() {
    return gulp.src('src/**/*')
    .pipe(jshint({
            'node': true,
            'esnext': true,
            'quotmark': true
        }))
        .pipe(jshint.reporter(stylish));
});

gulp.task('default', ['lint'], function () {});