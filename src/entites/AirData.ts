import {
    Entity,
    BaseEntity,
    PrimaryColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn
} from  "typeorm"
import {
    IsAlpha,
    IsBoolean,
    IsDecimal,
    IsDefined,
    IsEmail,
    isEmpty,
    IsNotEmpty,
    IsObject,
    IsString
} from "class-validator"

import {
    Agency
} from "./Agency"

@Entity ({name: "airData"})
export class AirData extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "integer",
        name: "dataId"
    })
    public dataId!: number //col - 1

    @Column({
        type: "varchar",
        length: 250,
        name: "division"
    })
    @IsNotEmpty({
        message: "Division missing!!!"
    })
    @IsAlpha()
    public division !: string //col - 2

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "valueOfPM"
    })
    @IsNotEmpty({
        message: "PM 2.5 value missing!!!"
    })
    @IsAlpha()
    public valueOfPM !: number //col - 3
    
    @ManyToOne(() => Agency, (agency) => agency.uploadData, {
        onDelete: "CASCADE"
    })
    @JoinColumn({
        name: "publishedBy"
    })
    @IsObject({
        message: "Agency need to be object!!"
    })
    public publishedBy !: Agency  //col - 4

    @Column({
        name: "publishedDate",
        type: "datetime"
    })
    public publishedDate !: string //col - 5

    
    @Column({
        name: "isDelete",
        default: false,
        type: "boolean"
    })
    @IsBoolean()
    public isDelete !: boolean  //col - 6

    @CreateDateColumn({
        name: "createAt"
    })
    public createAt !: string  //col - 7

    @UpdateDateColumn({
        name: "updateAt"
    })
    public updateAt !: string  //col - 8

    @Column({
        type: "decimal",
        precision: 5,
        scale: 2,
        name: "avgTemp"
    })
    @IsNotEmpty({
        message: "Average Temperature value missing!!!"
    })
    @IsAlpha()
    public avgTemp !: number //col - 9

    @Column({
        type: "decimal",
        precision: 5,
        scale: 2,
        name: "rainPrecipitation"
    })
    @IsNotEmpty({
        message: "Rain Precipitation value missing!!!"
    })
    @IsAlpha()
    public rainPrecipitation !: number //col - 10

    @Column({
        type: "decimal",
        precision: 5,
        scale: 2,
        name: "visibility"
    })
    @IsNotEmpty({
        message: "Visibility value missing!!!"
    })
    @IsAlpha()
    public visibility !: number //col - 11


    @Column({
        type: "decimal",
        precision: 5,
        scale: 2,
        name: "cloudCover"
    })
    @IsNotEmpty({
        message: "Cloud cover value missing!!!"
    })
    @IsAlpha()
    public cloudCover !: number //col - 12

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "relHumidity"
    })
    @IsNotEmpty({
        message: "Relative humidity value missing!!!"
    })
    @IsAlpha()
    public relHumidity !: number //col - 13

   @Column({
        type: "int",
        name: "stationNo"
    })
    @IsNotEmpty({
        message: "Station No  missing!!!"
    })
    @IsAlpha()
    public stationNo !: number //col - 14

    @Column({
        type: "varchar",
        length: 150,
        name: "season"
    })
    @IsString({
        message: "Season must be string!!!"
    })
    @IsDefined({
        message: "Season name required!!!"
    })
    public season!: string //col - 15

    @Column({
        type: "decimal",
        precision: 6,
        scale: 2,
        name: "windSpeed"
    })
    @IsNotEmpty({
        message: "Wind Speed value is missing!!!"
    })
    @IsAlpha()
    public windSpeed !: number //col - 16
}