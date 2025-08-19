import { BaseModel, column } from "@adonisjs/lucid/orm";

export default class Rover extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare name: string

    @column()
    declare landing_date: Date

    @column()
    declare launch_date: Date

    @column()
    declare status: string

    @column()
    declare max_sol: number

    @column()
    declare max_date: Date
}