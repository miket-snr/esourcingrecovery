var gulp = require('gulp'); 

gulp.task('backup', async function() {
 gulp.src(['./**', '!./node_modules/**'])
   
    .pipe(gulp.dest('C:/Users/Mike/OneDrive/Development/Backups/esourcing/'));
});
