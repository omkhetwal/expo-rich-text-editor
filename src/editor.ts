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
            font-size: 16px;
        }

        p {
            margin: 0 0 16px 0;
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

        .content[contenteditable] {
            -webkit-user-select: text;
            user-select: text;
        }

        .disabled-select {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -khtml-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
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
            var currentHtml = '';

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

            var Actions = {
                changeHtml: function () {
                    currentHtml = contentEditor.innerHTML;
                    sendAction('changeHtml', currentHtml);
                },
                changeHeight: function () {
                    var newHeight = Math.max(contentEditor.scrollHeight, contentEditor.offsetHeight);
                    if (height !== newHeight) {
                        height = newHeight;
                        textareaEditor.style.height = newHeight + 'px';
                        sendAction('changeHeight', newHeight);
                    }
                },
                setHtml: function (newHtml) {
                    if (currentHtml !== newHtml) {
                        contentEditor.innerHTML = newHtml;
                        textareaEditor.value = newHtml;
                        Actions.changeHeight();
                    }
                },
                setColor: function (color) {
                    contentEditor.style.color = color;
                    textareaEditor.style.color = color;
                    Actions.changeHeight();
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
                    Actions.changeHeight();
                },
                setFontSize: function (fontSize) {
                    document.body.style.fontSize = (fontSize || 16) + 'px';
                    Actions.changeHeight();
                },
                setDisabled: function (disabled) {
                    contentEditor.contentEditable = !disabled;
                    textareaEditor.disabled = disabled;
                    if (disabled) {
                        document.body.classList.add('disabled-select');
                    } else {
                        document.body.classList.remove('disabled-select');
                    }
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
