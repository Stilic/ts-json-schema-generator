import ts from "typescript";
import { Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { EnumMember, EnumType, EnumValue } from "../Type/EnumType";
import { isNodeHidden } from "../Utils/isHidden";
import { getKey } from "../Utils/nodeKey";

export class EnumNodeParser implements SubNodeParser {
    public constructor(protected typeChecker: ts.TypeChecker) {}

    public supportsNode(node: ts.EnumDeclaration | ts.EnumMember): boolean {
        return node.kind === ts.SyntaxKind.EnumDeclaration || node.kind === ts.SyntaxKind.EnumMember;
    }
    public createType(node: ts.EnumDeclaration | ts.EnumMember, context: Context): BaseType {
        return new EnumType(
            `enum-${getKey(node, context)}`,
            (node.kind === ts.SyntaxKind.EnumDeclaration ? node.members.slice() : [node])
                .filter((member: ts.EnumMember) => !isNodeHidden(member))
                .map((member, index) => {
                    return {
                        name: member.name.getText(),
                        value: this.getMemberValue(member, index),
                    } as EnumMember;
                })
        );
    }

    protected getMemberValue(member: ts.EnumMember, index: number): EnumValue {
        const constantValue = this.typeChecker.getConstantValue(member);
        if (constantValue !== undefined) {
            return constantValue;
        }

        const initializer: ts.Expression | undefined = member.initializer;
        if (!initializer) {
            return index;
        } else if (initializer.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
            return (member.name as ts.Identifier).getText();
        } else {
            return this.parseInitializer(initializer);
        }
    }
    protected parseInitializer(initializer: ts.Node): EnumValue {
        if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
            return true;
        } else if (initializer.kind === ts.SyntaxKind.FalseKeyword) {
            return false;
        } else if (initializer.kind === ts.SyntaxKind.NullKeyword) {
            return null;
        } else if (initializer.kind === ts.SyntaxKind.StringLiteral) {
            return (initializer as ts.LiteralLikeNode).text;
        } else if (initializer.kind === ts.SyntaxKind.ParenthesizedExpression) {
            return this.parseInitializer((initializer as ts.ParenthesizedExpression).expression);
        } else if (initializer.kind === ts.SyntaxKind.AsExpression) {
            return this.parseInitializer((initializer as ts.AsExpression).expression);
        } else if (initializer.kind === ts.SyntaxKind.TypeAssertionExpression) {
            return this.parseInitializer((initializer as ts.TypeAssertion).expression);
        } else {
            return initializer.getText();
        }
    }
}
