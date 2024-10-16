export interface UserInterface {
    id?: number
    fullname?: string
    email?: string
    password?: string
    active?: boolean
    access?: Access[]
    token?: string
}

export interface ParamsUserInterface {
    fullname?: string
    email?: string
    active?: boolean
}

export interface Access {
    userId?: number
    route?: string
    createdBy?: string
}

export interface UsersResponse {
    status?: boolean
    message?: string
    data?: UserInterface[]
}