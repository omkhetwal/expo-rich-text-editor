import React, { useEffect, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, Platform } from 'react-native';
import RichTextToolbar from './RichTextToolbar';

import { HTML } from './editor';
let htmlSource = require('./editor.html');
if (Platform.OS === 'android' || Platform.OS === 'web') {
    htmlSource = { html: HTML };
}

export default function RichTextEditor(props: { value: string, onValueChange: (value: string) => void, actionMap?: {}, minHeight?: number, editorStyle?: any, toolbarStyle?: any, disabled?: boolean, debug?: boolean }) {
    const editorStyle = StyleSheet.flatten(props.editorStyle);
    const webViewRef = useRef(null);
    const [inited, setInited] = useState(false);
    const [minHeight] = useState(props.minHeight || 0);
    const [height, setHeight] = useState(minHeight);

    const Actions = {
        changeHtml: (html: string) => {
            props.onValueChange(html);
        },
        changeHeight: (h: number) => {
            if (h < minHeight) {
                h = minHeight;
            }
            const offset = editorStyle.padding || 0;
            setHeight(h + offset + 20);
        },
        log: (message: string) => {
            if (props.debug) {
                console.log(message);
            }
        }
    };

    useEffect(() => {
        if (inited) {
            setHTML(props.value);
        }
    }, [inited, props.value]);

    useEffect(() => {
        if (inited && editorStyle) {
            setColor(editorStyle.color);
            setFontFamily(editorStyle.fontFamily);
        }
    }, [inited, editorStyle]);

    useEffect(() => {
        if (inited) {
            setDisabled(!!props.disabled);
        }
    }, [inited, props.disabled]);

    function onMessage(event) {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            const action = Actions[message.type];
            if (action) {
                action(message.data);
            } else {
                console.warn(`Missing Actions.${message.type} method`)
            }
        } catch (e) {
            console.error('onMessage: ', e);
        }
    };

    function sendAction(type: string, data: any = null) {
        let message = JSON.stringify({ type, data });
        if (webViewRef.current) {
            webViewRef.current.postMessage(message);
        }
    }

    function setHTML(html: string) {
        sendAction('setHtml', html);
    }

    function setColor(color: string) {
        if (color) {
            sendAction('setColor', color);
        }
    }

    function setFontFamily(fontFamily: string) {
        if (fontFamily) {
            sendAction('setFontFamily', fontFamily);
        }
    }

    function setDisabled(disabled: boolean) {
        sendAction('setDisabled', disabled);
    }

    function onLoad() {
        setInited(true);
    }

    function onError(syntheticEvent) {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error: ', nativeEvent);
    }

    function onPress(action: string) {
        if (!props.disabled) {
            sendAction(action);
        }
    }

    return (
        <>
            <RichTextToolbar style={[styles.toolbarContainer, props.toolbarStyle]} actionMap={props.actionMap} selectedActions={[]} onPress={onPress} />
            <View style={[styles.editorContainer, editorStyle, { height }]}>
                <WebView ref={webViewRef} source={htmlSource} style={styles.webView} scrollEnabled={false} hideKeyboardAccessoryView={true} keyboardDisplayRequiresUserAction={false} onMessage={onMessage} originWhitelist={['*']} dataDetectorTypes={'none'} bounces={false} onLoad={onLoad} onError={onError} />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    editorContainer: {},
    toolbarContainer: {},
    webView: {
        backgroundColor: 'transparent',
    }
});
