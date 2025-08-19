import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class ESASpaceTelescopeImage extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare img_src: string

    @column()
    declare esa_id: string

    @column()
    declare img_full_size: string

    @column()
    declare title: string

    @column()
    declare credits: string

    @column()
    declare constellation: string
    
    @column()
    declare fov: string

    @column()
    declare release_date: string

    @column()
    declare type: string
}