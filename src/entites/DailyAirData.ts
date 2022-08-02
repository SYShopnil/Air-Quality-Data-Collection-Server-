import { IsAlpha, IsDefined, IsEmpty } from "class-validator"
import {
    BaseEntity,
    Column, 
    CreateDateColumn, 
    Entity, 
    JoinColumn, 
    ManyToOne, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn
} from "typeorm"
import {Agency} from "./Agency"


@Entity({
    name: "dailyAirData"
})
export class DailyAirData  extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: "dataId",
        type: "integer"
    })
    public dataId!: number //col -1

    @ManyToOne ((type) => Agency, (agency) => agency.dailyData, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "publishedBy"
    })
    @IsDefined({
        message: "Published by required!!!"
    })
    public publishedBy!: Agency //col -2 

    @Column({
        type: "varchar",
        length: 100,
        name: "area"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Area required!!!"
    })
    @IsAlpha()
    public area !: string //col - 3 

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "latitude"
    })
    @IsDefined({
        message: "latitude missing!!!"
    })
    @IsAlpha()
    public latitude!: number //col - 4 

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "longitude"
    })
    @IsDefined({
        message: "longitude missing!!!"
    })
    @IsAlpha()
    public longitude!: number //col - 5

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "median"
    })
    @IsDefined({
        message: "Median missing!!!"
    })
    @IsAlpha()
    public median !: number //col - 6

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "mean"
    })
    @IsDefined({
        message: "Mean missing!!!"
    })
    @IsAlpha()
    public mean !: number //col-7 

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "max"
    })
    @IsDefined({
        message: "Max value missing!!!"
    })
    @IsAlpha()
    public max !: number //col - 8 

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "count"
    })
    @IsDefined({
        message: "Count value missing!!!"
    })
    @IsAlpha()
    public count !: number //col - 9 

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "sum"
    })
    @IsDefined({
        message: "Sum value missing!!!"
    })
    @IsAlpha()
    public sum !: number //col - 10 

    @Column({
        name: "publishedDate",
        type: "datetime"
    })
    public publishedDate !: string //col - 11

    @CreateDateColumn({
        name: "createAt"
    })
    public createAt!: string //col - 12

    @UpdateDateColumn({
        name: "updateAt"
    })
    public updateAt !: string //col - 13

    @Column({
        type: "boolean",
        name: "isDelete",
        default: false
    })
    @IsAlpha()
    public isDelete !: boolean //col - 14
}   