"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLtoPDFHelper = void 0;
const { Parser } = require('htmlparser2');
const { DomHandler, ChildNode } = require('domhandler');
class HTMLtoPDFHelper {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
    }
    static getDefaultConfig() {
        const result = {
            margins: {
                top: HTMLtoPDFHelper.TOP_MARGIN,
                bottom: HTMLtoPDFHelper.BOTTOM_MARGIN,
                left: HTMLtoPDFHelper.LEFT_MARGIN,
                right: HTMLtoPDFHelper.RIGHT_MARGIN
            },
            idents: {
                list: HTMLtoPDFHelper.DEFAULT_INDENT,
                listItem: HTMLtoPDFHelper.DEFAULT_LIST_ITEM_INDENT,
            },
            fonts: {
                defaultFont: HTMLtoPDFHelper.DEFAULT_FONT,
                defaultFontSize: HTMLtoPDFHelper.DEFAULT_FONT_SIZE,
                codeFont: HTMLtoPDFHelper.CODE_ELEMENT_FONT,
                lineSpacing: HTMLtoPDFHelper.DEFAULT_LINE_SPACING,
            },
            headingsIncreaseFontSize: {
                h1: HTMLtoPDFHelper.H1_FONT_SIZE_CHANGE,
                h2: HTMLtoPDFHelper.H2_FONT_SIZE_CHANGE,
                h3: HTMLtoPDFHelper.H3_FONT_SIZE_CHANGE,
                h4: HTMLtoPDFHelper.H4_FONT_SIZE_CHANGE,
                h5: HTMLtoPDFHelper.H5_FONT_SIZE_CHANGE,
                h6: HTMLtoPDFHelper.H6_FONT_SIZE_CHANGE,
            }
        };
        return result;
    }
    static mergeSuppliedConfigWithDefaultConfig(suppliedConfig) {
        const defaultConfig = HTMLtoPDFHelper.getDefaultConfig();
        if (suppliedConfig) {
            if (suppliedConfig.fonts) {
                if (suppliedConfig.fonts.defaultFont)
                    defaultConfig.fonts.defaultFont = suppliedConfig.fonts.defaultFont;
                if (suppliedConfig.fonts.defaultFontSize)
                    defaultConfig.fonts.defaultFontSize = suppliedConfig.fonts.defaultFontSize;
                if (suppliedConfig.fonts.codeFont)
                    defaultConfig.fonts.codeFont = suppliedConfig.fonts.codeFont;
                if (suppliedConfig.fonts.lineSpacing)
                    defaultConfig.fonts.lineSpacing = suppliedConfig.fonts.lineSpacing;
            }
            if (suppliedConfig.idents) {
                if (suppliedConfig.idents.list)
                    defaultConfig.idents.list = suppliedConfig.idents.list;
                if (suppliedConfig.idents.listItem)
                    defaultConfig.idents.listItem = suppliedConfig.idents.listItem;
            }
            if (suppliedConfig.margins) {
                if (suppliedConfig.margins.top)
                    defaultConfig.margins.top = suppliedConfig.margins.top;
                if (suppliedConfig.margins.bottom)
                    defaultConfig.margins.bottom = suppliedConfig.margins.bottom;
                if (suppliedConfig.margins.left)
                    defaultConfig.margins.left = suppliedConfig.margins.left;
                if (suppliedConfig.margins.right)
                    defaultConfig.margins.right = suppliedConfig.margins.right;
            }
            if (suppliedConfig.headingsIncreaseFontSize) {
                defaultConfig.headingsIncreaseFontSize.h1 = suppliedConfig.headingsIncreaseFontSize.h1;
                defaultConfig.headingsIncreaseFontSize.h2 = suppliedConfig.headingsIncreaseFontSize.h2;
                defaultConfig.headingsIncreaseFontSize.h3 = suppliedConfig.headingsIncreaseFontSize.h3;
                defaultConfig.headingsIncreaseFontSize.h4 = suppliedConfig.headingsIncreaseFontSize.h4;
                defaultConfig.headingsIncreaseFontSize.h5 = suppliedConfig.headingsIncreaseFontSize.h5;
                defaultConfig.headingsIncreaseFontSize.h6 = suppliedConfig.headingsIncreaseFontSize.h6;
            }
        }
        return defaultConfig;
    }
    static getInstance() {
        if (!(HTMLtoPDFHelper._instance)) {
            HTMLtoPDFHelper._instance = new HTMLtoPDFHelper();
        }
        return HTMLtoPDFHelper._instance;
    }
    static wrapLine(line, maxCharacterLength) {
        let lines = [];
        if (line.length > maxCharacterLength) {
            let newLine = '';
            // try to find the space closest to the end
            const lineComponents = line.split(' ');
            let done = false;
            let index = 0;
            while ((index <= lineComponents.length) && (!done)) {
                if ((newLine.length + lineComponents[index].length + 1) < maxCharacterLength) {
                    newLine += `${lineComponents[index]} `;
                    index++;
                }
                else {
                    // line components too long
                    done = true;
                    // wrap the remainder of the line
                    let lineRemainder = [];
                    for (let index2 = index; index2 < lineComponents.length; index2++) {
                        lineRemainder.push(lineComponents[index2]);
                    }
                    const restOfLine = lineRemainder.join(' ');
                    lines.push(newLine + '');
                    const additionalLines = HTMLtoPDFHelper.wrapLine(restOfLine, maxCharacterLength);
                    additionalLines.forEach((additionalLine) => {
                        lines.push(additionalLine);
                    });
                }
            }
        }
        else {
            lines.push(line);
        }
        return lines;
    }
    computeElementHeight(config, element, pdfInfo) {
        let height = 0;
        if (element.type === 'tag') {
            switch (element.name.trim().toUpperCase()) {
                case 'H1': {
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1);
                    break;
                }
                case 'H2': {
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h2);
                    break;
                }
                case 'H3': {
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h3);
                    break;
                }
                case 'H4': {
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h4);
                    break;
                }
                case 'H5': {
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h5);
                    break;
                }
                case 'H6': {
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * (config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h6);
                    break;
                }
                case 'HR': {
                    height = 1;
                    break;
                }
                case 'BR': {
                    const currentFontStackItem = pdfInfo.fontStack[0];
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize * 0.5;
                }
                case 'P': {
                    const currentFontStackItem = pdfInfo.fontStack[0];
                    height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize;
                }
                default: {
                    break;
                }
            }
        }
        else if (element.type === 'text') {
            const currentFontStackItem = pdfInfo.fontStack[0];
            height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize;
            const text = element.data;
            const isInListItem = (pdfInfo.listStack.length > 0);
            if (text) {
                if (text.length >= pdfInfo.maxCharactersPerLineOfText) {
                    const lines = HTMLtoPDFHelper.wrapLine(text, pdfInfo.maxCharactersPerLineOfText);
                    if (isInListItem) {
                        height = height * (lines.length - 1);
                    }
                    else {
                        height = height * lines.length;
                    }
                }
                else {
                    if (isInListItem)
                        height = 0;
                }
            }
            else {
                height = 0;
            }
        }
        return height;
    }
    addElementToPDF(config, element, page, pdfInfo) {
        const currentFontStackItem = pdfInfo.fontStack[0];
        const currentFontSize = currentFontStackItem.fontSize;
        if (element.type === 'tag') {
            console.log(element.name);
            switch (element.name.trim().toUpperCase()) {
                case 'OL':
                case 'UL': {
                    pdfInfo.currentIndent += config.idents.list;
                    pdfInfo.indentLevel++;
                    break;
                }
                case 'LI': {
                    const listStackItem = pdfInfo.listStack[0];
                    const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize;
                    pdfInfo.cumulativeContentHeight += height;
                    if (listStackItem.isNumbered) {
                        page.pageElements.push({
                            text: `${listStackItem.itemCount}.`,
                            x: pdfInfo.currentIndent,
                            y: pdfInfo.cumulativeContentHeight,
                            font: currentFontStackItem.fontName,
                            fontSize: currentFontStackItem.fontSize,
                            fontStyle: currentFontStackItem.fontStyle
                        });
                    }
                    else {
                        page.pageElements.push({
                            text: '\u2022',
                            x: pdfInfo.currentIndent,
                            y: pdfInfo.cumulativeContentHeight,
                            font: currentFontStackItem.fontName,
                            fontSize: currentFontStackItem.fontSize,
                            fontStyle: currentFontStackItem.fontStyle
                        });
                    }
                    pdfInfo.currentIndent += config.idents.listItem;
                    break;
                }
                case 'BR': {
                    const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize * 0.5;
                    pdfInfo.cumulativeContentHeight += height;
                    break;
                }
                case 'P': {
                    const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize;
                    pdfInfo.cumulativeContentHeight += height;
                    break;
                }
                case 'HR': {
                    pdfInfo.cumulativeContentHeight += 3;
                    page.pageElements.push({
                        x: config.margins.left,
                        y: pdfInfo.cumulativeContentHeight,
                        w: (HTMLtoPDFHelper.a4Dimensions[0] - config.margins.left - config.margins.right),
                        h: 1,
                        text: '',
                        fillColour: 0
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        }
        else if (element.type === 'text') {
            const text = element.data;
            const height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontSize;
            const isInListItem = (pdfInfo.listStack.length > 0);
            if (text) {
                if (text.length >= pdfInfo.maxCharactersPerLineOfText) {
                    const lines = HTMLtoPDFHelper.wrapLine(text, pdfInfo.maxCharactersPerLineOfText);
                    lines.forEach((line, index) => {
                        if ((index === 0) && (isInListItem)) {
                        }
                        else {
                            pdfInfo.cumulativeContentHeight += height;
                        }
                        page.pageElements.push({
                            text: line,
                            x: pdfInfo.currentIndent,
                            y: pdfInfo.cumulativeContentHeight,
                            font: currentFontStackItem.fontName,
                            fontSize: currentFontStackItem.fontSize,
                            fontStyle: currentFontStackItem.fontStyle
                        });
                    });
                }
                else {
                    if (!isInListItem)
                        pdfInfo.cumulativeContentHeight += height;
                    page.pageElements.push({
                        text: text,
                        x: pdfInfo.currentIndent,
                        y: pdfInfo.cumulativeContentHeight,
                        font: currentFontStackItem.fontName,
                        fontSize: currentFontStackItem.fontSize,
                        fontStyle: currentFontStackItem.fontStyle
                    });
                }
            }
        }
    }
    postAddElementToPDF(config, element, pdfInfo) {
        if (element.type === 'tag') {
            switch (element.name.trim().toUpperCase()) {
                case 'OL':
                case 'UL': {
                    pdfInfo.currentIndent -= config.idents.list;
                    pdfInfo.indentLevel--;
                    pdfInfo.listStack.shift();
                    break;
                }
                case 'LI': {
                    pdfInfo.currentIndent -= config.idents.listItem;
                    break;
                }
                default: {
                    break;
                }
            }
        }
        // remove the last font stack item
        pdfInfo.fontStack.shift();
    }
    preAddElementToPDF(config, element, pdfInfo) {
        const currentActiveItem = pdfInfo.fontStack[0];
        let stackItem = {
            fontStyle: currentActiveItem.fontStyle,
            fontSize: currentActiveItem.fontSize,
            fontName: currentActiveItem.fontName,
            element
        };
        if (element.type === 'tag') {
            switch (element.name.trim().toUpperCase()) {
                case 'H1': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H2': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h2,
                        fontName: config.fonts.defaultFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H3': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h3,
                        fontName: config.fonts.defaultFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H4': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h4,
                        fontName: config.fonts.defaultFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H5': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h5,
                        fontName: config.fonts.defaultFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H6': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h6,
                        fontName: config.fonts.defaultFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'CODE': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: config.fonts.codeFont,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'STRONG': {
                    stackItem = {
                        fontStyle: 'Bold',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element
                    };
                    break;
                }
                case 'OL': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element
                    };
                    const listStackItem = {
                        element: element,
                        isNumbered: true,
                        itemCount: 0
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    pdfInfo.listStack.unshift(listStackItem);
                    break;
                }
                case 'UL': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element
                    };
                    const listStackItem = {
                        element: element,
                        isNumbered: false,
                        itemCount: 0
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    pdfInfo.listStack.unshift(listStackItem);
                    break;
                }
                case 'LI': {
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element
                    };
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    const currentListItem = pdfInfo.listStack[0];
                    currentListItem.itemCount++;
                    break;
                }
                case 'EM': {
                    stackItem = {
                        fontStyle: 'Oblique',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element
                    };
                    break;
                }
                default: {
                    break;
                }
            }
        }
        pdfInfo.fontStack.unshift(stackItem);
    }
    convertElementToPDF(config, parentElement, element, pdfConfig, pdfInfo) {
        if (element) {
            if (pdfInfo.pageCount === 0) {
                pdfInfo.pageCount = 1;
                pdfConfig.pages.push({
                    pageElements: []
                });
            }
            const elementHeight = this.computeElementHeight(config, element, pdfInfo);
            let currentPage = pdfConfig.pages[pdfConfig.pages.length - 1];
            if ((pdfInfo.cumulativeContentHeight + elementHeight) >= (HTMLtoPDFHelper.a4Dimensions[1] - config.margins.bottom)) {
                pdfInfo.pageCount++;
                currentPage = {
                    pageElements: []
                };
                pdfConfig.pages.push(currentPage);
                pdfInfo.cumulativeContentHeight = config.margins.top;
            }
            this.preAddElementToPDF(config, element, pdfInfo);
            this.addElementToPDF(config, element, currentPage, pdfInfo);
            if (element.children) {
                element.children.forEach((child) => {
                    this.convertElementToPDF(config, element, child, pdfConfig, pdfInfo);
                });
            }
            this.postAddElementToPDF(config, element, pdfInfo);
        }
    }
    convertHTMLtoPDF(suppliedConfig, html) {
        return new Promise((resolve, reject) => {
            const config = HTMLtoPDFHelper.mergeSuppliedConfigWithDefaultConfig(suppliedConfig);
            const handler = new DomHandler((err, dom) => {
                var _a, _b;
                if (err) {
                    reject(err);
                }
                else {
                    const pdfConfig = {
                        pages: [],
                        defaultFont: config.fonts.defaultFont,
                        defaultFontSize: config.fonts.defaultFontSize,
                        fileName: ''
                    };
                    const pdfInfo = {
                        lineSpacingInMM: ((_a = config.fonts) === null || _a === void 0 ? void 0 : _a.defaultFontSize) * HTMLtoPDFHelper.MM_PER_FONT_POINT * (1 + ((_b = config.fonts) === null || _b === void 0 ? void 0 : _b.lineSpacing)),
                        maxCharactersPerLineOfText: 2 * Math.floor((HTMLtoPDFHelper.a4Dimensions[0] - (config.margins.left + config.margins.right)) / (config.fonts.defaultFontSize * HTMLtoPDFHelper.MM_PER_FONT_POINT)),
                        cumulativeContentHeight: config.margins.top,
                        pageCount: 0,
                        currentIndent: config.margins.left,
                        indentLevel: 0,
                        fontStack: [{
                                fontName: config.fonts.defaultFont,
                                fontSize: config.fonts.defaultFontSize,
                                fontStyle: '',
                                element: null
                            }],
                        listStack: []
                    };
                    dom.forEach((element) => {
                        this.convertElementToPDF(config, null, element, pdfConfig, pdfInfo);
                    });
                    resolve({ pdfConfig, pdfInfo });
                }
            });
            const parser = new Parser(handler);
            parser.write(html);
            parser.end();
        });
    }
}
exports.HTMLtoPDFHelper = HTMLtoPDFHelper;
HTMLtoPDFHelper.MM_PER_FONT_POINT = 0.3527777778;
HTMLtoPDFHelper.TOP_MARGIN = 10;
HTMLtoPDFHelper.LEFT_MARGIN = 10;
HTMLtoPDFHelper.BOTTOM_MARGIN = 10;
HTMLtoPDFHelper.RIGHT_MARGIN = 10;
HTMLtoPDFHelper.DEFAULT_INDENT = 10;
HTMLtoPDFHelper.DEFAULT_LIST_ITEM_INDENT = 5;
HTMLtoPDFHelper.DEFAULT_FONT = 'Helvetica';
HTMLtoPDFHelper.CODE_ELEMENT_FONT = 'Courier';
HTMLtoPDFHelper.DEFAULT_FONT_SIZE = 10;
HTMLtoPDFHelper.DEFAULT_LINE_SPACING = 0.2;
HTMLtoPDFHelper.a4Dimensions = [210, 297];
HTMLtoPDFHelper.H1_FONT_SIZE_CHANGE = 14;
HTMLtoPDFHelper.H2_FONT_SIZE_CHANGE = 12;
HTMLtoPDFHelper.H3_FONT_SIZE_CHANGE = 10;
HTMLtoPDFHelper.H4_FONT_SIZE_CHANGE = 8;
HTMLtoPDFHelper.H5_FONT_SIZE_CHANGE = 6;
HTMLtoPDFHelper.H6_FONT_SIZE_CHANGE = 4;
//# sourceMappingURL=HTMLtoPDFHelper.js.map