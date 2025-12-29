export interface MindMapNode {
    key: number;
    text: string;
    reference: string;
    name: string;
    description: string;
    parent?: number;
    brush?: string;
    dir?: string;
    loc?: string;
}
