var fs = require('fs'),
	async = require('async'),
	less = require('less'),
	sqwish = require('sqwish').minify,
	uglify = require('uglify-js'),
	jsp = uglify.parser,
	pro = uglify.uglify,
	jsdom = require('jsdom'),
	srcDir = 'src/',
	distDir = 'dist/';

fs.cp = function(source, dest, callback){
	var copy = require("child_process").spawn("cp", ["-r", source, dest]);

	return copy.on("exit", callback);
};

fs.rmr = function(toRemove, callback){
	var rmDashR = require("child_process").spawn("rm", ["-r", toRemove]);

	return rmDashR.on("exit", callback);
};

desc('Default task. Creates distribution directory if it doesn\'t already exist, then kicks off all the other tasks.');
task('default', function() {
	fs.stat(distDir, function(err, stats) {
		//if (err) throw err;

		function continueBuild() {
			jake.Task.buildIndex.execute();
			jake.Task.buildLess.execute();
			jake.Task.buildJs.execute();
			jake.Task.copyImg.execute();
		}

		function createDistDir() {
			fs.mkdir(distDir, 0777, function(err) {
				if (err) throw err;

				console.log('Created ' + distDir);
				continueBuild();
			});
		}

		if (!stats) {
			createDistDir();
		} else {
			fs.rmr(distDir, function(err) {
				if (err) throw err;

				console.log('Removed existing ' + distDir);
				createDistDir();
			});
		}
	});
});

desc('Replace source head of index with distribution head.');
task('buildIndex', function() {
	fs.readFile(srcDir + 'out-head.html', function(err, data) {
		if (err) throw err;
		var newHead = data.toString();

		jsdom.env(srcDir + 'index.html', [srcDir + 'js/jquery.js'], function(err, win) {
			if (err) throw err;

			//save jquery for our own buildy purposes, then get rid of the appended script:
			var $ = win.$;
			$('script:last').remove();

			$('head').text(newHead + '\t');

			fs.writeFile(distDir + 'index.html', win.document.doctype + win.document.innerHTML, function() {
				console.log('Output ' + distDir + 'index.html');
			});
		});
	});
});

desc('Compile and output less.');
task('buildLess', function() {
	//get less
	fs.readFile(srcDir + 'screen.less', function(err, data) {
		if (err) throw err;
		data = data.toString();

		//compile less
		less.render(data, function(e, css) {
			//minify and write compiled css
			fs.writeFile(distDir + 'screen.css', sqwish(css), function() {
				console.log('Output minified CSS to ' + distDir + 'screen.css');
			});
		});
	});
});

desc('Minify, concatenate, and output js.');
task('buildJs', function() {
	var jsSrcDir = srcDir + 'js/',
		minifiedFiles = [],
		prebuiltFiles = [
				'jquery.js'
			],
		jsFiles = [
				'underscore.js',
				'sha256.js',
				'json2.js',
				'jsonapi.js',
				'iscroll.js',
				'fancybox.js',
				'main.js'
			];

	async.forEachSeries(prebuiltFiles, function(file, callback) {
		fs.readFile(jsSrcDir + file, function(err, data) {
			minifiedFiles.push(data.toString());
			callback();
		});
	}, function() {
		async.forEachSeries(jsFiles, function(file, callback) {
			fs.readFile(jsSrcDir + file, function(err, data) {
				if (err) throw err;

				var ast = jsp.parse(data.toString());
				ast = pro.ast_mangle(ast);
				ast = pro.ast_squeeze(ast);

				minifiedFiles.push('//' + file + ':\n' + pro.gen_code(ast));

				callback();
			});
		}, function() {
			var outJs = minifiedFiles.join(';\n\n');

			fs.writeFile(distDir + 'opcraft.js', outJs, 'utf8', function() {
				console.log('Output minified/combined JS to ' + distDir + 'opcraft.js');
			});
		});
	});
});

desc('Copy image folder.');
task('copyImg', function() {
	fs.cp(srcDir + 'img', distDir + 'img', function(){
		console.log('Copied image folder to ' + distDir + 'img');
	});
});