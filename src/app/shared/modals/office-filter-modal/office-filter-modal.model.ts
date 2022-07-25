// Node for to-do item
export class TodoItemNode {
    children: TodoItemNode[];
    item: string;
    groupOfficeId: number;
    groupOfficeCode: string;
    groupDefinitionId: number;
    groupDefinitionType: string;
}

// Flat to-do item node with expandable and level information
export class TodoItemFlatNode {
    item: string;
    level: number;
    expandable: boolean;
    groupOfficeId: number;
    groupOfficeCode: string;
    groupDefinitionId: number;
    groupDefinitionType: string;
}