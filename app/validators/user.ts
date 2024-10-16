import vine from '@vinejs/vine'

export const createUser = vine.compile(
    vine.object({
        fullname: vine.string(),
        email: vine.string().email().unique(async (db, value) => {
            const user = await db.from('public.user')
                .where('email', value)
                .first()
            return !user
        }),
        password: vine.string(),
        access: vine.array(
            vine.string()
        ).notEmpty().distinct()
    })
)

export const updateUser = vine.compile(
    vine.object({
        fullname: vine.string().optional(),
        email: vine.string().email().unique(async (db, value, field) => {
            const user = await db.from('public.user')
                .where('email', value)
                .andWhereNot('id', field.meta.userId)
                .first()
            return !user
        }).optional(),
        password: vine.string().optional(),
        access: vine.array(
            vine.string()
        ).notEmpty().distinct()
    })
)

export const login = vine.compile(
    vine.object({
        email: vine.string().email(),
        password: vine.string()
    })
)