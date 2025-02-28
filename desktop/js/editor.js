/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */

"use strict"

if (!jeeFrontEnd.editor) {
  jeeFrontEnd.editor = {
    hashRoot: 'l1_',
    _elfInstance: null,
    init: function() {
      window.jeeP = this
      this._elfInstance = null
    },
    setCommandCreatewidget: function(options) {
      $('#bt_getHelpPage').attr('data-page','widgets')
      //initiate widget options modal:
      $("#md_widgetCreate").dialog({
        closeText: '',
        autoOpen: false,
        modal: true,
        height: 280,
        width: 300,
        open: function() {
          $("body").css({overflow: 'hidden'})
        },
        beforeClose: function(event, ui) {
          $("body").css({overflow: 'inherit'})
        }
      })

      //button create inside options modal:
      $('#bt_widgetCreate').off('click').on('click', function() {
        if (document.getElementById('sel_widgetSubtype').value == '') {
          $.fn.showAlert({message: '{{Le sous-type ne peut être vide}}', level: 'danger'})
          return
        }
        if (document.getElementById('in_widgetName').value == '') {
          $.fn.showAlert({message: '{{Le nom ne peut être vide}}', level: 'danger'})
          return
        }
        var name = 'cmd.'+document.getElementById('sel_widgetType').value+'.'+document.getElementById('sel_widgetSubtype').value+'.'+document.getElementById('in_widgetName').value+'.html'
        var filePath = 'data/customTemplates/' + document.getElementById('sel_widgetVersion').value + '/'
        jeedom.createFile({
          path: filePath,
          name: name,
          error: function(error) {
            $.fn.showAlert({message: error.message, level: 'danger'})
          },
          success: function() {
            $("#md_widgetCreate").dialog('close')
            $.fn.showAlert({message: '{{Fichier enregistré avec succès}}', level: 'success'})
            var hash = jeeP.getHashFromPath(filePath.replace('data/customTemplates/', '').replace('/', ''))
            jeeFrontEnd.editor._elfInstance.exec('open', hash)
            //jeeFrontEnd.editor._elfInstance.exec('reload')

            var path = filePath.replace('data/customTemplates/', '') + name
            hash = jeeP.getHashFromPath(path)
            setTimeout(function() {
              jeeFrontEnd.editor._elfInstance.exec('edit', hash)
            }, 350)
          }
        })
      })

      //new custom command in elfinder:
      elFinder.prototype._options.commands.push('jee_createWidget')
      options.uiOptions.toolbar.push(['jee_createWidget'])

      elFinder.prototype.commands.jee_createWidget = function() {
        this.init = function() {
            this.title = this.fm.i18n("{{Créer un Widget}}")
        }
        this.exec = function(hashes) {
          $('#md_widgetCreate').dialog({title: "{{Options}}"}).dialog('open')
          $('#sel_widgetType').trigger('change')

          $("#md_widgetCreate").keydown(function (event) {
              if (event.keyCode == $.ui.keyCode.ENTER) {
                  $('#bt_widgetCreate').trigger('click')
              }
          })
          return $.Deferred().done()
        }
        this.getstate = function() {
          return 0
        }
      }

      return options
    },
    setCommandCustom: function(options) {
      $('#bt_getHelpPage').attr('data-page', 'custom')
      //new custom command in elfinder:
      elFinder.prototype._options.commands.push('jee_onoffcustom')
      options.uiOptions.toolbar.push(['jee_onoffcustom'])
      elFinder.prototype.commands.jee_onoffcustom = function() {
        this.init = function() {
          this.title = null
          this.textOn = '{{Activé}}'
          this.titleOn = '{{Personnalisation avancée active}}'
          this.textOff = '{{Désactivé}}'
          this.titleOff = '{{Personnalisation avancée inactive}}'
          if (jeephp2js.customActive == '1') {
            this.config = 1
          } else {
            this.config = 0
          }
          this.getActive()
        }
        this.exec = function(hashes) {
          this.config = 1-this.config
          //save config:
          jeedom.config.save({
            configuration: {
              'enableCustomCss': this.config.toString()
            },
            error: function(error) {
              $.fn.showAlert({
                message: error.message,
                level: 'danger'
              })
              this.config = 1-this.config
            },
            success: function(data) {
              $.fn.showAlert({
                message: '{{Configutation sauvegardée}}',
                level: 'success'
              })
            }
          })
          this.getActive()
          return $.Deferred().done()
        }
        this.getActive = function() {
          var myClass = ''
          var myIcon = ''
          var $button = $('#elfinder .elfinder-button-icon-jee_onoffcustom + .elfinder-button-text')
          try { $button.closest('.ui-state-default.tooltipstered').tooltipster('destroy') } catch (error) {}
          if (this.config == 1) {
            myClass = 'btn-warning'
            myIcon = ' <i class="fas fa-toggle-on"></i>'
            $button.attr('title', this.titleOn).text(this.textOn)
          } else {
            myClass = 'btn-success'
            myIcon = ' <i class="fas fa-toggle-off"></i>'
            $button.attr('title', this.titleOff).text(this.textOff)
          }
          $button.removeClass('btn-success btn-warning')
            .addClass(myClass)
            .append(myIcon)
        }
        this.getstate = function() {
          return 0
        }
      }
      return options
    },
    killTooltips: function() {
      setTimeout(function() {
      try {
        $('.elfinder-workzone .tooltipstered').tooltipster('destroy')
      } catch(error) {}
      try {
        $('.elfinder-workzone [title]').removeAttr('title')
      } catch(error) {}
      }, 500)
    },
    getHashFromPath: function(_path) {
      return 'l1_' + btoa(_path).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.').replace(/\.+$/, '')
    }
  }
}

jeeFrontEnd.editor.init()

$(function() {
  CodeMirror.modeURL = "3rdparty/codemirror/mode/%N/%N.js"



  var options = {
    url: 'core/php/editor.connector.php?root='+root,
    baseUrl: '3rdparty/elfinder/',
    cssAutoLoad: false,
    lang: jeeFrontEnd.language.substring(0, 2),
    startPathHash: jeeP.hashRoot,
    rememberLastDir: false,
    defaultView: 'list',
    sound: false,
    sort: 'kindDirsFirst',
    sortDirect: 'kindDirsFirst',
    mimesCanMakeEmpty: {
      "text/css": "css",
      "text/html": "html",
      "text/javascript": "js",
      "application/javascript": "js",
      "text/plain": "txt",
      "text/x-php": "php"
    },
    contextmenu: {
      cwd: ['reload', 'back', '|', 'upload', 'mkdir', 'mkfile', 'paste', '|', 'info'],
      files: ['cmdedit', 'edit', '|', 'rename' ,'|', 'getfile' , 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|','rm', '|', 'archive', 'extract', '|', 'info', 'places']
    },
    fancyDateFormat: 'Y-m-d H:i',
    dateFormat: 'Y-m-d H:i',
    timeFormat: 'H:i',
    uiOptions: {
      toolbar: [
        ['back', 'forward'],
        ['reload', 'sort'],
        ['home', 'up'],
        ['mkdir', 'mkfile', 'upload','download'],
        ['info'],
        ['copy', 'cut', 'paste'],
        ['edit','duplicate', 'rename', 'rm'],
        ['extract', 'archive'],
        ['search'],
        ['view'],
        ['preference']
      ]
    },
    handlers: {
      dblclick: function(event, elfinderInstance)
      {
        elfinderInstance.exec('edit')
        return false
      },
      init: function(event, elfinderInstance)
      {
        if (jeephp2js.editorType == 'custom') {
          elfinderInstance._commands.jee_onoffcustom.getActive()
        }
        jeeP.killTooltips()
      },
      open: function(event, elfinderInstance)
      {
        jeeP.killTooltips()
      },
    },
    commandsOptions: {
      edit: {
        editors: [
          {
            //mimes : ['text/html', 'text/javascript', 'application/javascript'],
            //exts  : ['htm', 'html', 'xhtml', 'js'],
            info : {
              name : '{{Editer}}'
            },
            load : function(textarea) {
              self = this
              var elfinderInstance = $('#elfinder').elfinder(options).elfinder('instance')
              var fileUrl = elfinderInstance.url(self.file.hash)
              fileUrl = fileUrl.replace('/core/php/../../', '')
              var $modal = $(textarea).closest('.ui-front')
              $modal.find('.elfinder-dialog-title').html(fileUrl)

              this.myCodeMirror = CodeMirror.fromTextArea(textarea, {
                styleActiveLine: true,
                lineNumbers: true,
                lineWrapping: true,
                matchBrackets: true,
                autoRefresh: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
              })
              var editor = this.myCodeMirror

              //Auto mode set:
              var info, m, mode, spec;
              if (!info) {
                info = CodeMirror.findModeByMIME(self.file.mime);
              }
              if (!info && (m = self.file.name.match(/.+\.([^.]+)$/))) {
                info = CodeMirror.findModeByExtension(m[1]);
              }
              if (info) {
                mode = info.mode
                spec = info.mime
                editor.setOption('mode', spec)
                CodeMirror.autoLoadMode(editor, mode)
              }

              //is python ?
              if (self.file.mime == 'text/x-python') {
                self.myCodeMirror.setOption('mode', {
                    name: "python",
                    version: 3,
                    singleLineStringErrors: false
                  }
                )
                self.myCodeMirror.setOption('indentUnit', 4)
                self.myCodeMirror.setOption('smartIndent', false)
              }

              $(".cm-s-default").style('height', '100%', 'important')
              editor.setOption('theme', 'monokai')

              $modal.width('75%').css('left', '15%')

              //expand on resize modal:
              $('.elfinder-dialog-edit').resize(function() {
                editor.refresh()
              })

              setTimeout(function() {
                editor.scrollIntoView({line:0, char:0}, 20)
                editor.setOption("extraKeys", {
                  "Ctrl-Y": cm => CodeMirror.commands.foldAll(cm),
                  "Ctrl-I": cm => CodeMirror.commands.unfoldAll(cm)
                })

              }, 250)
            },
            close : function(textarea, instance) {
              //this.myCodeMirror = null
            },
            save : function(textarea, editor) {
              textarea.value = this.myCodeMirror.getValue()
              jeeP.killTooltips()
              //this.myCodeMirror = null
            }
          }
        ]
      },
    }
  }

  //custom editor settings:
  if (jeephp2js.editorType != '') {
    //remove places in toolbar:
    options.ui = ['toolbar', 'tree', 'path', 'stat']

    if (jeephp2js.editorType == 'widget') {
      options = jeeP.setCommandCreatewidget(options)
      options.url = 'core/php/editor.connector.php?type=widget'
      options.startPathHash = jeeP.getHashFromPath('data/customTemplates')
    }

    if (jeephp2js.editorType == 'custom') {
      options = jeeP.setCommandCustom(options)
      options.url = 'core/php/editor.connector.php?type=custom'
      options.startPathHash = jeeP.getHashFromPath('desktop/custom')
    }
  }

  jeeP._elfInstance = $('#elfinder').elfinder(options).elfinder('instance')

  $('#elfinder').css("height", $(window).height() - 50)
  $('.ui-state-default.elfinder-navbar.ui-resizable').css('height', '100%')
})

//resize explorer in browser window:
$(window).resize(function() {
  $('#elfinder').css("width", $(window).width())
  $('#elfinder').css("height", $(window).height() - 50)
})