const {Parser} = require('htmlparser2')
const {DomHandler,ChildNode} = require('domhandler');
//import {DomHandler} from "domhandler";

export type PDFConfigElement = {
    x: number,
    y: number,
    w?: number,
    h?: number,
    font?: string,
    fontStyle?: string,
    fontSize?: number,
    text: string,
    image?: {
        fileName: string,
        format: string
    },
    imageBase64?: string,
    fillColour?: number
}

export type PDFConfigPage = {
    pageElements: PDFConfigElement[],
    backgroundImage?: {
        fileName: string,
        format: string
    },
}

export type PDFConfig = {
    fileName: string,
    defaultFont?: string,
    defaultFontSize?: number
    pages: PDFConfigPage[]
}


type PDFInfo = {
    lineSpacingInMM: number;
    maxCharactersPerLineOfText: number;
    cumulativeContentHeight: number;
    pageCount: number;
    currentIndent: number;
    indentLevel: number;
    fontStack: FontStackItem[];
    listStack: ListStackItem[]
}

type FontStackItem = {
    element: any | null,
    fontName: string,
    fontSize: number,
    fontStyle: string
}

type ListStackItem = {
    element: any,
    isNumbered: boolean,
    itemCount: number
}

export type HTMLtoPDFConfig = {
    //pageSize:string,
    margins?: {
        top?: number,
        bottom?: number,
        left?: number,
        right?: number
    },
    idents?: {
        list?: number,
        listItem?: number,
    },
    fonts?: {
        defaultFont?: string,
        defaultFontSize?: number,
        codeFont?: string,
        lineSpacing?: number,
    },
    headingsIncreaseFontSize?: {
        h1: number,
        h2: number,
        h3: number,
        h4: number,
        h5: number,
        h6: number,
    }
}

type HTMLtoPDFConfigInternal = {
    //pageSize:string,
    margins: {
        top: number,
        bottom: number,
        left: number,
        right: number
    },
    idents: {
        list: number,
        listItem: number,
    },
    fonts: {
        defaultFont: string,
        defaultFontSize: number,
        codeFont: string,
        lineSpacing: number,
    },
    headingsIncreaseFontSize: {
        h1: number,
        h2: number,
        h3: number,
        h4: number,
        h5: number,
        h6: number,
    }
}

export class HTMLtoPDFHelper {
    public static MM_PER_FONT_POINT = 0.3527777778;
    public static TOP_MARGIN = 10;
    public static LEFT_MARGIN = 10;
    public static BOTTOM_MARGIN = 10;
    public static RIGHT_MARGIN = 10;
    public static DEFAULT_INDENT = 10;
    public static DEFAULT_LIST_ITEM_INDENT = 5;
    public static DEFAULT_FONT = 'Helvetica'
    public static CODE_ELEMENT_FONT = 'Courier'
    public static DEFAULT_FONT_SIZE = 10;
    public static DEFAULT_LINE_SPACING = 0.2;
    private static a4Dimensions: number[] = [210, 297];

    private static H1_FONT_SIZE_CHANGE = 14;
    private static H2_FONT_SIZE_CHANGE = 12;
    private static H3_FONT_SIZE_CHANGE = 10;
    private static H4_FONT_SIZE_CHANGE = 8;
    private static H5_FONT_SIZE_CHANGE = 6;
    private static H6_FONT_SIZE_CHANGE = 4;


    private static _instance: HTMLtoPDFHelper;

    public static getDefaultConfig(): HTMLtoPDFConfigInternal {
        const result: HTMLtoPDFConfigInternal = {
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

        }
        return result;
    }

    protected static mergeSuppliedConfigWithDefaultConfig(suppliedConfig: HTMLtoPDFConfig | null): HTMLtoPDFConfigInternal {
        const defaultConfig = HTMLtoPDFHelper.getDefaultConfig();
        if (suppliedConfig) {
            if (suppliedConfig.fonts) {
                if (suppliedConfig.fonts.defaultFont) defaultConfig.fonts.defaultFont = suppliedConfig.fonts.defaultFont;
                if (suppliedConfig.fonts.defaultFontSize) defaultConfig.fonts.defaultFontSize = suppliedConfig.fonts.defaultFontSize;
                if (suppliedConfig.fonts.codeFont) defaultConfig.fonts.codeFont = suppliedConfig.fonts.codeFont;
                if (suppliedConfig.fonts.lineSpacing) defaultConfig.fonts.lineSpacing = suppliedConfig.fonts.lineSpacing;
            }

            if (suppliedConfig.idents) {
                if (suppliedConfig.idents.list) defaultConfig.idents.list = suppliedConfig.idents.list;
                if (suppliedConfig.idents.listItem) defaultConfig.idents.listItem = suppliedConfig.idents.listItem;
            }

            if (suppliedConfig.margins) {
                if (suppliedConfig.margins.top) defaultConfig.margins.top = suppliedConfig.margins.top;
                if (suppliedConfig.margins.bottom) defaultConfig.margins.bottom = suppliedConfig.margins.bottom;
                if (suppliedConfig.margins.left) defaultConfig.margins.left = suppliedConfig.margins.left;
                if (suppliedConfig.margins.right) defaultConfig.margins.right = suppliedConfig.margins.right;
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


    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
    }

    public static getInstance(): HTMLtoPDFHelper {
        if (!(HTMLtoPDFHelper._instance)) {
            HTMLtoPDFHelper._instance = new HTMLtoPDFHelper();
        }
        return HTMLtoPDFHelper._instance;
    }

    public static wrapLine(line: string, maxCharacterLength: number): string[] {
        let lines: string[] = [];
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
                } else {
                    // line components too long
                    done = true;
                    // wrap the remainder of the line
                    let lineRemainder: string[] = [];
                    for (let index2 = index; index2 < lineComponents.length; index2++) {
                        lineRemainder.push(lineComponents[index2]);
                    }
                    const restOfLine = lineRemainder.join(' ');
                    lines.push(newLine + '');
                    const additionalLines = HTMLtoPDFHelper.wrapLine(restOfLine, maxCharacterLength);
                    additionalLines.forEach((additionalLine) => {
                        lines.push(additionalLine);
                    })
                }
            }
        } else {
            lines.push(line);
        }
        return lines;

    }

    protected computeElementHeight(config: HTMLtoPDFConfigInternal, element: any, pdfInfo: PDFInfo): number {
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
                default: {
                    break;
                }
            }
        }
        else if (element.type === 'text') {
                const currentFontStackItem = pdfInfo.fontStack[0];
                height = HTMLtoPDFHelper.MM_PER_FONT_POINT * currentFontStackItem.fontSize;
                const text: string = element.data;
                const isInListItem = (pdfInfo.listStack.length > 0);
                if (text) {
                    if (text.length >= pdfInfo.maxCharactersPerLineOfText) {
                        const lines = HTMLtoPDFHelper.wrapLine(text, pdfInfo.maxCharactersPerLineOfText);
                        if (isInListItem) {
                            height = height * (lines.length - 1);
                        } else {
                            height = height * lines.length;
                        }

                    } else {
                        if (isInListItem) height = 0;
                    }

                } else {
                    height = 0;
                }


        }
        return height;
    }

    protected addElementToPDF(config: HTMLtoPDFConfigInternal, element: any, page: PDFConfigPage, pdfInfo: PDFInfo): void {
        const currentFontStackItem = pdfInfo.fontStack[0];
        const currentFontSize = currentFontStackItem.fontSize;

        if (element.type === 'tag') {
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
                    } else {
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
                case 'HR': {
                    pdfInfo.cumulativeContentHeight += 3;
                    page.pageElements.push({
                        x: config.margins.left,
                        y: pdfInfo.cumulativeContentHeight,
                        w: (HTMLtoPDFHelper.a4Dimensions[0] - config.margins.left - config.margins.right),
                        h: 1,
                        text: '',
                        fillColour: 0
                    })
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

                        } else {
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
                } else {
                    if (!isInListItem) pdfInfo.cumulativeContentHeight += height;
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

    protected postAddElementToPDF(config: HTMLtoPDFConfigInternal, element: any, pdfInfo: PDFInfo): void {
        switch (element.type.trim().toUpperCase()) {
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
        // remove the last font stack item
        pdfInfo.fontStack.shift();
    }

    protected preAddElementToPDF(config: HTMLtoPDFConfigInternal, element: any, pdfInfo: PDFInfo): void {
        let stackItem: FontStackItem;
        if (element.type === 'tag') {

            switch (element.name.trim().toUpperCase()) {
                case 'H1': {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H2': {
                    const currentActiveItem = pdfInfo.fontStack[0];

                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H3': {
                    const currentActiveItem = pdfInfo.fontStack[0];

                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H4': {
                    const currentActiveItem = pdfInfo.fontStack[0];

                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H5': {
                    const currentActiveItem = pdfInfo.fontStack[0];

                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'H6': {
                    const currentActiveItem = pdfInfo.fontStack[0];

                    stackItem = {
                        fontStyle: '',
                        fontSize: config.fonts.defaultFontSize + config.headingsIncreaseFontSize.h1,
                        fontName: config.fonts.defaultFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'CODE': {
                    const currentActiveItem = pdfInfo.fontStack[0];

                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: config.fonts.codeFont,
                        element
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    break;
                }
                case 'STRONG': {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: 'Bold',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element

                    }
                    break;
                }
                case 'OL': {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element

                    }
                    const listStackItem: ListStackItem = {
                        element: element,
                        isNumbered: true,
                        itemCount: 0
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    pdfInfo.listStack.unshift(listStackItem);
                    break;
                }
                case 'UL': {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element

                    }
                    const listStackItem: ListStackItem = {
                        element: element,
                        isNumbered: false,
                        itemCount: 0
                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    pdfInfo.listStack.unshift(listStackItem);
                    break;
                }
                case 'LI': {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: '',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element

                    }
                    if (currentActiveItem.fontStyle !== '') {
                        stackItem.fontStyle = currentActiveItem.fontStyle;
                    }
                    const currentListItem = pdfInfo.listStack[0];
                    currentListItem.itemCount++;
                    break;
                }
                case 'EM': {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: 'Oblique',
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element

                    }
                    break;
                }
                default: {
                    const currentActiveItem = pdfInfo.fontStack[0];
                    stackItem = {
                        fontStyle: currentActiveItem.fontStyle,
                        fontSize: currentActiveItem.fontSize,
                        fontName: currentActiveItem.fontName,
                        element

                    }

                    break;
                }
            }


        }
        else {
            const currentActiveItem = pdfInfo.fontStack[0];
            stackItem = {
                fontStyle: currentActiveItem.fontStyle,
                fontSize: currentActiveItem.fontSize,
                fontName: currentActiveItem.fontName,
                element

            }
        }
        if (stackItem) {
            pdfInfo.fontStack.unshift(stackItem);
        }
    }


    protected convertElementToPDF(config: HTMLtoPDFConfigInternal, parentElement: any | null, element: any, pdfConfig:PDFConfig, pdfInfo: PDFInfo): void {
        if (element) {
            if (pdfInfo.pageCount === 0) {
                pdfInfo.pageCount = 1;
                pdfConfig.pages.push({
                    pageElements:[]
                })
            }
            const elementHeight = this.computeElementHeight(config, element, pdfInfo);

            let currentPage = pdfConfig.pages[pdfConfig.pages.length - 1];

            if ((pdfInfo.cumulativeContentHeight + elementHeight) >= (HTMLtoPDFHelper.a4Dimensions[1] - config.margins.bottom)) {
                pdfInfo.pageCount++;
                currentPage = {
                    pageElements:[]
                }
                pdfConfig.pages.push(currentPage);
                pdfInfo.cumulativeContentHeight = config.margins.top;
            }
            this.preAddElementToPDF(config, element, pdfInfo);
            this.addElementToPDF(config, element, currentPage, pdfInfo);

            if (element.children) {
                element.children.forEach((child: any) => {
                    this.convertElementToPDF(config, element, child, pdfConfig, pdfInfo);
                });
            }
            this.postAddElementToPDF(config, element, pdfInfo);
        }
    }

    public convertHTMLtoPDF(suppliedConfig: HTMLtoPDFConfig | null, html: string): Promise<{ pdfConfig: PDFConfig, pdfInfo: PDFInfo }> {
        return new Promise((resolve, reject) => {
            const config = HTMLtoPDFHelper.mergeSuppliedConfigWithDefaultConfig(suppliedConfig);
            const handler = new DomHandler((err: any, dom: any) => {
                if (err) {
                    reject(err);
                } else {
                    const pdfConfig:PDFConfig = {
                        pages:[],
                        defaultFont:config.fonts.defaultFont,
                        defaultFontSize: config.fonts.defaultFontSize,
                        fileName:''
                    }
                    const pdfInfo: PDFInfo = {
                        lineSpacingInMM: config.fonts?.defaultFontSize * HTMLtoPDFHelper.MM_PER_FONT_POINT * (1 + config.fonts?.lineSpacing),
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
                    }
                    dom.forEach((element:any) => {
                        this.convertElementToPDF(config, null, element, pdfConfig, pdfInfo);
                    })

                    resolve({pdfConfig, pdfInfo});
                }


            });

            const parser = new Parser(handler);
            parser.write(html);
            parser.end();
        });
    }
}
