import { UserInterface } from "./user.js"

export interface ResponseAll {
    status?: boolean
    message?: string
    data?: UserInterface[]
}

export interface ResponseById {
    status?: boolean
    message?: string
    data?: UserInterface
}

export interface ResponseCreate {
    status?: boolean
    message?: string
    data?: number
}

export interface ResponseUpdate {
    status?: boolean
    message?: string
}