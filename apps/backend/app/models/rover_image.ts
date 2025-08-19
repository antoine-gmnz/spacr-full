import { BaseModel, column, belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import Rover from "./rover.js";

export default class RoverImage extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare sol: number

    @column()
    declare camera: string

    @column()
    declare img_src: string

    @column()
    declare roverId: number
    
    @belongsTo(() => Rover)
    declare rover: BelongsTo<typeof Rover>

    @column()
    declare title: string

    @column()
    declare credits: string
}