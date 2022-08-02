import {
    Entity,
    BaseEntity,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn
} from  "typeorm"
import {
    IsAlpha,
    IsBoolean,
    IsDefined,
    isEmail,
    IsEmail,
    IsEmpty,
    isEmpty,
    IsOptional,
    Matches,
    Max,
    Min
} from "class-validator"

import {AirData} from "./AirData"
import {DailyAirData} from "./DailyAirData"


@Entity ({name: "agency"})
export class Agency extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "integer"
    })
    public agentID!: number //col - 1

    @Column({
        type: "varchar",
        length: 25,
        name: "name"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Name required!!!"
    })
    @IsAlpha()
    public name!: string //col - 2

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
    public area !: string  //col - 3

    @Column({
        type: "varchar",
        length: 100,
        name: "district"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "District required!!!"
    })
    @IsAlpha()
    public district !: string //col - 4
    
    @Column({
        type: "varchar",
        length: 100,
        name: "division"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Division required!!!"
    })
    @IsAlpha()
    public division !: string //col - 5

    @Column({
        type: "varchar",
        length: 100,
        name: "country"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Country required!!!"
    })
    @IsAlpha()
    public country !: string //col - 6
    
    @Column({
        type: "varchar",
        length: 100,
        name: "titlePic"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Title picture required!!!"
    })
    @IsAlpha()
    public titlePic !: string //col - 7
    
    @Column({
        type: "varchar",
        length: 100,
        name: "coverPic"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Cover pic picture required!!!"
    })
    @IsAlpha()
    public coverPic !: string //col - 8

    @Column({
        type: "varchar",
        length: 100,
        name: "motive"
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Bio required!!!"
    })
    @IsAlpha()
    public motive !: string  //col - 9

    @Column({
        type: "varchar",
        length: 100,
        name: "password"
    })
    @IsEmpty({
        always: true,
        message: "Password required!!!"
    })
    @IsDefined()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {message: "Password pattern not match"})
    public password !: string  //col - 10

    @Column({
        type: "varchar",
        length: 50
    })
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Email required!!!"
    })
    @IsAlpha()
    @Matches( /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, {message: "Email pattern not match"})
    @IsEmail({}, { message: 'Invalid email message' })
    public email !: string  //col - 11

    @Column({
        type: "varchar",
        length: 4,
        default: ""
    })
    @IsAlpha()
    @Max(4)
    @Min(4)
    public otp !: string  //col - 12

    @OneToMany((type) => AirData, (airData) => airData.publishedBy)
    public uploadData !: AirData[] 

    @OneToMany((type) => DailyAirData, (dailyAirData) => dailyAirData.publishedBy)
    public dailyData !: DailyAirData[] 

    @Column({
        type: "boolean",
        default: false
    })
    @IsBoolean({message: "Is Delete will be Boolean"})
    public isDelete !: string  //col - 13

    @Column({
        type: "boolean",
        default: true
    })
    @IsBoolean({message: "Is Active will be Boolean"})
    public isActive !: string   //col - 14

    @CreateDateColumn({
        name: "createAt"
    })
    public createAt !: string  //col - 15

    @UpdateDateColumn({
        name: "updateAt"
    })
    public updateAt !: string //col - 16
}