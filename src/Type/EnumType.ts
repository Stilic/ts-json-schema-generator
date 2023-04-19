import { BaseType } from "./BaseType";
import { LiteralType } from "./LiteralType";
import { NullType } from "./NullType";

export type EnumValue = string | boolean | number | null;

export type EnumMember = {
    name: string;
    value: EnumValue;
};

export class EnumType extends BaseType {
    private types: BaseType[];

    public constructor(private id: string, private members: readonly EnumMember[]) {
        super();
        this.types = members.map((member) => (member.value == null ? new NullType() : new LiteralType(member.value)));
    }

    public getId(): string {
        return this.id;
    }

    public getMembers(): readonly EnumMember[] {
        return this.members;
    }

    public getValues(): readonly EnumValue[] {
        return this.members.map((member) => member.value);
    }

    public getTypes(): BaseType[] {
        return this.types;
    }
}
