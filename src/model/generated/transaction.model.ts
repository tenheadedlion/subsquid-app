import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Account} from "./account.model"

@Entity_()
export class Transaction {
    constructor(props?: Partial<Transaction>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    account!: Account

    @Index_()
    @Column_("int4", {nullable: false})
    nonce!: number

    @Column_("bool", {nullable: false})
    result!: boolean

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("int4", {nullable: false})
    timestamp!: number
}
