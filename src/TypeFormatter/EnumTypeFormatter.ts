import { Definition } from "../Schema/Definition";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { BaseType } from "../Type/BaseType";
import { EnumType } from "../Type/EnumType";
import { typeName } from "../Utils/typeName";
import { uniqueArray } from "../Utils/uniqueArray";

export class EnumTypeFormatter implements SubTypeFormatter {
    public supportsType(type: EnumType): boolean {
        return type instanceof EnumType;
    }
    public getDefinition(type: EnumType): Definition {
        const members = uniqueArray(type.getMembers());
        const type = typeName(members[0].value);

        // NOTE: We want to use "const" when referencing an enum member.
        // However, this formatter is used both for enum members and enum types,
        // so the side effect is that an enum type that contains just a single
        // value is represented as "const" too.
        return members.length === 1
            ? { type: type, const: members[0].value }
            : {
                  type: type,
                  oneOf: members.map((member) => {
                      return { title: member.name, const: member.value };
                  }),
              };
    }
    public getChildren(type: EnumType): BaseType[] {
        return [];
    }
}
