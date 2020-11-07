export const HTML = `<!DOCTYPE html>
<html>

<head>
    <title>editor</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="user-scalable=1.0,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
    <style>
        * {
            outline: 0px solid transparent;
            -webkit-tap-highlight-color: #000000;
            -webkit-touch-callout: none;
            -webkit-overflow-scrolling: touch;
        }

        html,
        body {
            flex: 1;
            outline: 0;
            padding: 0;
            margin: 0;
            font-family: '-apple-system', 'HelveticaNeue', Helvetica, Roboto, Arial,
                sans-serif;
            font-size: 1em;
        }

        p {
            margin: 0 0 1em 0;
        }

        .editor,
        .content,
        .textarea {
            outline: 0;
            padding: 0;
            margin: 0;
            width: 100%;
            border: none;
            background: transparent;
        }

        [contenteditable] {
            -webkit-user-select: text;
            user-select: text;
        }
    </style>
</head>

<body>
    <div class="editor"></div>
    <script>
        (function () {
            var isCode = true;
            var contentEditor = null;
            var textareaEditor = null;
            var isWebView = window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function';
            var height = 0;

            function exec(command, value) {
                return document.execCommand(command, false, value);
            };

            function sendAction(type, data) {
                if (isWebView) {
                    var message = JSON.stringify({ type, data });
                    window.ReactNativeWebView.postMessage(message);
                }
            };

            function log(message) {
                sendAction('log', message);
            };

            function correctValue(value) {
                return value;
            }

            var Actions = {
                changeHtml: function () {
                    sendAction('changeHtml', contentEditor.innerHTML);
                },
                changeHeight: function () {
                    var newHeight = Math.max(contentEditor.scrollHeight, contentEditor.offsetHeight);
                    if (height !== newHeight) {
                        height = newHeight;
                        textareaEditor.style.height = newHeight + 'px';
                        sendAction('changeHeight', newHeight);
                    }
                },
                setHtml: function (html) {
                    const validHtml = correctValue(html);
                    if (contentEditor.innerHTML !== validHtml) {
                        contentEditor.innerHTML = validHtml;
                        textareaEditor.value = contentEditor.innerHTML;
                        Actions.changeHeight();
                    }
                },
                setColor: function (color) {
                    contentEditor.style.color = color;
                    textareaEditor.style.color = color;
                },
                setFontFamily: function (fontFamily) {
                    const [capitalizeFontFamily, weightWithText, fontStyle] = fontFamily.split('_', 3);
                    var familyNames = capitalizeFontFamily.split(/(?=[A-Z])/);
                    var weight = weightWithText.match(/[0-9]+/g)[0];
                    var styleLink = document.getElementById('google-font');
                    if (!styleLink) {
                        styleLink = document.createElement('link');
                        styleLink.id = 'google-font';
                        styleLink.rel = 'stylesheet';
                        document.head.appendChild(styleLink);
                    }
                    styleLink.href = 'https://fonts.googleapis.com/css?family=' + familyNames.join('+') + ':' + weight + '&subset=latin-ext&display=swap';
                    document.body.style.fontFamily = familyNames.join(' ');
                    document.body.style.fontWeight = weight;
                    document.body.style.fontStyle = fontStyle ? fontStyle.toLowerCase() : 'normal';
                },
                setDisabled: function (disabled) {
                    contentEditor.contentEditable = !disabled;
                    textareaEditor.disabled = disabled;
                },
                undo: function () {
                    exec('undo');
                },
                redo: function () {
                    exec('redo');
                },
                bold: function () {
                    exec('bold');
                },
                italic: function () {
                    exec('italic');
                },
                underline: function () {
                    exec('underline');
                },
                orderedList: function () {
                    exec('insertOrderedList');
                },
                unorderedList: function () {
                    exec('insertUnorderedList');
                },
                clear: function () {
                    exec('removeFormat');
                },
                code: function () {
                    isCode = !isCode;
                    if (isCode) {
                        contentEditor.style.display = 'none';
                        textareaEditor.style.display = 'block';
                    } else {
                        contentEditor.style.display = 'block';
                        textareaEditor.style.display = 'none';
                    }
                }
            };
            /* var Actions = {
                
                UPDATE_HEIGHT: function () {
                    
                }
            }; */

            var init = function (element) {
                var defaultParagraphSeparator = 'p';

                var textarea = document.createElement('textarea');
                textarea.className = 'textarea';
                textarea.addEventListener('input', () => {
                    content.innerHTML = textarea.value;
                }, false);
                element.appendChild(textarea);

                var content = document.createElement('div');
                content.contentEditable = true;
                content.spellcheck = false;
                content.autocapitalize = 'off';
                content.autocorrect = 'off';
                content.autocomplete = 'off';
                content.className = 'content';
                content.addEventListener('input', () => {
                    textarea.value = content.innerHTML;
                    Actions.changeHtml();
                    Actions.changeHeight();
                }, false);
                element.appendChild(content);

                exec('defaultParagraphSeparator', defaultParagraphSeparator);

                var onMessage = function (event) {
                    var message = JSON.parse(event.data);
                    var action = Actions[message.type];
                    log(message);
                    if (action) {
                        action(message.data);
                    }
                };

                window.addEventListener('message', onMessage, false);
                document.addEventListener('message', onMessage, false);
                document.addEventListener('touchend', function () {
                    content.focus();
                });

                return [content, textarea];
            };

            var [contentEditor, textareaEditor] = init(document.getElementsByClassName('editor')[0]);

            Actions.code();
            Actions.changeHeight();
            log('initialized');
        })();
    </script>
</body>

</html>`;
