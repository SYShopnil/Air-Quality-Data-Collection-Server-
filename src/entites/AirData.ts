import {
    Entity,
    BaseEntity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from  "typeorm"
import {
    IsAlpha,
    IsBoolean,
    IsDecimal,
    IsEmail,
    isEmpty,
    IsNotEmpty,
    IsObject
} from "class-validator"

import {
    Agency
} from "./Agency"

@Entity ({name: "airData"})
export class AirData extends BaseEntity {
    @PrimaryColumn({
        type: "integer",
        name: "dataId"
    })
    public dataId!: number //col - 1

    @Column({
        type: "varchar",
        length: 250,
        name: "area"
    })
    @IsNotEmpty({
        message: "Area Must need!!"
    })
    @IsAlpha()
    public area !: string  //col - 2

    @Column({
        type: "varchar",
        length: 250
    })
    @IsNotEmpty({
        message: "District missing!!!"
    })
    @IsAlpha()
    public district !: string  //col - 3

    @Column({
        type: "varchar",
        length: 250,
        name: "division"
    })
    @IsNotEmpty({
        message: "Division missing!!!"
    })
    @IsAlpha()
    public division !: string //col - 4

    @Column({
        type: "varchar",
        length: 250,
        name: "country"
    })
    @IsNotEmpty({
        message: "Country missing!!!"
    })
    @IsAlpha()
    public country !: string //col - 5

    @Column({
        type: "varchar",
        length: 50,
        name: "valueOfPM"
    })
    @IsNotEmpty({
        message: "PM 2.5 value missing!!!"
    })
    @IsAlpha()
    public valueOfPM !: string //col - 6
    
    @ManyToOne(() => Agency, (agency) => agency.uploadData, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "publishedBy"
    })
    @IsObject({
        message: "Agency need to be object!!"
    })
    public publishedBy !: Agency  //col - 7


    @Column({
        name: "publishedDate",
    })
    public publishedDate !: string //col - 8

    @Column({
        name: "longitude"
    })
    public longitude !: string  //col - 9

    @Column({
        name: "latitude"
    })
    public latitude !: string //col - 10
    
    @Column({
        name: "isDelete"
    })
    @IsBoolean()
    public isDelete !: string  //col - 11

    @CreateDateColumn({
        name: "createAt"
    })
    public createAt !: string  //col - 12

    @UpdateDateColumn({
        name: "updateAt"
    })
    public updateAt !: string  //col - 13
    
}