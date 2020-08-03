(function () {
  "use strict";
  // Define your library strictly...
})();
module.exports = function (grunt) {
  var isWin = process.platform === "win32";
  var nodeMajor = _getNodeMajor();
  var packageData = grunt.file.readJSON('package.json');
  // #region Functions
  function _getNodeMajor() {
    // https://www.regexpal.com/?fam=108819
    var s = process.version;
    var major = s.replace(/v?(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/, '$1');
    return parseInt(major, 10);
  }
  function appendToFile(file, str) {
    var options = {
      encoding: 'utf8'
    };
    var contents = grunt.file.read(file, options);
    contents += str;
    grunt.file.delete(file, { force: true });
    grunt.file.write(file, contents, options);
  }
  function bumpVerson(segment) {
    var file = 'package.json';
    var jpkg = grunt.file.readJSON(file);
    var verRegex = /(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)/;
    var verStr = jpkg.version;
    var major = parseInt(verStr.replace(verRegex, '$1'), 10);
    var minor = parseInt(verStr.replace(verRegex, '$2'), 10);
    var build = parseInt(verStr.replace(verRegex, '$3'), 10);
    var save = false;
    if (segment === 'build') {
      build++;
      save = true;
    } else if (segment === 'minor') {
      minor++;
      build = 0;
      save = true;
    } else if (segment === 'major') {
      major++;
      minor = 0;
      build = 0;
      save = true;
    }
    if (save === true) {
      var newVer = major + '.' + minor + '.' + build;
      jpkg.version = newVer;
      grunt.file.write(file, JSON.stringify(jpkg, null, 2));
      return newVer;
    } else {
      return verStr;
    }
  }
  // #endregion
  // #region grunt init config
  grunt.initConfig({
    // pkg: packageData,
    env: {
      dev: {
        NODE_ENV: 'development',
        VERSION: function () {
          var j = grunt.file.readJSON('package.json');
          this.pkg = j;
          return j.version;
        }
      },
      build: {
        NODE_ENV: 'production',
        VERSION: function () {
          var j = grunt.file.readJSON('package.json');
          this.pkg = j;
          return j.version;
        }
      }
    },
    clean: {
      dirs: ['scratch', 'dist', 'lib'],
      test: ['scratch'],
      docs: ['docs'],
      js: ['./js/*'],
      files: [
        './index.js',
        './strbrk.min.js',
        './strbrk.min.js.map',
        'index.d.ts'
      ]
    },

    tslint: {
      options: {
        configuration: 'tslint.json'
      },
      plugin: ['src/**/*.ts']
    },
    shell: {
      tsc: 'tsc',
      tsces6: 'tsc @tsconfiges3.txt'
    },
    remove_comments: {
      js: {
        options: {
          multiline: true, // Whether to remove multi-line block comments
          singleline: true, // Whether to remove the comment of a single line.
          keepSpecialComments: false, // Whether to keep special comments, like: /*! !*/
          linein: true, // Whether to remove a line-in comment that exists in the line of code, it can be interpreted as a single-line comment in the line of code with /* or //.
          isCssLinein: false // Whether the file currently being processed is a CSS file
        },
        cwd: 'lib/',
        src: '**/*.js',
        expand: true,
        dest: 'scratch/nc/'
      },
      es6_js: {
        options: {
          multiline: true, // Whether to remove multi-line block comments
          singleline: true, // Whether to remove the comment of a single line.
          keepSpecialComments: false, // Whether to keep special comments, like: /*! !*/
          linein: true, // Whether to remove a line-in comment that exists in the line of code, it can be interpreted as a single-line comment in the line of code with /* or //.
          isCssLinein: false // Whether the file currently being processed is a CSS file
        },
        src: 'scratch/es6/main.js',
        expand: false,
        dest: 'js/node_string_breaker.js'
      }
    },
    copy: {
      d: {
        files: [{
          // cwd: 'lib/',
          src: './lib/main.d.ts',
          dest: './index.d.ts'
          // expand: false
        },
        {
          src: './scratch/nc/main.js',
          dest: './index.js'
        }],
      },
      es6: {
        files: [{
          src: 'scratch/es6/js/node_string_breaker.min.js',
          dest: 'js/node_string_breaker.min.js'
        }]
      }
    },
    replace: {
      es6_utf16: {
        options: {
          patterns: [
            {
              match: /(import\s[{}\sa-zA-Z0-9_\-,]+\sfrom\s)'utf16-char-codes';/g,
              replacement: function (str, match) {
                // return typeof(x)+' ' + y +' // something funny';
                return match+'\''+packageData._utf16_char_codes_url+'\';';
              },
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['lib/es6/main.js'], dest: 'scratch/es6/' }
        ]
      },
      es6_map: {
        options: {
          patterns: [
            {
              match: /"sources":\["scratch\/es6\/[a-zA-Z0-9_\-\.]*"]/g,
              replacement: '"sources":["node_string_breaker.js"]'
            }
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['scratch/es6/js/node_string_breaker.min.js.map'], dest: 'js/' }
        ]
      }
    },
    terser: {
      main: {
        options: {
          sourceMap: true
        },
        files: {
          'scratch/es6/js/node_string_breaker.min.js': ['scratch/es6/main.js']
        }
      }
    },
  });
  // #endregion
  // #region grunt require and load npm task
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-remove-comments');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-terser');
  // #endregion
  grunt.registerTask('default', [
    'build'
  ]);
  grunt.registerTask('build_build', [
    'bumpBuild',
    'build_git'
  ]);
  grunt.registerTask('build_minor', [
    'bumpMinor',
    'build_git',
  ]);
  grunt.registerTask('build_major', [
    'bumpMajor',
    'build_git',
  ]);
  grunt.registerTask('build_git', [
    'env:build',
    'test',
    'gitver'
  ]);
  grunt.registerTask('envcheck', ['version_bump:build', 'env:dev', 'devtest']);
  grunt.registerTask('ver', function () {
    grunt.log.writeln('output from task ver');
    grunt.log.writeln("BUILD_VERSION:" + BUILD_VERSION);
    grunt.log.writeln("packageData.version:" + packageData.version);
  });
  grunt.registerTask('test', [
    'clean:test',
    'run_test',
    'clean:test'
  ]);
  grunt.registerTask('run_test', 'run mocha', function () {
    var done = this.async();
    // exec works with $(which mocha) except on travis ci below nodejs version 8
    // exec $(which node) $(which mocha) works on all tested versions
    grunt.log.writeln("Node Major Version:", nodeMajor);
    var cmd = '';
    if (isWin === true) {
      cmd = 'npx mocha -r ts-node/register tests/**/*.test.ts'; // '.\\node_modules\\.bin\\mocha.cmd';
    } else {
      if (nodeMajor <= 6) {
        cmd = '$(which node) $(which mocha) -r ts-node/register tests/**/*.test.ts';
      } else {
        cmd = 'npx mocha -r ts-node/register tests/**/*.test.ts';
      }

    }
    require('child_process').exec(cmd, function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
  grunt.registerTask('append_map_es6', function () {
    var file = 'scratch/es6/js/node_string_breaker.min.js';
    var strMap = '\n//# sourceMappingURL=node_string_breaker.js.map';
    appendToFile(file, strMap);
  });
  grunt.registerTask('es6', [
    'clean:dirs',
    'clean:js',
    'shell:tsces6',
    'replace:es6_utf16',
    'terser:main',
    'append_map_es6',
    'replace:es6_map',
    'copy:es6',
    'remove_comments:es6_js'
  ]);
  grunt.registerTask('build', [
    'env:build',
    /*
     * Task clean: dirs
     * clean the folder out from any previous build
     */
    'clean:dirs',
    'clean:files',
    /*
     * Task tslint
     * check the ts files for any lint issues
     */
    'tslint',
    /*
     * Task shell: tsc
     * run tsc, outputs to /lib
     */
    'shell:tsc',
    'remove_comments:js',
    /**
     * Task shell: prettier
     * Runs prettier from package.json
     */
    // 'prettier:format_js',
    // 'uglify:js',
    'copy:d'
  ]);
  // #region git
  grunt.registerTask('gitver', [
    'gitveradd',
    'gitvercommit',
    'gitvertag',
    'gitverpush'
  ]);

  grunt.registerTask('gitveradd', 'run git add', function () {
    var command = 'git add .';
    grunt.log.writeln("Executing command:" + command);
    var done = this.async();
    require('child_process').exec(command, function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
  grunt.registerTask('gitvercommit', 'run git commit', function () {
    var command = 'git commit -m "' + process.env.VERSION + '"';
    grunt.log.writeln("Executing command:" + command);
    var done = this.async();
    require('child_process').exec(command, function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
  grunt.registerTask('gitvertag', 'run git tag', function () {
    var command = 'git tag v' + process.env.VERSION;
    grunt.log.writeln("Executing command:" + command);
    var done = this.async();
    require('child_process').exec(command, function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
  grunt.registerTask('gitverpush', 'run git push', function () {
    var command = 'git push origin && git push --tag';
    grunt.log.writeln("Executing command:" + command);
    var done = this.async();
    require('child_process').exec(command, function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
  // #endregion
  // #region Version
  grunt.registerTask('bumpBuild', 'Bump version build level', function () {
    var ver = bumpVerson('build');
    grunt.log.writeln('Current Version', ver);
  });
  grunt.registerTask('bumpMinor', 'Bump version minor level', function () {
    var ver = bumpVerson('minor');
    grunt.log.writeln('Current Version', ver);
  });
  grunt.registerTask('bumpMajor', 'Bump version minor level', function () {
    var ver = bumpVerson('major');
    grunt.log.writeln('Current Version', ver);
  });
  // #endregion
  // #region docs
  grunt.registerTask('gen_docs', 'Build Docs', function () {
    var done = this.async();
    grunt.log.writeln('Building Docs');
    // var cmd = 'typedoc --out docs ./src --mode modules --theme minimal';
    var cmd = 'typedoc --out docs ./src --mode modules';
    require('child_process').exec(cmd, function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });
  grunt.registerTask('docs', [
    'clean:docs',
    'gen_docs'
  ]);
  // #endregion
};
