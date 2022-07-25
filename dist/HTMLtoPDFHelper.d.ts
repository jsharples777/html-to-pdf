export declare type PDFConfigElement = {
    x: number;
    y: number;
    w?: number;
    h?: number;
    font?: string;
    fontStyle?: string;
    fontSize?: number;
    text: string;
    image?: {
        fileName: string;
        format: string;
    };
    imageBase64?: string;
    fillColour?: number;
};
export declare type PDFConfigPage = {
    pageElements: PDFConfigElement[];
    backgroundImage?: {
        fileName: string;
        format: string;
    };
};
export declare type PDFConfig = {
    fileName: string;
    defaultFont?: string;
    defaultFontSize?: number;
    pages: PDFConfigPage[];
};
declare type PDFInfo = {
    lineSpacingInMM: number;
    maxCharactersPerLineOfText: number;
    cumulativeContentHeight: number;
    pageCount: number;
    currentIndent: number;
    indentLevel: number;
    fontStack: FontStackItem[];
    listStack: ListStackItem[];
};
declare type FontStackItem = {
    element: any | null;
    fontName: string;
    fontSize: number;
    fontStyle: string;
};
declare type ListStackItem = {
    element: any;
    isNumbered: boolean;
    itemCount: number;
};
export declare type HTMLtoPDFConfig = {
    margins?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    idents?: {
        list?: number;
        listItem?: number;
    };
    fonts?: {
        defaultFont?: string;
        defaultFontSize?: number;
        codeFont?: string;
        lineSpacing?: number;
    };
    headingsIncreaseFontSize?: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
    };
};
declare type HTMLtoPDFConfigInternal = {
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    idents: {
        list: number;
        listItem: number;
    };
    fonts: {
        defaultFont: string;
        defaultFontSize: number;
        codeFont: string;
        lineSpacing: number;
    };
    headingsIncreaseFontSize: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
    };
};
export declare class HTMLtoPDFHelper {
    static MM_PER_FONT_POINT: number;
    static TOP_MARGIN: number;
    static LEFT_MARGIN: number;
    static BOTTOM_MARGIN: number;
    static RIGHT_MARGIN: number;
    static DEFAULT_INDENT: number;
    static DEFAULT_LIST_ITEM_INDENT: number;
    static DEFAULT_FONT: string;
    static CODE_ELEMENT_FONT: string;
    static DEFAULT_FONT_SIZE: number;
    static DEFAULT_LINE_SPACING: number;
    private static a4Dimensions;
    private static H1_FONT_SIZE_CHANGE;
    private static H2_FONT_SIZE_CHANGE;
    private static H3_FONT_SIZE_CHANGE;
    private static H4_FONT_SIZE_CHANGE;
    private static H5_FONT_SIZE_CHANGE;
    private static H6_FONT_SIZE_CHANGE;
    private static _instance;
    static getDefaultConfig(): HTMLtoPDFConfigInternal;
    protected static mergeSuppliedConfigWithDefaultConfig(suppliedConfig: HTMLtoPDFConfig | null): HTMLtoPDFConfigInternal;
    private constructor();
    static getInstance(): HTMLtoPDFHelper;
    static wrapLine(line: string, maxCharacterLength: number): string[];
    protected computeElementHeight(config: HTMLtoPDFConfigInternal, element: any, pdfInfo: PDFInfo): number;
    protected addElementToPDF(config: HTMLtoPDFConfigInternal, element: any, page: PDFConfigPage, pdfInfo: PDFInfo): void;
    protected postAddElementToPDF(config: HTMLtoPDFConfigInternal, element: any, pdfInfo: PDFInfo): void;
    protected preAddElementToPDF(config: HTMLtoPDFConfigInternal, element: any, pdfInfo: PDFInfo): void;
    protected convertElementToPDF(config: HTMLtoPDFConfigInternal, parentElement: any | null, element: any, pdfConfig: PDFConfig, pdfInfo: PDFInfo): void;
    convertHTMLtoPDF(suppliedConfig: HTMLtoPDFConfig | null, html: string): Promise<{
        pdfConfig: PDFConfig;
        pdfInfo: PDFInfo;
    }>;
}
export {};
